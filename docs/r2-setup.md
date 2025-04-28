# Cloudflare R2 存储配置指南

本文档提供如何设置 Cloudflare R2 对象存储以用于图片上传功能的指南。

## 环境变量配置

在项目根目录的 `.env.local` 文件中添加以下配置：

```
# Cloudflare R2 存储配置
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=amazon-frontend-assets
R2_PUBLIC_URL=https://your-public-url.example.com
```

## 创建 R2 存储桶

1. 登录到 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 在左侧导航中选择 "R2"
3. 点击 "创建存储桶" 按钮
4. 输入存储桶名称（与 `R2_BUCKET_NAME` 环境变量一致）
5. 根据需要配置存储桶选项（建议启用公共访问权限）

## 创建 API 令牌

1. 在 Cloudflare R2 控制台中，点击 "管理 R2 API 令牌"
2. 创建一个新的 API 令牌，确保具有适当的权限（至少需要读写权限）
3. 记下 `Access Key ID` 和 `Secret Access Key`，填入环境变量

## 配置公共访问（可选）

如果你希望上传的图片能够公开访问，可以：

1. 在存储桶设置中启用公共访问
2. 配置自定义域名或使用 Cloudflare 提供的公共 URL 作为 `R2_PUBLIC_URL`

## CORS 配置

若需要允许从特定域名访问 R2 资源，需要配置 CORS：

1. 在存储桶设置中找到 CORS 配置部分
2. 添加适当的 CORS 规则，例如：

```json
[
  {
    "AllowedOrigins": ["https://your-website.com"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 安全注意事项

- 确保将 `.env.local` 添加到 `.gitignore` 以避免凭据泄露
- 在生产环境中使用最小权限原则配置 API 令牌
- 考虑为上传的文件设置访问控制策略
- 定期轮换 API 密钥 