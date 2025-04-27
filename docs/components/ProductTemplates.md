# 产品模板系统文档

## 概述

本项目提供了一套灵活的产品展示模板，旨在通过不同的视觉样式在网站的各个部分（如 CMS 内容、产品列表页等）统一展示商品信息。系统核心是 `DynamicProductLoader` 组件，它根据指定的样式动态加载并渲染相应的产品模板组件。所有模板都期望接收一个符合 `ComponentProduct` 类型的数据对象。

## 核心加载器: `DynamicProductLoader`

`DynamicProductLoader` 是动态渲染产品模板的核心组件。它接收产品 ID 和样式信息，负责获取产品数据并选择合适的模板进行展示。

**主要功能:**

1.  **数据获取**: 使用 `useSWR` 根据 `productId` (可以是数据库 ID 或 ASIN) 调用后端 API (`productsApi.getProductById` 或 `productsApi.queryProduct`) 获取产品数据。
2.  **数据适配**: 获取到的原始产品数据（`Product` 类型）会通过 `adaptProducts` 函数进行处理，转换为前端统一的 `ComponentProduct` 格式。
3.  **模板选择**: 根据传入的 `style` 属性 (默认为 'simple')，动态选择并渲染对应的产品模板组件 (`CardProductElement`, `HorizontalProductElement`, `MiniProductElement`, `SimpleProductElement`)。
4.  **加载与错误状态**: 显示骨架屏 (`ProductSkeletonPlaceholder`) 或错误提示信息。
5.  **对齐**: 支持 `alignment` 属性 (`left`, `center`, `right`)，用于控制产品组件在容器内的对齐方式（此功能主要在 `ContentRenderer` 中应用，传递给 `DynamicProductLoader`）。

**Props:**

-   `productId` (string, 必需): 产品的唯一标识符（数据库 ID 或 ASIN）。
-   `style` (string, 可选, 默认: 'simple'): 指定要使用的产品模板样式。可选值: 'simple', 'card', 'horizontal', 'mini'。
-   `alignment` ('left' | 'center' | 'right', 可选, 默认: 'left'): 产品组件的对齐方式。

**示例 (在 React 组件中使用):**

```tsx
import DynamicProductLoader from '@/components/cms/DynamicProductLoader';

function MyComponent() {
  return (
    <div>
      <p>这是一个卡片样式的产品：</p>
      <DynamicProductLoader productId="product123" style="card" />
      <p>这是一个居中对齐的迷你产品：</p>
      <DynamicProductLoader productId="asinABCDEFG" style="mini" alignment="center" />
    </div>
  );
}
```

## Available Templates

系统目前提供以下几种预设的产品模板：

### 1. `CardProductElement` (卡片样式)

**文件:** `components/cms/Template/CardProductElement.tsx`

**Description:**
Provides a feature-rich card-style product display, suitable for grid layouts or scenarios requiring highlighting individual products.

**Features:**
*   **Layout:** Vertical card layout including image, brand, title, price, discount/coupon info, and action button.
*   **Image:** Occupies the top of the card, supports lazy loading and placeholders.
*   **Brand:** Displays formatted brand name above the title (if available).
*   **Prime Badge:** Shows a Prime badge in the top-left corner if `isPrime` is `true`.
*   **Price Display:** Shows the current price (`price`). If `originalPrice` is higher than `price`, the strikethrough original price is displayed.
*   **Discount/Coupon:**
    *   Prioritizes coupon information (`couponLabel`), supporting percentage and fixed amounts.
    *   If no coupon exists but a discount is present (`savingsPercentage > 0`), displays the discount percentage (`discountLabel`).
    *   Discount badge color changes based on the discount amount (default blue, >=25% orange, >=50% red).
*   **Coupon Expiry:** If `couponExpirationDate` is provided, displays the formatted expiration date.
*   **Title:** Automatically capitalizes the first letter of each word in the title.
*   **Interaction:** Slight upward movement and shadow effect on hover.
*   **Link:** The entire card links to the product detail page (`/product/{id}`).
*   **Button:** Includes a "View Details" button at the bottom.

**Props:**
*   `product` (ComponentProduct, required): The product data object.

**描述:**
提供功能丰富的卡片式产品展示，适用于网格布局或需要突出显示单个产品的场景。

### 2. `HorizontalProductElement` (水平样式)

**文件:** `components/cms/Template/HorizontalProductElement.tsx`

**Description:**
A horizontal list item style, suitable for product lists or search result pages.

**Features:**
*   **Layout:** Image on the left (or top on mobile), product info on the right (or bottom on mobile).
*   **Responsive:** Adjusts to a vertical layout on smaller screens.
*   **Image:** Fixed-size square image area.
*   **Information:** Displays title, price, store identifier, and "View Details" button.
*   **Title:** Supports line clamping.
*   **Interaction:** Slight upward movement effect on hover.
*   **Link:** Image and title link to the product detail page (`/product/{id}`). The "View Details" button also links to the detail page.

**Props:**
*   `product` (ComponentProduct, required): The product data object.

**描述:**
水平排列的列表项样式，适用于产品列表或搜索结果页面。

### 3. `MiniProductElement` (迷你样式)

**文件:** `components/cms/Template/MiniProductElement.tsx`

**Description:**
A very compact inline style, suitable for space-constrained areas or embedding within text paragraphs.

**Features:**
*   **Layout:** Small image on the left, title and price in the middle, store identifier on the right.
*   **Size:** Fixed width, height adapts to content.
*   **Information:** Displays image, truncated title, price, and store identifier (icon only).
*   **Interaction:** Slight scaling effect on hover.
*   **Link:** The entire component links to the product detail page (`/product/{id}`).

**Props:**
*   `product` (ComponentProduct, required): The product data object.

**描述:**
非常紧凑的行内样式，适用于空间有限或需要嵌入到文本段落中的场景。

### 4. `SimpleProductElement` (简单样式)

**文件:** `components/cms/Template/SimpleProductElement.tsx`

**Description:**
A basic inline row layout providing core product information, suitable for default display within the CMS editor or simple lists.

**Features:**
*   **Layout:** Optional image on the left, title, price, and optional ASIN in the middle, store identifier on the right.
*   **Information:** Displays image, truncated title, price. Displays ASIN if `asin` exists.
*   **Link:** Image and title link to the product detail page (`/product/{id}`).

**Props:**
*   `product` (ComponentProduct, required): The product data object.

**描述:**
基础的行式布局，提供最核心的产品信息，适用于 CMS 编辑器内的默认展示或简洁列表。

### 5. `CompactGridItemElement` (Compact Grid Style)

**File:** `components/cms/Template/CompactGridItemElement.tsx`

**Description:**
Designed for dense grid layouts, such as related products or category pages. Optimized for displaying multiple items efficiently.

**Features:**
*   **Layout:** Vertical stack. Image at the top, followed by truncated title, price, and store identifier.
*   **Size:** Relatively small fixed width, suitable for multi-column grids.
*   **Image:** Square aspect ratio, with a subtle zoom effect on hover.
*   **Information:** Focuses on essential details: image, title (line-clamped), price, store icon.
*   **Interaction:** Slight upward movement and border highlight on hover.
*   **Link:** The entire component links to the product detail page (`/product/{id}`).

**Props:**
*   `product` (ComponentProduct, required): The product data object.

### 6. `FeaturedItemElement` (Featured Item Style)

**File:** `components/cms/Template/FeaturedItemElement.tsx`

**Description:**
Highlights a single product prominently, suitable for homepages, blog post integrations, or promotional sections.

**Features:**
*   **Layout:** Horizontal on desktop (image left, details right), stacks vertically on mobile.
*   **Responsive:** Adapts layout structure based on screen size.
*   **Image:** Larger image area (4:3 aspect ratio on desktop) with Prime badge if applicable.
*   **Information:** Displays brand (if available), full title, current price, strikethrough original price (if applicable), calculated savings percentage, store identifier (with name), and a prominent "View Details" button.
*   **Interaction:** Subtle shadow enhancement on hover.
*   **Link:** Image, title, and button link to the product detail page (`/product/{id}`).

**Props:**
*   `product` (ComponentProduct, required): The product data object.

## 数据获取

产品模板所需的数据由 `DynamicProductLoader` (用于前端渲染) 或 `ProductBlot` (用于 Tiptap 编辑器预览) 负责获取。两者都使用了 `useSWR` 库来高效地请求和缓存产品数据。

-   **Fetcher 函数:** `fetchProduct` (在 `DynamicProductLoader`) 和 `fetchEditorProduct` (在 `ProductBlot`) 封装了调用 `productsApi` 的逻辑，能处理数据库 ID 和 ASIN。
-   **缓存:** `useSWR` 提供了重复数据删除 (`dedupingInterval`) 和错误重试控制 (`shouldRetryOnError`)。
-   **数据适配:** 获取到的原始数据通过 `adaptProducts` 函数统一转换为 `ComponentProduct` 格式。

## `ComponentProduct` 类型

所有产品模板组件都期望接收一个 `product` 属性，该属性的值必须符合 `ComponentProduct` 接口定义。这个接口是前端统一的产品数据模型，由 `adaptProducts` 函数从后端 API 返回的原始 `Product` 类型转换而来。

```typescript
// @/types/index.ts (示例结构，请以实际代码为准)
export interface ComponentProduct {
  id: string;                 // 数据库 ID 或 ASIN
  title: string;              // 产品标题
  price: number;              // 当前价格
  image: string | null;       // 主图片 URL
  url?: string | null;        // 产品原始 URL (例如 Amazon 链接)
  cj_url?: string | null;     // CJ Affiliate 链接 (如果存在)
  originalPrice?: number | null; // 原价 (用于显示折扣)
  discount?: number | null;    // 折扣百分比 (直接来自数据源)
  couponType?: 'percentage' | 'fixed' | null; // 优惠券类型
  couponValue?: number | null;   // 优惠券面值
  couponExpirationDate?: string | null; // 优惠券到期日期 (ISO 格式字符串)
  isPrime?: boolean | null;     // 是否为 Prime 商品
  isFreeShipping?: boolean | null; // 是否免运费
  brand?: string | null;        // 品牌名称
  asin?: string | null;         // ASIN
  // ... 可能还有其他根据 adaptProducts 添加的字段
}
```

## CMS 集成

产品模板可以无缝集成到通过 CMS (内容管理系统) 创建的内容中。

**渲染端 (`ContentRenderer`):**

-   `ContentRenderer` 组件负责解析 HTML 内容。
-   当遇到带有 `data-node-type="product"` 属性的 `<span>` 标签时，它会提取 `data-product-id`, `data-style`, 和 `data-alignment` 属性。
-   然后，它会渲染 `DynamicProductLoader` 组件，并将这些属性传递给它，从而在页面上动态加载和显示相应的产品卡片。

**HTML 结构示例:**

```html
<p>查看这款 amazing 的产品：</p>
<span data-node-type="product" data-product-id="productXYZ" data-style="card"></span>
<p>或者这个小巧的：</p>
<span data-node-type="product" data-product-id="asin123456" data-style="mini" data-alignment="center"></span>
```

**编辑器端 (`ProductBlot` & `RichTextEditor`):**

-   `ProductBlot` 是一个 Tiptap 扩展，用于在 `RichTextEditor` 中定义和管理产品节点。
-   它允许用户通过 `ProductSelector` 组件搜索并插入产品。
-   插入的产品节点在编辑器中渲染为对应的产品模板预览 (使用 `CardProductElement`, `HorizontalProductElement` 等)。
-   编辑器中的产品节点使用 `<span>` 作为根元素，并设置为 `inline: true` 和 `group: 'inline'`，使其表现为行内元素，可以和其他文本内容混排。
-   `ProductBlot` 负责将节点属性 (如 `id`, `style`, `alignment` 等) 保存到 HTML 的 `data-*` 属性中，以便 `ContentRenderer` 解析。
-   **对齐处理**: 虽然 `ProductBlot` 保存了 `alignment` 属性，但它本身不再处理对齐样式。对齐由渲染端的 `ContentRenderer` 应用到包裹 `DynamicProductLoader` 的容器上，或者通过 CSS 处理包含产品节点的父元素。

## `StoreIdentifier` 集成

`StoreIdentifier` 组件用于显示产品的来源店铺标识 (例如 Amazon 图标)。

-   它被集成在多个产品模板中 (`CardProductElement`, `HorizontalProductElement`, `MiniProductElement`, `SimpleProductElement`)。
-   根据模板的不同，可能只显示图标，或者同时显示图标和店铺名称。
-   它接收 `url` 或 `cj_url` 来判断来源。
-   该组件已被修改为使用 `<span>` 作为根元素，以确保在行内产品节点中不会引起 HTML 嵌套错误。

## 定制与扩展

**修改现有模板:**

-   直接编辑位于 `components/cms/Template/` 目录下的相应模板文件 (`.tsx`)。
-   可以调整样式 (使用 Tailwind CSS 类)、布局结构或显示逻辑。
-   确保修改后的模板仍然接受 `product: ComponentProduct` 作为 prop。

**添加新模板:**

1.  在 `components/cms/Template/` 目录下创建一个新的 React 组件文件 (例如 `NewStyleProductElement.tsx`)。
2.  确保新组件接收 `{ product: ComponentProduct }` 作为 props。
3.  在 `DynamicProductLoader.tsx` 中:
    -   导入新创建的组件。
    -   在 `switch (style)` 语句中添加一个新的 `case` 来处理你的新样式名称，并渲染新组件。
    -   (可选) 在 `ProductSkeletonPlaceholder` 中为新样式添加对应的骨架屏样式。
4.  在 `ProductBlot.tsx` 中:
    -   导入新创建的组件。
    -   在 `renderFetchedProduct` 函数的 `switch (style)` 语句中添加相应的 `case`。
    -   (可选) 在 `ProductSkeletonPlaceholder` (编辑器版本) 中添加对应的骨架屏样式。
    -   将新的样式 ID 添加到 `PRODUCT_STYLES` 数组中，以便在编辑器工具栏中可选。
5.  更新本文档，在"可用模板"部分添加对新模板的描述。
6.  (可选) 在 `RichTextEditor.tsx` 或 `TiptapToolbar.tsx` 中更新相关 UI，如果需要为新样式添加特定的编辑器控件。 