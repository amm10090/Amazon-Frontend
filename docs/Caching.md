# 缓存机制实现文档

本文档详细介绍 Amazon Frontend 中的缓存机制实现，包括路由段缓存和 API 数据缓存策略。

## 目录

1. [概述](#概述)
2. [缓存机制](#缓存机制)
3. [分类统计 API 缓存](#分类统计-api-缓存)
4. [精选商品 API 缓存](#精选商品-api-缓存)
5. [缓存响应头信息](#缓存响应头信息)
6. [调试与监控](#调试与监控)
7. [最佳实践](#最佳实践)

## 概述

缓存是提高应用性能、减少服务器负载的关键技术。在 Amazon Frontend 中，我们实现了多层缓存策略，以优化数据获取流程，提升用户体验。

我们的缓存设计有以下主要目标：

- **减少对后端 API 的请求频率**：通过缓存结果降低对外部 API 的依赖
- **提供稳定的响应时间**：缓存数据可以在毫秒级别返回，大幅提升页面加载速度
- **保持数据新鲜度**：设置合理的缓存过期时间，确保数据相对新鲜
- **透明的缓存机制**：通过响应头信息提供缓存状态的可见性

## 缓存机制

我们使用 Next.js 内置的缓存功能，实现了两层缓存机制：

1. **路由段缓存 (Route Segment Caching)**：缓存整个路由处理程序的结果
2. **数据获取缓存 (Data Fetching Cache)**：缓存 `fetch()` 请求的数据

此外，我们使用自定义头信息增强了缓存的可观测性，便于调试和监控。

## 分类统计 API 缓存

路径：`/api/categories/stats`

### 实现逻辑

分类统计 API 使用 6 小时的缓存时间，确保数据相对稳定的同时提供足够新鲜的分类统计信息。

```typescript
// 路由段缓存，缓存整个路由处理程序6小时
export const revalidate = 21600;

// fetch 请求缓存
const response = await fetch(apiUrl, {
  // ...
  next: {
    revalidate: 21600 // 6小时缓存
  }
});
```

### 缓存状态头信息

我们在响应中添加了以下自定义头信息：

```typescript
const cacheHeaders = {
  'X-Cache-Config': 'enabled',
  'X-Cache-Revalidate': `${revalidate}`,
  'X-Cache-Revalidate-Unit': 'seconds',
  'X-Cache-Max-Age': `${revalidate}`,
  'X-Cache-Expires': expiresAt.toISOString(),
  'X-Cache-Generated': now.toISOString()
};
```

## 精选商品 API 缓存

路径：`/api/products/featured`

### 缓存时间与优化

精选商品 API 使用 30 分钟的缓存时间，并通过"获取超集后随机筛选"的方式解决随机性和缓存的冲突问题。

```typescript
// 配置路由段缓存，缓存整个路由处理程序30分钟
export const revalidate = 1800;
```

### 随机性与缓存平衡

为了解决随机商品展示与缓存的冲突问题，我们使用了以下策略：

1. **基于时间的确定性随机**：使用当前小时作为随机种子
   ```typescript
   const hourSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + now.getHours();
   ```

2. **获取数据超集后服务端筛选**：
   - 获取固定的50个商品而不是直接使用随机参数请求
   - 在服务端使用确定性随机洗牌算法处理数据
   - 选择需要数量的商品返回给客户端

3. **确定性洗牌算法**：
   ```typescript
   const shuffleWithSeed = (array: Product[], seed: number) => {
     const shuffled = [...array];
     let m = shuffled.length, t, i;
     let currentSeed = seed;
     
     // 使用种子生成确定性随机数
     const random = () => {
       const x = Math.sin(currentSeed++) * 10000;
       return x - Math.floor(x);
     };
     
     // 洗牌算法
     while (m) {
       i = Math.floor(random() * m--);
       t = shuffled[m];
       shuffled[m] = shuffled[i];
       shuffled[i] = t;
     }
     
     return shuffled;
   };
   ```

### 增强的缓存头信息

```typescript
const cacheHeaders = {
  'X-Cache-Config': 'enabled',
  'X-Cache-Revalidate': `${revalidate}`,
  'X-Cache-Revalidate-Unit': 'seconds',
  'X-Cache-Max-Age': `${revalidate}`,
  'X-Cache-Expires': expiresAt.toISOString(),
  'X-Cache-Generated': now.toISOString(),
  'X-Cache-Source': isCacheHit ? 'cache-hit' : 'generated',
  'X-Cache-Random-Seed': `${hourSeed}`,
  'X-Response-Time': `${responseTime}ms`,
  'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600'
};
```

### 性能监控

我们添加了性能监控指标，以便追踪缓存效果：

```typescript
// 记录请求开始时间
const requestStartTime = Date.now();

// 计算响应时间（毫秒）
const responseTime = Date.now() - requestStartTime;

// 检查是否从缓存返回的响应
const isCacheHit = responseTime < 100; // 如果响应时间小于100ms，很可能是缓存命中
```

## 缓存响应头信息

我们使用一系列自定义响应头信息，提高缓存机制的透明度：

| 响应头 | 说明 |
|--------|------|
| `X-Cache-Config` | 缓存配置状态，通常为 "enabled" |
| `X-Cache-Revalidate` | 缓存重新验证的时间间隔（秒） |
| `X-Cache-Revalidate-Unit` | 重新验证时间的单位，通常为 "seconds" |
| `X-Cache-Max-Age` | 缓存的最大生存时间（秒） |
| `X-Cache-Expires` | 缓存过期的具体时间（ISO 格式） |
| `X-Cache-Generated` | 响应生成的时间戳（ISO 格式） |
| `X-Cache-Source` | 响应来源，可能是 "cache-hit" 或 "generated" |
| `X-Cache-Random-Seed` | 用于确定性随机的种子值（精选商品 API） |
| `X-Response-Time` | 服务器处理请求的时间（毫秒） |
| `X-Cache-Error` | 当出现错误时设置为 "true" |

## 调试与监控

### 缓存命中判断

为了帮助调试和监控，我们在精选商品 API 中添加了自动的缓存命中判断：

```typescript
// 检查是否从缓存返回的响应（通过响应时间判断）
const isCacheHit = responseTime < 100; // 如果响应时间小于100ms，很可能是缓存命中

// 在响应中包含此信息
'X-Cache-Source': isCacheHit ? 'cache-hit' : 'generated'
```

### 元数据反馈

我们在 API 响应中加入了元数据，便于前端了解缓存状态：

```typescript
meta: {
  seed: hourSeed,      // 使用的随机种子
  cached: isCacheHit,  // 是否为缓存命中
  expires: expiresAt.toISOString(), // 缓存过期时间
  responseTime: responseTime        // 响应处理时间
}
```

## 最佳实践

基于我们的实践经验，以下是关于 Next.js 中实现 API 缓存的最佳实践：

1. **合理设置缓存时间**：
   - 高频变化数据：短缓存（几分钟）
   - 中等变化数据：中等缓存（30分钟到几小时）
   - 低频变化数据：长缓存（6小时到24小时）

2. **随机性与缓存的平衡**：
   - 使用基于时间的确定性随机种子
   - 在服务器端处理随机逻辑
   - 获取数据超集后在服务器端筛选

3. **增强缓存可观测性**：
   - 添加自定义头信息表示缓存状态
   - 包含性能指标和缓存命中信息
   - 在响应中添加元数据

4. **错误处理与缓存**：
   - 错误情况下使用较短的缓存时间
   - 在错误响应中也包含缓存状态头信息
   - 使用 stale-while-revalidate 策略提高可用性

5. **使用标准与自定义头信息结合**：
   - 标准 `Cache-Control` 头用于 HTTP 缓存控制
   - 自定义 `X-Cache-*` 头用于调试和监控 