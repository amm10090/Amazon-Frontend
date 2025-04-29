# 自定义脚本功能

自定义脚本功能允许管理员在网站的不同位置添加自定义的JavaScript或HTML代码，无需修改源代码。这对于添加第三方分析工具、聊天小部件或其他自定义功能非常有用。

## 功能概述

- 在网站的三个不同位置添加自定义脚本：头部(Head)、正文开始处(Body Start)和正文结束处(Body End)
- 启用/禁用单个脚本，无需删除
- 为每个脚本添加识别名称
- 支持外部脚本和内联脚本

## 使用方法

### 访问自定义脚本管理界面

1. 登录到管理后台
2. 导航到"设置"页面
3. 点击"自定义脚本"选项卡

### 添加新脚本

1. 点击"添加脚本"按钮
2. 填写脚本信息：
   - **脚本名称**：为脚本指定一个描述性名称（例如："Google Analytics"、"Facebook Pixel"）
   - **脚本位置**：选择脚本应该插入的位置
     - **头部(Head)**：脚本将被添加到`<head>`标签内（适合大多数分析工具）
     - **正文开始处(Body Start)**：脚本将被添加到`<body>`标签开始后（适合需要更早加载的脚本）
     - **正文结束处(Body End)**：脚本将被添加到`</body>`标签之前（适合可以延迟加载的脚本）
   - **脚本内容**：输入脚本代码
3. 启用脚本（默认启用）
4. 点击"保存所有脚本"按钮

### 编辑现有脚本

1. 在脚本列表中找到您要编辑的脚本
2. 修改任何字段：名称、位置或内容
3. 点击"保存所有脚本"按钮应用更改

### 启用/禁用脚本

1. 在脚本列表中找到要管理的脚本
2. 使用"启用"开关来启用或禁用脚本
3. 点击"保存所有脚本"按钮应用更改

### 删除脚本

1. 在脚本列表中找到要删除的脚本
2. 点击删除按钮（垃圾桶图标）
3. 确认删除操作

## 脚本类型示例

### 外部脚本

外部脚本通过src属性加载外部JavaScript文件。例如：

```html
<script src="https://cdn.example.com/analytics.js"></script>
```

### 内联脚本

内联脚本直接包含JavaScript代码。例如：

```html
<script>
  console.log('Hello, World!');
  document.addEventListener('DOMContentLoaded', function() {
    // 初始化代码
  });
</script>
```

### Google Analytics 示例

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Facebook Pixel 示例

```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'XXXXXXXXXXXXXXXXX');
  fbq('track', 'PageView');
</script>
```

## 注意事项

1. **安全风险**：添加自定义脚本可能带来安全风险。仅添加来自可信来源的脚本。
2. **性能影响**：过多或性能不佳的脚本可能会影响网站加载速度和用户体验。
3. **响应式设计**：确保添加的脚本在所有设备上都能正常工作。
4. **脚本冲突**：多个脚本可能相互冲突。测试添加的每个脚本，确保它们正常工作。
5. **数据隐私**：确保所有添加的跟踪脚本符合数据隐私法规（如GDPR、CCPA等）。

## 技术实现

自定义脚本功能通过以下组件实现：

1. MongoDB数据库用于存储脚本配置
2. API端点用于管理脚本（`/api/settings/custom-scripts`）
3. 服务器端组件用于在适当的位置注入脚本
4. 管理界面用于添加和管理脚本

## 故障排除

### 脚本未显示或未执行

- 确认脚本已启用
- 验证脚本位置是否正确
- 检查浏览器控制台是否有JavaScript错误
- 尝试清除浏览器缓存

### 保存脚本失败

- 确保脚本名称和内容不为空
- 检查网络连接
- 尝试刷新页面后重试

### 脚本导致网站问题

1. 禁用最近添加的脚本
2. 一次仅添加一个脚本，以识别问题来源
3. 确保脚本代码正确无误 