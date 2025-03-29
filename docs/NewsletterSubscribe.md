# 邮件订阅功能

本文档详细介绍了邮件订阅功能的实现和使用方法。

## 目录

- [组件概述](#组件概述)
- [属性API](#属性api)
- [使用示例](#使用示例)
- [后端API](#后端api)
- [数据库结构](#数据库结构)
- [邮件发送](#邮件发送)
- [注意事项](#注意事项)

## 组件概述

`NewsletterSubscribe` 组件提供了一个用户友好的邮件订阅界面，支持两种显示模式：

1. **标准模式** - 完整的订阅表单，带有标题、描述和隐私说明
2. **紧凑模式** - 简化版本，适合在产品页面或侧边栏中使用

该组件处理邮箱验证、表单提交、加载状态显示以及成功/错误反馈。

## 属性API

| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|-------|------|
| compact | boolean | false | 设置为 `true` 使用紧凑模式显示 |

## 使用示例

### 标准模式

```tsx
import { NewsletterSubscribe } from '@/components/ui/NewsletterSubscribe';

export default function NewsletterSection() {
  return (
    <div className="container mx-auto py-12">
      <NewsletterSubscribe />
    </div>
  );
}
```

### 紧凑模式

```tsx
import { NewsletterSubscribe } from '@/components/ui/NewsletterSubscribe';

export default function ProductSidebar() {
  return (
    <div className="sidebar-container">
      <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
      <NewsletterSubscribe compact={true} />
    </div>
  );
}
```

## 后端API

邮件订阅功能使用 Next.js API 路由处理订阅请求。

### 订阅端点

**URL**: `/api/subscribe`  
**方法**: POST  
**内容类型**: application/json

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "message": "Subscription successful!"
}
```

**错误响应**:

- 400 Bad Request (邮箱缺失):
  ```json
  {
    "success": false,
    "message": "Please provide an email address"
  }
  ```

- 400 Bad Request (邮箱已存在):
  ```json
  {
    "success": false,
    "message": "This email is already subscribed"
  }
  ```

- 500 Internal Server Error:
  ```json
  {
    "success": false,
    "message": "Subscription failed, please try again later"
  }
  ```

## 数据库结构

邮件订阅数据存储在 MongoDB 数据库中。

**数据库名**: `email_subscription`  
**集合名**: `email_list`

**文档结构**:
```javascript
{
  email: String,         // 订阅者的邮箱地址
  subscribedAt: Date,    // 订阅时间
  isActive: Boolean      // 订阅状态 (用于后续实现取消订阅功能)
}
```

## 邮件发送

系统使用 [Resend](https://resend.com) 服务发送订阅确认邮件。

### 邮件模板

确认邮件使用 HTML 模板，内容包括：
- 欢迎信息
- 订阅者邮箱
- 感谢信息
- 查看优惠链接按钮
- 隐私声明和版权信息

### 配置

Resend API 密钥配置在 `.env.local` 文件中:

```
RESEND_API_KEY=your_resend_api_key
```

## 注意事项

1. **数据验证**: 前端和后端都实现了邮箱格式验证，确保数据有效性

2. **错误处理**: 系统会捕获并记录所有可能的错误，同时向用户提供友好的反馈

3. **性能优化**: 
   - 组件中的加载状态防止重复提交
   - 后端使用异步处理提高响应速度

4. **扩展性**:
   - 数据库结构支持添加更多用户属性 (如姓名、偏好等)
   - 可扩展为分类订阅 (如只接收特定类别的优惠信息)

5. **维护建议**:
   - 定期检查邮件发送成功率
   - 监控数据库增长情况
   - 考虑实现取消订阅功能 