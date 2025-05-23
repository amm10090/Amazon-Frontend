# 时区处理策略文档

## 概述

本项目采用统一的时区处理策略，确保数据的一致性和用户体验的友好性。

## 核心原则

### 1. 存储原则
- **所有时间数据均以UTC时间存储**
- 数据库中的所有时间字段都是UTC时间的ISO 8601格式字符串
- 避免因服务器时区差异导致的数据不一致问题

### 2. 显示原则
- **前端显示时自动转换为用户本地时区**
- 使用浏览器的`Intl.DateTimeFormat()`API获取用户时区
- 在UI组件中显示时间时，明确标示时区信息

### 3. 输入原则
- **用户输入的时间按本地时区处理，然后转换为UTC存储**
- 表单中的日期时间选择器以用户本地时区显示
- 提交时自动转换为UTC时间

## 技术实现

### 工具函数 (`lib/utils.ts`)

```typescript
// 格式化UTC时间为本地时区显示
export function formatUTCDateToLocal(utcDateString: string): string

// 获取当前UTC时间
export function getCurrentUTCTimeString(): string
```

### 日期组件处理 (`components/dashboard/products/ProductForm.tsx`)

```typescript
// 解析UTC时间为本地时区显示
const parseISOStringToCalendarDateTime = (isoString: string) => {
    const zonedDateTime = parseAbsolute(isoString, Intl.DateTimeFormat().resolvedOptions().timeZone);
    return toCalendarDateTime(zonedDateTime);
};

// 将本地时区输入转换为UTC存储
const formatInternationalizedDateToISO = (dateValue) => {
    const jsDate = dateValue.toDate('UTC');
    return jsDate.toISOString();
};
```

## 使用示例

### 1. 在组件中显示时间

```typescript
import { formatUTCDateToLocal } from '@/lib/utils';

// 显示产品的优惠券过期时间
const expirationDisplay = formatUTCDateToLocal(product.coupon_expiration_date);
```

### 2. 在表单中处理日期输入

```typescript
// DateInput组件自动处理本地时区显示和UTC存储转换
<DateInput
    value={field.value}
    onChange={field.onChange}
    description="时间将以您的本地时区显示，但存储为UTC时间"
/>
```

### 3. 在API中处理时间

```typescript
// 创建新记录时使用UTC时间
const newProduct = {
    ...productData,
    timestamp: getCurrentUTCTimeString(),
    coupon_expiration_date: formatInternationalizedDateToISO(userInputDate)
};
```

## 注意事项

1. **数据库迁移**: 确保所有现有的时间数据都转换为UTC格式
2. **API一致性**: 所有API响应中的时间字段都应该是UTC时间
3. **用户提示**: 在涉及时间的UI中，明确告知用户时区处理方式
4. **测试覆盖**: 确保跨时区测试覆盖主要功能

## 相关文件

- `lib/utils.ts` - 时间处理工具函数
- `components/dashboard/products/ProductForm.tsx` - 产品表单时间处理
- `types/api.ts` - API类型定义 