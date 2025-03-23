# StoreIdentifier 商店来源标识组件

## 组件概述

`StoreIdentifier` 是一个用于显示商品来源店铺标识的React组件。它能够根据商品URL自动识别商店类型（如Amazon、Walmart、BestBuy等），并展示相应的图标和可选的商店名称。

主要功能：
- 自动识别多种常见电商平台
- 支持纯图标模式或图标+文字模式
- 支持左对齐或右对齐布局
- 可自定义样式和外观

## 目录结构

该组件的相关文件位于 `lib/store` 目录下：

```
lib/store/
├── icons.tsx       # 各商店的SVG图标组件
├── utils.tsx       # 商店识别工具函数
├── StoreIdentifier.tsx  # 主组件
└── index.ts        # 导出文件
```

## 安装和导入

组件已集成在项目中，可以直接导入使用：

```tsx
import { StoreIdentifier } from '@/lib/store';
```

## 属性API

`StoreIdentifier` 组件接受以下属性：

| 属性名     | 类型                | 默认值   | 说明                                    |
|------------|---------------------|----------|---------------------------------------|
| url        | string              | -        | **必填**。商品的URL，用于识别商店来源    |
| showName   | boolean             | true     | 是否显示商店名称文本                    |
| className  | string              | ''       | 自定义CSS类名                          |
| align      | 'left' \| 'right'   | 'left'   | 内容对齐方式                           |

## 使用示例

### 基本用法

```tsx
<StoreIdentifier url="https://www.amazon.com/product/123" />
```

### 只显示图标（不显示文本）

```tsx
<StoreIdentifier 
  url="https://www.amazon.com/product/123" 
  showName={false} 
/>
```

### 右对齐

```tsx
<StoreIdentifier 
  url="https://www.amazon.com/product/123" 
  align="right" 
/>
```

### 自定义样式

```tsx
<StoreIdentifier 
  url="https://www.amazon.com/product/123" 
  className="p-2 bg-gray-100 rounded-md" 
/>
```

### 在商品卡片中使用

```tsx
<div className="relative">
  {/* 商品图片 */}
  <img 
    src={product.image} 
    alt={product.title} 
    className="w-full h-auto"
  />
  
  {/* 右下角显示商店标识 */}
  <div className="absolute right-2 bottom-2">
    <StoreIdentifier
      url={product.url}
      showName={false}
      className="mb-0 bg-white/80 backdrop-blur-sm p-1 rounded-md shadow-sm"
    />
  </div>
</div>
```

## 支持的商店

当前组件支持自动识别以下商店：

1. **Amazon** - 使用专用的Amazon SVG图标
2. **Walmart** - 使用带蓝色背景的通用图标
3. **BestBuy** - 使用带深蓝色背景的通用图标
4. **其他商店** - 根据URL域名自动生成商店名称，使用通用图标

## 高级用法

### 在列表中显示商店标识

对于含有多个商品的列表，可以在每个商品卡片中加入商店标识：

```tsx
{products.map((product) => (
  <div key={product.id} className="product-card">
    <div className="product-image-container">
      <img src={product.image} alt={product.title} />
      <div className="absolute right-2 bottom-2">
        <StoreIdentifier
          url={product.url}
          showName={false}
          className="mb-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-md shadow-sm"
        />
      </div>
    </div>
    <h3>{product.title}</h3>
    <p>${product.price}</p>
  </div>
))}
```

### 添加新的商店图标

如果需要添加新的商店图标，需要修改以下文件：

1. 在 `icons.tsx` 中添加新的SVG图标组件
2. 在 `utils.tsx` 的 `getStoreFromUrl` 函数中添加新的URL识别规则

```tsx
// 在lib/store/icons.tsx中添加
export const NewStoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
    {/* SVG路径 */}
  </svg>
);

// 在lib/store/utils.tsx中添加
if (url.includes('newstore.com')) {
  return {
    name: 'New Store',
    color: '#FF0000', // 商店主题色
    icon: <NewStoreIcon />
  };
}
```

## 注意事项

1. 组件默认添加了 `mb-2` (margin-bottom) 样式，如果需要覆盖此样式，可在 `className` 中添加自己的 margin 类，如 `mb-0`
2. 对于亚马逊和其他商店，图标显示风格略有不同，亚马逊使用专用的大图标，其他商店则使用圆形背景色+小图标的组合
3. 当无法识别商店或URL为空时，组件不会渲染任何内容
4. 组件适用于多种屏幕尺寸，但在极小的容器中可能需要调整

## 自定义主题

组件使用以下Tailwind类名，可以通过自定义Tailwind主题来修改其外观：

- 文本颜色：`text-secondary` 和 `dark:text-gray-400`
- 图标容器背景：各商店的主题色
- 图标文本颜色：`text-white`

## 源码参考

完整的组件源码可以在 `lib/store/StoreIdentifier.tsx` 中查看。 