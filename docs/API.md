# Amazon Frontend API 文档

本文档详细介绍了 Amazon Frontend 项目中的 API 使用方法，包括 API 客户端配置、商品 API、用户 API、自定义 Hooks 以及数据适配器。

## 目录

- [API 概述](#api-概述)
- [商品 API (productsApi)](#商品-api-productsapi)
- [用户 API (userApi)](#用户-api-userapi)
- [自定义 Hooks](#自定义-hooks)
- [数据适配器](#数据适配器)
- [常见问题与解决方案](#常见问题与解决方案)

## API 概述

### 基础配置

项目使用 Axios 创建 API 客户端，根据运行环境（服务器端或客户端）自动选择合适的 Base URL。

```typescript
// 环境变量配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SERVER_API_URL = process.env.SERVER_API_URL || API_BASE_URL;
```

### API 客户端创建

```typescript
const createApiClient = (config?: AxiosRequestConfig) => {
  return axios.create({
    baseURL: isServer() ? SERVER_API_URL : '/api',
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(process.env.NEXT_PUBLIC_API_KEY && {
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
      })
    },
    withCredentials: false,
    ...config
  });
};

const api = createApiClient();
```

### 响应数据结构

大多数 API 响应遵循 `ApiResponse<T>` 格式：

```typescript
interface ApiResponse<T> {
  code: number;        // 状态码，200 表示成功
  message: string;     // 描述信息
  data: T;             // 实际数据，类型为泛型 T
}
```

列表数据通常遵循 `ListResponse<T>` 格式：

```typescript
interface ListResponse<T> {
  items: T[];          // 数据项数组
  total: number;       // 总条数
  page: number;        // 当前页码
  page_size: number;   // 每页条数
}
```

## 商品 API (productsApi)

### 通过 ASIN 查询商品详情

```typescript
queryProduct: (params: {
  asin: string;
  include_metadata?: boolean;
  include_browse_nodes?: string[] | null;
}) => Promise<AxiosResponse<ApiResponse<Product>>>
```

**参数说明：**
- `asin` (必填)：商品的 ASIN 编码
- `include_metadata` (可选)：是否包含原始元数据
- `include_browse_nodes` (可选)：筛选特定的浏览节点 ID 数组

**使用示例：**

```typescript
const response = await productsApi.queryProduct({
  asin: 'B01NAGCKA9',
  include_metadata: true
});
const product = response.data.data; // 获取商品数据
```

### 获取商品列表

```typescript
getProducts: (params?: {
  product_type?: 'discount' | 'coupon' | 'all';
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'discount' | 'created' | 'all';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  is_prime_only?: boolean;
  product_groups?: string;
  brands?: string;
  api_provider?: string;
}) => Promise<AxiosResponse<ApiResponse<ListResponse<Product>>>>
```

**参数说明：**
- `product_type` (可选)：商品类型，可选值 'discount'(折扣商品)、'coupon'(优惠券商品) 或 'all'(全部)
- `page` (可选)：页码，从 1 开始
- `limit` (可选)：每页数量
- `sort_by` (可选)：排序字段，可选值 'price'、'discount'、'created' 或 'all'
- `sort_order` (可选)：排序方向，可选值 'asc'(升序) 或 'desc'(降序)
- `min_price` (可选)：最低价格过滤
- `max_price` (可选)：最高价格过滤
- `min_discount` (可选)：最低折扣率
- `is_prime_only` (可选)：是否只显示 Prime 商品
- `product_groups` (可选)：商品分类，多个分类用逗号分隔
- `brands` (可选)：品牌，多个品牌用逗号分隔
- `api_provider` (可选)：数据来源

**使用示例：**

```typescript
const response = await productsApi.getProducts({
  product_type: 'discount',
  page: 1,
  limit: 20,
  sort_by: 'price',
  sort_order: 'asc',
  min_discount: 30,
  is_prime_only: true
});
const products = response.data.data.items; // 获取商品列表
const total = response.data.data.total;    // 获取总条数
```

### 获取商品统计信息

```typescript
getProductsStats: (productType?: 'discount' | 'coupon') => Promise<AxiosResponse<ApiResponse<ProductStats>>>
```

**参数说明：**
- `productType` (可选)：商品类型，可选值 'discount'(折扣商品) 或 'coupon'(优惠券商品)

**使用示例：**

```typescript
const response = await productsApi.getProductsStats('discount');
const stats = response.data.data; // 获取统计信息
```

### 获取单个商品详情

```typescript
getProductById: (id: string) => Promise<AxiosResponse<ApiResponse<Product>>>
```

**参数说明：**
- `id` (必填)：商品 ID 或 ASIN

**使用示例：**

```typescript
const response = await productsApi.getProductById('B01NAGCKA9');
const product = response.data.data; // 获取商品详情
```

### 获取分类列表

```typescript
getCategories: (params?: {
  product_type?: 'discount' | 'coupon';
}) => Promise<AxiosResponse<ApiResponse<Category[]>>>
```

**参数说明：**
- `product_type` (可选)：商品类型，可选值 'discount'(折扣商品) 或 'coupon'(优惠券商品)

**使用示例：**

```typescript
const response = await productsApi.getCategories({ product_type: 'discount' });
const categories = response.data.data; // 获取分类列表
```

### 获取分类统计信息

```typescript
getCategoryStats: (params?: {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => Promise<AxiosResponse<ApiResponse<CategoryStats>>>
```

**参数说明：**
- `page` (可选)：页码，从 1 开始
- `page_size` (可选)：每页数量
- `sort_by` (可选)：排序字段
- `sort_order` (可选)：排序方向，可选值 'asc'(升序) 或 'desc'(降序)

**使用示例：**

```typescript
const response = await productsApi.getCategoryStats({
  page: 1,
  page_size: 50,
  sort_by: 'count',
  sort_order: 'desc'
});
const categoryStats = response.data.data; // 获取分类统计信息
```

### 获取品牌统计信息

```typescript
getBrandStats: (params?: {
  product_type?: 'discount' | 'coupon';
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => Promise<AxiosResponse<BrandStats>>
```

**参数说明：**
- `product_type` (可选)：商品类型，可选值 'discount'(折扣商品) 或 'coupon'(优惠券商品)
- `page` (可选)：页码，从 1 开始
- `page_size` (可选)：每页数量
- `sort_by` (可选)：排序字段
- `sort_order` (可选)：排序方向，可选值 'asc'(升序) 或 'desc'(降序)

**使用示例：**

```typescript
const response = await productsApi.getBrandStats({
  product_type: 'discount',
  page: 1,
  page_size: 50,
  sort_by: 'count',
  sort_order: 'desc'
});
const brandStats = response.data; // 获取品牌统计信息
```

### 获取限时特惠商品

```typescript
getDeals: (params?: {
  active?: boolean;
  page?: number;
  limit?: number;
}) => Promise<AxiosResponse<ApiResponse<ListResponse<Product>>>>
```

**参数说明：**
- `active` (可选)：是否仅显示活跃的限时特惠
- `page` (可选)：页码，从 1 开始
- `limit` (可选)：每页数量

**使用示例：**

```typescript
const response = await productsApi.getDeals({
  active: true,
  page: 1,
  limit: 12
});
const deals = response.data.data.items; // 获取限时特惠商品
```

### 获取商品价格历史

```typescript
getPriceHistory: (productId: string, params?: {
  days?: number;
}) => Promise<AxiosResponse<ApiResponse<PriceHistory[]>>>
```

**参数说明：**
- `productId` (必填)：商品 ID 或 ASIN
- `days` (可选)：获取最近多少天的价格历史

**使用示例：**

```typescript
const response = await productsApi.getPriceHistory('B01NAGCKA9', { days: 30 });
const priceHistory = response.data.data; // 获取价格历史
```

### 搜索 CJ 平台商品

```typescript
searchCJProducts: (params: {
  keyword: string;
  page?: number;
  limit?: number;
}) => Promise<AxiosResponse<ApiResponse<CJProduct[]>>>
```

**参数说明：**
- `keyword` (必填)：搜索关键词
- `page` (可选)：页码，从 1 开始
- `limit` (可选)：每页数量

**使用示例：**

```typescript
const response = await productsApi.searchCJProducts({
  keyword: '手机壳',
  page: 1,
  limit: 20
});
const cjProducts = response.data.data; // 获取 CJ 平台商品
```

### 获取 CJ 平台商品详情

```typescript
getCJProductDetails: (pid: string) => Promise<AxiosResponse<ApiResponse<CJProduct>>>
```

**参数说明：**
- `pid` (必填)：CJ 平台商品 ID

**使用示例：**

```typescript
const response = await productsApi.getCJProductDetails('12345');
const cjProduct = response.data.data; // 获取 CJ 平台商品详情
```

### 获取 CJ 平台商品运费信息

```typescript
getCJShippingInfo: (pid: string, params: {
  country: string;
  quantity: number;
}) => Promise<AxiosResponse<ApiResponse<{
  shipping_price: number;
  shipping_time: string;
  shipping_method: string;
}>>>
```

**参数说明：**
- `pid` (必填)：CJ 平台商品 ID
- `country` (必填)：目标国家代码
- `quantity` (必填)：商品数量

**使用示例：**

```typescript
const response = await productsApi.getCJShippingInfo('12345', {
  country: 'US',
  quantity: 1
});
const shippingInfo = response.data.data; // 获取运费信息
```

### 搜索商品

```typescript
searchProducts: (params: {
  keyword: string;
  page?: number;
  page_size?: number;
  sort_by?: 'relevance' | 'price' | 'discount' | 'created';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  is_prime_only?: boolean;
  product_groups?: string;
  brands?: string;
  api_provider?: string;
}) => Promise<AxiosResponse<ApiResponse<ListResponse<Product>>>>
```

**参数说明：**
- `keyword` (必填)：搜索关键词
- `page` (可选)：页码，从 1 开始
- `page_size` (可选)：每页数量
- `sort_by` (可选)：排序字段，可选值 'relevance'、'price'、'discount' 或 'created'
- `sort_order` (可选)：排序方向，可选值 'asc'(升序) 或 'desc'(降序)
- `min_price` (可选)：最低价格过滤
- `max_price` (可选)：最高价格过滤
- `min_discount` (可选)：最低折扣率
- `is_prime_only` (可选)：是否只显示 Prime 商品
- `product_groups` (可选)：商品分类，多个分类用逗号分隔
- `brands` (可选)：品牌，多个品牌用逗号分隔
- `api_provider` (可选)：数据来源

**使用示例：**

```typescript
const response = await productsApi.searchProducts({
  keyword: 'iPhone',
  page: 1,
  page_size: 20,
  sort_by: 'price',
  sort_order: 'asc',
  min_discount: 10,
  is_prime_only: true
});
const searchResults = response.data.data.items; // 获取搜索结果
const total = response.data.data.total;         // 获取结果总数
```

## 用户 API (userApi)

### 获取收藏列表

```typescript
getFavorites: () => Promise<AxiosResponse<ApiResponse<Product[]>>>
```

**使用示例：**

```typescript
const response = await userApi.getFavorites();
const favorites = response.data.data; // 获取收藏列表
```

### 添加收藏

```typescript
addFavorite: (productId: string) => Promise<AxiosResponse<ApiResponse<void>>>
```

**参数说明：**
- `productId` (必填)：商品 ID 或 ASIN

**使用示例：**

```typescript
await userApi.addFavorite('B01NAGCKA9');
```

### 删除收藏

```typescript
removeFavorite: (productId: string) => Promise<AxiosResponse<ApiResponse<void>>>
```

**参数说明：**
- `productId` (必填)：商品 ID 或 ASIN

**使用示例：**

```typescript
await userApi.removeFavorite('B01NAGCKA9');
```

### 获取用户偏好设置

```typescript
getPreferences: () => Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>>
```

**使用示例：**

```typescript
const response = await userApi.getPreferences();
const preferences = response.data.data; // 获取用户偏好设置
```

### 更新用户偏好设置

```typescript
updatePreferences: (preferences: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse<void>>>
```

**参数说明：**
- `preferences` (必填)：用户偏好设置对象

**使用示例：**

```typescript
await userApi.updatePreferences({
  theme: 'dark',
  notificationsEnabled: true
});
```

## 自定义 Hooks

项目使用 SWR 库封装了一系列自定义 Hooks，用于数据获取和状态管理。所有 Hooks 都返回以下标准格式：

```typescript
type SWRHookResponse<T> = {
  data?: T;              // 数据
  isLoading: boolean;    // 加载状态
  isError: unknown;      // 错误信息
  mutate?: () => Promise<unknown>; // 重新获取数据的方法
};
```

### useProducts Hook

用于获取商品列表数据。

```typescript
function useProducts(params?: {
  product_type?: 'discount' | 'coupon' | 'all';
  page?: number;
  limit?: number;
  sort_by?: 'price' | 'discount' | 'created' | 'all';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  is_prime_only?: boolean;
  product_groups?: string;
  brands?: string;
  api_provider?: string;
}): SWRHookResponse<{ items: Product[], total: number, page: number, page_size: number }>
```

**使用示例：**

```typescript
const { data, isLoading, isError, mutate } = useProducts({
  product_type: 'discount',
  page: 1,
  limit: 20,
  min_discount: 30
});

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

const products = data?.items || [];
const total = data?.total || 0;
```

### useProduct Hook

用于获取单个商品详情。

```typescript
function useProduct(id: string): SWRHookResponse<Product>
```

**使用示例：**

```typescript
const { data: product, isLoading, isError } = useProduct('B01NAGCKA9');

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

return <ProductDetail product={product} />;
```

### useCategories Hook

用于获取分类列表。

```typescript
function useCategories(params?: {
  product_type?: 'discount' | 'coupon';
}): SWRHookResponse<Category[]>
```

**使用示例：**

```typescript
const { data: categories, isLoading, isError } = useCategories({ 
  product_type: 'discount' 
});

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

return (
  <select>
    {categories?.map(category => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ))}
  </select>
);
```

### useCategoryStats Hook

用于获取分类统计信息。

```typescript
function useCategoryStats(params?: {
  product_type?: 'discount' | 'coupon' | 'all';
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}): SWRHookResponse<CategoryStats> & { rawData?: Record<string, unknown> }
```

**使用示例：**

```typescript
const { data: categoryStats, isLoading, isError } = useCategoryStats({
  product_type: 'discount',
  sort_by: 'count',
  sort_order: 'desc'
});

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

// 使用 product_groups 分类数据
const productGroups = categoryStats?.product_groups || {};
```

### useDeals Hook

用于获取限时特惠商品。

```typescript
function useDeals(params?: {
  active?: boolean;
  page?: number;
  limit?: number;
}): SWRHookResponse<Product[]>
```

**使用示例：**

```typescript
const { data: deals, isLoading, isError } = useDeals({
  active: true,
  page: 1,
  limit: 12
});

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

return (
  <div className="grid grid-cols-3 gap-4">
    {deals?.map(deal => (
      <ProductCard key={deal.id} product={deal} />
    ))}
  </div>
);
```

### usePriceHistory Hook

用于获取商品价格历史。

```typescript
function usePriceHistory(productId: string): SWRHookResponse<PriceHistory[]>
```

**使用示例：**

```typescript
const { data: priceHistory, isLoading, isError } = usePriceHistory('B01NAGCKA9');

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

return <PriceHistoryChart data={priceHistory} />;
```

### useFavorites Hook

用于获取用户收藏列表。

```typescript
function useFavorites(): SWRHookResponse<Product[]> & { mutate: () => Promise<unknown> }
```

**使用示例：**

```typescript
const { data: favorites, isLoading, isError, mutate } = useFavorites();

// 添加收藏后重新获取数据
const handleAddFavorite = async (productId: string) => {
  await userApi.addFavorite(productId);
  mutate(); // 刷新收藏列表
};

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

return (
  <div>
    {favorites?.map(product => (
      <FavoriteItem 
        key={product.id} 
        product={product} 
        onRemove={() => handleRemoveFavorite(product.id)}
      />
    ))}
  </div>
);
```

### useProductSearch Hook

用于搜索商品。

```typescript
function useProductSearch(params: {
  keyword: string;
  page?: number;
  page_size?: number;
  sort_by?: 'relevance' | 'price' | 'discount' | 'created';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  is_prime_only?: boolean;
  product_groups?: string;
  brands?: string;
  api_provider?: string;
}): SWRHookResponse<{ items: Product[], total: number, page: number, page_size: number }>
```

**使用示例：**

```typescript
const { data, isLoading, isError } = useProductSearch({
  keyword: 'iPhone',
  page: 1,
  page_size: 20,
  sort_by: 'price',
  sort_order: 'asc'
});

if (isLoading) return <div>加载中...</div>;
if (isError) return <div>加载失败</div>;

const products = data?.items || [];
const total = data?.total || 0;

return (
  <div>
    <p>共找到 {total} 个结果</p>
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
);
```

## 数据适配器

项目使用数据适配器将 API 返回的原始数据转换为前端组件需要的格式。主要的适配器函数是 `adaptProducts`。

### adaptProducts 函数

```typescript
function adaptProducts(apiProducts: Product[]): ComponentProduct[]
```

此函数将 API 返回的 `Product` 类型转换为前端组件使用的 `ComponentProduct` 类型，处理了以下逻辑：
- 提取主要优惠信息
- 计算价格和折扣
- 整合商品的各种信息（如图片、品牌、评分等）
- 处理优惠券信息

**使用示例：**

```typescript
import { adaptProducts } from '@/lib/utils';
import { useProducts } from '@/lib/hooks';

function ProductList() {
  const { data, isLoading } = useProducts({ limit: 20 });
  
  if (isLoading) return <div>加载中...</div>;
  
  // 将 API 数据转换为组件所需格式
  const adaptedProducts = adaptProducts(data?.items || []);
  
  return (
    <div>
      {adaptedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## 常见问题与解决方案

### 问题 1: API 返回 401 错误

**可能原因**：API Key 未设置或已过期

**解决方案**：
1. 检查环境变量 `NEXT_PUBLIC_API_KEY` 是否正确设置
2. 联系管理员重新生成 API Key
3. 确保 API Key 在请求头中正确传递

### 问题 2: 数据加载慢或超时

**可能原因**：网络延迟、API 服务器负载高

**解决方案**：
1. 检查并优化网络连接
2. 增加 API 请求超时时间
```typescript
const api = createApiClient({ timeout: 30000 }); // 设置为 30 秒
```
3. 实现数据缓存和预加载策略
4. 考虑使用本地状态管理库（如 Redux）存储常用数据

### 问题 3: SWR Hooks 重复请求

**可能原因**：组件重新渲染导致 SWR 键值变化

**解决方案**：
1. 确保 SWR 键值稳定，避免在每次渲染时生成新对象
```typescript
// 不推荐
const { data } = useProducts({ page: 1 }); // 每次渲染都创建新对象

// 推荐
const params = { page: 1 }; // 创建稳定引用
const { data } = useProducts(params);
```
2. 使用 `useMemo` 创建稳定的依赖对象
```typescript
const params = useMemo(() => ({ page, limit }), [page, limit]);
const { data } = useProducts(params);
```

### 问题 4: 组件渲染为空数据

**可能原因**：数据尚未加载完成但尝试访问数据属性

**解决方案**：
1. 使用可选链和默认值处理未加载的数据
```typescript
const { data, isLoading } = useProducts();
const products = data?.items || [];
```
2. 确保在使用数据前检查加载状态
```typescript
if (isLoading) return <div>加载中...</div>;
if (!data) return <div>暂无数据</div>;
``` 