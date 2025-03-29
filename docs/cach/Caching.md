# 缓存机制实现文档

本文档详细介绍 Amazon Frontend 中的缓存机制实现，包括路由段缓存、API 数据缓存策略、客户端本地存储缓存和用户体验优化。

## 目录

1. [概述](#概述)
2. [缓存机制](#缓存机制)
3. [产品列表 API 缓存](#产品列表-api-缓存)
4. [分类统计 API 缓存](#分类统计-api-缓存)
5. [精选商品 API 缓存](#精选商品-api-缓存)
6. [客户端本地存储缓存](#客户端本地存储缓存)
7. [骨架屏与用户体验优化](#骨架屏与用户体验优化)
8. [缓存响应头信息](#缓存响应头信息)
9. [调试与监控](#调试与监控)
10. [最佳实践](#最佳实践)

## 概述

缓存是提高应用性能、减少服务器负载的关键技术。在 Amazon Frontend 中，我们实现了多层缓存策略，以优化数据获取流程，提升用户体验。

我们的缓存设计有以下主要目标：

- **减少对后端 API 的请求频率**：通过缓存结果降低对外部 API 的依赖
- **提供稳定的响应时间**：缓存数据可以在毫秒级别返回，大幅提升页面加载速度
- **保持数据新鲜度**：设置合理的缓存过期时间，确保数据相对新鲜
- **透明的缓存机制**：通过响应头信息提供缓存状态的可见性
- **多层次降级策略**：当某一层缓存失效时，可以平滑降级到其他缓存层
- **优化用户感知体验**：使用骨架屏和渐进式加载提升用户体验

## 缓存机制

我们实现了四层缓存机制，形成完整的缓存体系：

1. **路由段缓存 (Route Segment Caching)**：缓存整个路由处理程序的结果，时间为2分钟至6小时不等
2. **数据获取缓存 (Data Fetching Cache)**：客户端 SWR 缓存，配置30秒内不重复请求
3. **本地存储缓存 (localStorage Cache)**：将数据持久化到浏览器本地存储，默认5分钟
4. **状态共享缓存 (State Sharing)**：组件间共享数据状态，避免重复请求

这些缓存层级从服务器到客户端形成完整链条，并通过自定义头信息和UI指示器增强了缓存可观测性。

## 产品列表 API 缓存

路径：`/api/products/list`

### 实现逻辑

产品列表 API 使用 2 分钟的缓存时间，在保持数据相对新鲜的同时减轻服务器负担：

```typescript
// 配置路由段缓存，缓存整个路由处理程序2分钟
export const revalidate = 120;
```

### 客户端与服务端协作

产品列表 API 通过以下方式协调缓存：

1. **服务端路由缓存**：缓存整个路由处理器结果2分钟
   ```typescript
   // app/api/products/list/route.ts
   export const revalidate = 120;
   ```

2. **服务端外部 API 请求**：使用 axios 请求外部 API 并缓存结果
   ```typescript
   // 直接使用axios请求外部API，避免递归调用自身
   const response = await axios.get(`${API_BASE_URL}/products/list`, {
       params: apiParams,
       headers: { ... }
   });
   ```

3. **错误情况处理**：出错时使用更短的缓存时间
   ```typescript
   const errorCacheTime = Math.floor(revalidate / 4); // 错误情况下缓存时间缩短为正常的1/4
   ```

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

## 客户端本地存储缓存

为了进一步提高性能和降低服务器负载，我们实现了基于 localStorage 的客户端持久化缓存系统。

### 缓存项结构

```typescript
interface CacheItem<T> {
    data: T;            // 缓存的数据
    timestamp: number;  // 创建时间戳
    expiry: number;     // 过期时间戳
}
```

### 关键功能实现

1. **缓存键生成**：基于URL和参数生成唯一缓存键
   ```typescript
   export function generateCacheKey(prefix: string, params: CacheKeyParams): string {
       // 过滤掉undefined和null值
       const filteredParams = Object.entries(params)
           .filter(([_, value]) => value !== undefined && value !== null && value !== '')
           .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
           .map(([key, value]) => `${key}:${value}`)
           .join('|');
       
       return `${prefix}|${filteredParams}`;
   }
   ```

2. **从缓存读取**：检查缓存是否存在并且有效
   ```typescript
   export function getFromCache<T>(key: string, maxAge = 300000): CacheResult<T> {
       if (typeof window === 'undefined') {
           return { hit: false };
       }
       
       try {
           const cacheJson = localStorage.getItem(`cache_${key}`);
           
           if (!cacheJson) {
               return { hit: false };
           }
           
           const cache = JSON.parse(cacheJson) as CacheItem<T>;
           const now = Date.now();
           const age = now - cache.timestamp;
           
           // 检查缓存是否有效
           if (age < maxAge) {
               return {
                   hit: true,
                   data: cache.data,
                   age
               };
           }
           
           // 缓存过期，清除它
           localStorage.removeItem(`cache_${key}`);
           return { hit: false };
       } catch {
           return { hit: false };
       }
   }
   ```

3. **写入缓存**：保存数据并设置过期时间
   ```typescript
   export function writeToCache<T>(key: string, data: T, maxAge = 300000): void {
       if (typeof window === 'undefined') {
           return;
       }
       
       try {
           const cache: CacheItem<T> = {
               data,
               timestamp: Date.now(),
               expiry: Date.now() + maxAge
           };
           
           localStorage.setItem(`cache_${key}`, JSON.stringify(cache));
       } catch {
           // 缓存写入失败时，尝试清理部分缓存
           cleanupCache();
       }
   }
   ```

4. **缓存清理**：自动清理过期和过多的缓存项
   ```typescript
   export function cleanupCache(keepNewest = 50): void {
       // 首先删除过期的缓存项
       // 然后，如果缓存项太多，保留最新的 keepNewest 项
   }
   ```

5. **自动初始化**：应用启动时自动初始化缓存系统
   ```typescript
   export function initCacheSystem(): void {
       if (typeof window === 'undefined') {
           return;
       }
       
       try {
           // 使用 requestIdleCallback 在浏览器空闲时清理缓存
           if ('requestIdleCallback' in window) {
               window.requestIdleCallback(() => {
                   cleanupCache();
               });
           } else {
               // 退回到 setTimeout
               setTimeout(() => {
                   cleanupCache();
               }, 2000);
           }
       } catch {
           // 忽略错误
       }
   }
   ```

### 缓存钩子

为了便于在组件中使用缓存，我们提供了 `useCachedFetch` 钩子：

```typescript
export function useCachedFetch<T>(
    url: string | null,
    params: CacheKeyParams,
    options?: {
        maxAge?: number;
        prefixKey?: string;
        requireUrl?: boolean;
    }
): {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    fromCache: boolean;
} {
    // 实现包括：
    // 1. 先尝试从本地缓存获取数据
    // 2. 如果没有缓存或缓存过期，则发起网络请求
    // 3. 将网络请求结果写入缓存
    // 4. 提供数据加载状态和错误处理
}
```

## 骨架屏与用户体验优化

为提高用户感知性能，我们实现了骨架屏和渐进式加载机制：

### 产品骨架屏组件

```typescript
const ProductSkeleton = () => (
    <div className="relative group h-full">
        <div className="relative h-full flex flex-col overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 animate-pulse">
            {/* 图片骨架 */}
            <div className="relative w-full pt-[100%] bg-gray-200 dark:bg-gray-700" />
            
            {/* 内容区域 */}
            <div className="p-2 sm:p-3 md:p-4 flex-grow flex flex-col">
                {/* 标题骨架 */}
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                
                {/* 价格区域骨架 */}
                <div className="mt-auto pt-1 sm:pt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-0.5 sm:gap-1">
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        </div>
    </div>
);
```

### 分类骨架屏组件

```typescript
const CategorySkeleton = () => (
    <div className="flex flex-wrap gap-2">
        <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="w-28 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="w-18 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    </div>
);
```

### 渐进式加载实现

为避免骨架屏闪烁，我们使用了稳定ID和过渡效果：

```typescript
// 为骨架屏创建稳定ID，避免重新渲染时的闪烁
const skeletonIds = useMemo(() => 
    Array.from({ length: 6 }, () => Math.random().toString(36).substring(2)), 
[]);

// 渲染骨架屏
const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {skeletonIds.map((id) => (
            <ProductSkeleton key={`product-skeleton-${id}`} />
        ))}
    </div>
);
```

### 缓存状态UI指示器

我们在UI中显示缓存状态，增强用户信任度并便于调试：

```typescript
{cacheStatus && (
    <span className="ml-2 text-xs text-gray-500">
        {cacheStatus.isCached ? 
            `(cached, ${cacheStatus.responseTime}ms)` : 
            `(fresh, ${cacheStatus.responseTime}ms)`}
    </span>
)}
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

为了帮助调试和监控，我们在API中添加了自动的缓存命中判断：

```typescript
// 检查是否从缓存返回的响应（通过响应时间判断）
const isCacheHit = responseTime < 50; // 如果响应时间小于50ms，很可能是缓存命中

// 在响应中包含此信息
'X-Cache-Source': isCacheHit ? 'cache-hit' : 'generated'
```

### 元数据反馈

我们在 API 响应中加入了元数据，便于前端了解缓存状态：

```typescript
meta: {
  cached: isCacheHit,        // 是否为缓存命中
  expires: expiresAt.toISOString(), // 缓存过期时间
  responseTime: responseTime        // 响应处理时间
}
```

### 前端缓存状态展示

我们在产品列表页面添加了缓存状态指示器：

```tsx
<p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
    Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{data?.total || directData?.total || 0}</span> products
    {cacheStatus && (
        <span className="ml-2 text-xs text-gray-500">
            {cacheStatus.isCached ? 
                `(cached, ${cacheStatus.responseTime}ms)` : 
                `(fresh, ${cacheStatus.responseTime}ms)`}
        </span>
    )}
</p>
```

## 最佳实践

基于我们的实践经验，以下是关于 Next.js 中实现 API 缓存的最佳实践：

1. **多层缓存策略**：
   - 实现服务端路由缓存、客户端 SWR 缓存和本地存储缓存
   - 根据数据特性选择适当的缓存层级
   - 设计合理的降级策略，当某一层失效时能够平滑过渡

2. **合理设置缓存时间**：
   - 高频变化数据：短缓存（几分钟）
   - 中等变化数据：中等缓存（30分钟到几小时）
   - 低频变化数据：长缓存（6小时到24小时）

3. **随机性与缓存的平衡**：
   - 使用基于时间的确定性随机种子
   - 在服务器端处理随机逻辑
   - 获取数据超集后在服务器端筛选

4. **增强缓存可观测性**：
   - 添加自定义头信息表示缓存状态
   - 包含性能指标和缓存命中信息
   - 在响应中添加元数据
   - 在前端UI中显示缓存状态

5. **错误处理与缓存**：
   - 错误情况下使用较短的缓存时间
   - 在错误响应中也包含缓存状态头信息
   - 使用 stale-while-revalidate 策略提高可用性
   - 实现多层缓存降级确保失败优雅

6. **使用标准与自定义头信息结合**：
   - 标准 `Cache-Control` 头用于 HTTP 缓存控制
   - 自定义 `X-Cache-*` 头用于调试和监控

7. **优化用户感知性能**：
   - 实现骨架屏减少加载过程的空白感
   - 使用稳定ID避免骨架屏闪烁
   - 显示缓存状态提高透明度
   - 渐进式加载首先显示最重要的内容

8. **缓存管理与清理**：
   - 自动清理过期缓存项
   - 限制本地存储缓存数量，避免存储溢出
   - 在浏览器空闲时间执行缓存维护 