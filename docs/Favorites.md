# Amazon Frontend 收藏功能文档（纯本地存储版）

本文档详细介绍了 Amazon Frontend 项目中的收藏功能实现和使用方法，该版本采用纯本地存储实现，不依赖后端API。

## 目录

- [功能概述](#功能概述)
- [数据流程图](#数据流程图)
- [前端组件](#前端组件)
  - [FavoritesProvider](#favoritesprovider)
  - [FavoriteButton](#favoritebutton)
  - [FavoritesList](#favoriteslist)
- [自定义 Hooks](#自定义-hooks)
  - [useFavorites](#usefavorites)
  - [useProductFavorite](#useproductfavorite)
  - [useFavoritesList](#usefavoriteslist)
  - [useMultipleProductsFavoriteStatus](#usemultipleproductsfavoritestatus)
  - [useBatchFavorites](#usebatchfavorites)
- [本地存储](#本地存储)
  - [客户端标识](#客户端标识)
  - [本地收藏存储](#本地收藏存储)
- [集成指南](#集成指南)
  - [添加 Provider](#添加-provider)
  - [使用收藏按钮](#使用收藏按钮)
  - [显示收藏列表](#显示收藏列表)
- [常见问题](#常见问题)

## 功能概述

收藏功能允许用户标记和保存他们感兴趣的商品，以便后续查看。主要功能包括：

- 添加/删除商品收藏
- 查看收藏列表
- 本地存储收藏数据
- 收藏状态同步
- 离线支持

收藏系统采用纯前端本地存储实现，所有操作都直接在浏览器的LocalStorage中完成，无需依赖后端API，确保在网络不佳或离线状态下也能正常使用。

## 数据流程图

```
┌─────────────┐       ┌───────────────┐
│ 用户界面    │       │ 本地存储      │
│ (组件/Hooks)│<─────>│ (LocalStorage)│
└─────────────┘       └───────────────┘
       │
       │
       ▼
┌─────────────┐
│ Context     │
│ Provider    │
└─────────────┘
```

## 前端组件

### FavoritesProvider

`FavoritesProvider` 是收藏功能的核心组件，负责管理收藏状态并提供上下文给其他组件。

**位置**: `lib/favorites/context.tsx`

**使用方法**:

```tsx
// 在应用根组件中包裹
import { FavoritesProvider } from '@/lib/favorites';

function App({ children }) {
  return (
    <FavoritesProvider>
      {children}
    </FavoritesProvider>
  );
}
```

**功能**:
- 管理收藏状态
- 处理添加/删除收藏操作
- 管理本地存储数据
- 提供收藏上下文给其他组件

### FavoriteButton

`FavoriteButton` 是一个可复用的按钮组件，用于添加或删除收藏。

**位置**: `components/common/FavoriteButton.tsx`

**Props**:
- `productId`: 商品ID，必填
- `size`: 按钮大小，可选值 "sm" | "md" | "lg"，默认 "md"
- `withText`: 是否显示文本，默认 false
- `withAnimation`: 是否启用动画效果，默认 true
- `className`: 自定义CSS类名

**使用示例**:

```tsx
import FavoriteButton from '@/components/common/FavoriteButton';

function ProductDetail({ product }) {
  return (
    <div>
      <h1>{product.title}</h1>
      <div className="absolute top-2 right-2">
        <FavoriteButton 
          productId={product.id} 
          size="lg" 
          withAnimation={true}
        />
      </div>
    </div>
  );
}
```

### FavoritesList

`FavoritesList` 用于显示收藏商品列表。

**位置**: `components/favorites/FavoritesList.tsx`

**Props**:
- `limit`: 显示的最大商品数量，默认全部显示
- `showRemoveButton`: 是否显示移除按钮，默认 true
- `emptyMessage`: 收藏为空时显示的信息，默认 "暂无收藏商品"
- `layout`: 布局方式，可选值 "grid" | "list"，默认 "grid"

**使用示例**:

```tsx
import FavoritesList from '@/components/favorites/FavoritesList';

function FavoritesSection() {
  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">我的收藏</h2>
      <FavoritesList 
        limit={4} 
        layout="grid" 
        emptyMessage="您还没有收藏任何商品" 
      />
    </div>
  );
}
```

## 自定义 Hooks

### useFavorites

`useFavorites` 是管理收藏操作的主要 Hook。

**位置**: `lib/favorites/hooks.ts`

**返回值**:
- `favorites`: 收藏商品ID数组
- `isLoading`: 加载状态
- `error`: 错误信息
- `toggleFavorite`: 切换收藏状态的函数
- `addFavorite`: 添加收藏的函数
- `removeFavorite`: 移除收藏的函数
- `isFavorite`: 检查商品是否已收藏的函数
- `clearFavorites`: 清空所有收藏的函数

**使用示例**:

```tsx
import { useFavorites } from '@/lib/favorites';

function ProductActions({ productId }) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(productId);

  return (
    <button
      onClick={() => isFav ? removeFavorite(productId) : addFavorite(productId)}
      className="p-2 rounded"
    >
      {isFav ? '取消收藏' : '收藏商品'}
    </button>
  );
}
```

### useProductFavorite

`useProductFavorite` 提供针对单个商品的收藏状态和操作。

**位置**: `lib/favorites/hooks.ts`

**参数**:
- `productId`: 商品ID

**返回值**:
- `isFavorite`: 商品是否已收藏
- `toggleFavorite`: 切换收藏状态的函数

**使用示例**:

```tsx
import { useProductFavorite } from '@/lib/favorites';

function ProductFavoriteStatus({ productId }) {
  const { isFavorite, toggleFavorite } = useProductFavorite(productId);

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
    >
      ❤
    </button>
  );
}
```

### useFavoritesList

`useFavoritesList` 用于获取和管理收藏商品的完整数据。

**位置**: `lib/favorites/hooks.ts`

**返回值**:
- `favorites`: 收藏商品完整数据数组
- `isLoading`: 加载状态
- `error`: 错误信息
- `refreshFavorites`: 刷新收藏列表的函数

**使用示例**:

```tsx
import { useFavoritesList } from '@/lib/favorites';
import { adaptProducts } from '@/lib/utils';

function FavoritesPage() {
  const { favorites, isLoading, error, refreshFavorites } = useFavoritesList();
  
  // 适配数据为前端组件格式
  const adaptedProducts = adaptProducts(favorites || []);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;
  
  return (
    <div>
      <button onClick={refreshFavorites}>刷新</button>
      <div className="grid grid-cols-3 gap-4">
        {adaptedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### useMultipleProductsFavoriteStatus

`useMultipleProductsFavoriteStatus` 用于获取多个商品的收藏状态。

**位置**: `lib/favorites/hooks.ts`

**参数**:
- `productIds`: 商品ID数组

**返回值**:
- `favoriteStatus`: 收藏状态对象，键为商品ID，值为布尔值表示是否收藏

**使用示例**:

```tsx
import { useMultipleProductsFavoriteStatus } from '@/lib/favorites';

function ProductGrid({ products }) {
  const productIds = products.map(p => p.id);
  const favoriteStatus = useMultipleProductsFavoriteStatus(productIds);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id}>
          {product.title}
          <span>{favoriteStatus[product.id] ? '已收藏' : '未收藏'}</span>
        </div>
      ))}
    </div>
  );
}
```

### useBatchFavorites

`useBatchFavorites` 用于批量操作收藏。

**位置**: `lib/favorites/hooks.ts`

**返回值**:
- `addMultipleFavorites`: 批量添加收藏的函数
- `removeMultipleFavorites`: 批量移除收藏的函数

**使用示例**:

```tsx
import { useBatchFavorites } from '@/lib/favorites';

function BatchActions({ selectedProducts }) {
  const { addMultipleFavorites } = useBatchFavorites();
  const selectedIds = selectedProducts.map(p => p.id);
  
  return (
    <button 
      onClick={() => addMultipleFavorites(selectedIds)}
      disabled={selectedIds.length === 0}
    >
      收藏所选商品
    </button>
  );
}
```

## 本地存储

### 客户端标识

系统使用客户端标识（Client ID）来识别用户设备，作为区分不同用户的标识符。

**位置**: `lib/favorites/storage.ts`

**核心功能**:
- `getClientId`: 获取或生成客户端标识

**存储位置**:
- localStorage: `amazon_frontend_client_id`

**格式**:
- `client_[随机字符串]_[时间戳]`

### 本地收藏存储

系统在本地存储（localStorage）中保存收藏数据，确保在离线状态下也能使用。

**位置**: `lib/favorites/storage.ts`

**核心功能**:
- `getLocalFavorites`: 获取本地存储的收藏列表
- `addLocalFavorite`: 添加商品到本地收藏
- `removeLocalFavorite`: 从本地收藏中移除商品
- `isLocalFavorite`: 检查商品是否在本地收藏中
- `clearLocalFavorites`: 清空本地收藏

**存储位置**:
- localStorage: `amazon_frontend_favorites`

**格式**:
- 商品ID的JSON数组: `["product1", "product2", ...]`

**使用示例**:

```typescript
import { addLocalFavorite, isLocalFavorite, removeLocalFavorite } from '@/lib/favorites';

// 添加商品到本地收藏
function handleFavoriteClick(productId) {
  if (isLocalFavorite(productId)) {
    removeLocalFavorite(productId);
  } else {
    addLocalFavorite(productId);
  }
}
```

## 集成指南

### 添加 Provider

要在应用中使用收藏功能，首先需要在应用顶层添加 `FavoritesProvider`。

```tsx
// app/providers.tsx
import { FavoritesProvider } from '@/lib/favorites';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </ThemeProvider>
  );
}
```

### 使用收藏按钮

在商品卡片或详情页面中添加收藏按钮。

```tsx
// components/common/ProductCard.tsx
import FavoriteButton from './FavoriteButton';

function ProductCard({ product, showFavoriteButton = true }) {
  return (
    <div className="relative">
      {/* 商品信息 */}
      
      {/* 收藏按钮 */}
      {showFavoriteButton && (
        <div 
          className="absolute right-2 top-2 z-20"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
        >
          <FavoriteButton 
            productId={product.id} 
            size="md"
            className="bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800" 
          />
        </div>
      )}
    </div>
  );
}
```

### 显示收藏列表

创建收藏页面，显示用户收藏的商品。

```tsx
// app/favorites/page.tsx
"use client";

import { useFavoritesList } from '@/lib/favorites';
import { adaptProducts } from '@/lib/utils';
import ProductCard from '@/components/common/ProductCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

export default function FavoritesPage() {
  const { favorites, isLoading, error, refreshFavorites } = useFavoritesList();
  const adaptedProducts = adaptProducts(favorites || []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的收藏</h1>
        <button
          onClick={refreshFavorites}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          刷新列表
        </button>
      </div>

      {isLoading ? (
        <LoadingState message="加载收藏列表中..." />
      ) : error ? (
        <ErrorState
          message="加载收藏列表失败"
          error={error}
          retry={refreshFavorites}
        />
      ) : adaptedProducts.length === 0 ? (
        <EmptyState
          title="暂无收藏"
          description="您还没有收藏任何商品，去浏览一些商品并添加到收藏吧！"
          actionText="浏览商品"
          actionLink="/"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {adaptedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showFavoriteButton
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

## 常见问题

**问题1: 浏览器隐私模式下收藏丢失**

**原因**: 隐私模式下localStorage存储受限。

**解决方案**:
1. 提醒用户收藏在隐私模式下不会保存
2. 考虑添加导出/导入收藏功能
3. 在非隐私模式下访问

**问题2: 收藏按钮状态不同步**

**原因**: 上下文更新不及时或组件未连接到上下文。

**解决方案**:
1. 确保组件正确使用了 `useFavorites` 或 `useProductFavorite` Hook
2. 检查组件是否被包裹在 `FavoritesProvider` 内
3. 在状态变化后调用刷新函数

**问题3: 跨浏览器/设备同步收藏**

**原因**: localStorage仅限于当前浏览器。

**解决方案**:
1. 提供导出收藏功能
2. 未来可添加账户同步功能 