# 仪表盘开发文档

## 目录
- [功能概述](#功能概述)
- [角色权限系统](#角色权限系统)
- [开发日志](#开发日志)
- [使用指南](#使用指南)
- [组件文档](#组件文档)
- [API文档](#api文档)

## 功能概述

Amazon Frontend 项目的仪表盘系统提供了一个完整的后台管理解决方案，包括：

- 用户角色管理
- 数据可视化
- 产品管理
- 用户管理
- 系统设置

## 角色权限系统

### 角色类型

系统定义了三种用户角色：

```typescript
enum UserRole {
    USER = 'user',           // 普通用户
    ADMIN = 'admin',         // 管理员
    SUPER_ADMIN = 'super_admin'  // 超级管理员
}
```

### 权限映射

每个角色具有不同的权限：

| 权限 | 普通用户 | 管理员 | 超级管理员 |
|------|---------|--------|------------|
| 访问仪表盘 | ❌ | ✅ | ✅ |
| 管理产品 | ❌ | ✅ | ✅ |
| 管理用户 | ❌ | ❌ | ✅ |
| API过滤 | ❌ | ✅ | ✅ |
| 导出数据 | ❌ | ✅ | ✅ |

### 管理员账户

#### 开发环境默认账户

1. 超级管理员
   - 邮箱：`root@amazon-frontend.com`
   - 密码：`admin123`
   - 角色：`SUPER_ADMIN`

2. 管理员
   - 邮箱：`admin@amazon-frontend.com`
   - 密码：`admin123`
   - 角色：`ADMIN`

#### 预定义管理员邮箱

```typescript
const ADMIN_ACCOUNTS = [
    'root@amazon-frontend.com',
    'admin@amazon-frontend.com',
    'root@example.com',
    'admin@example.com'
];
```

使用这些邮箱注册的用户将自动获得管理员权限。

## 开发日志

### 2024-04-04：角色权限系统实现

1. 用户角色模型设计
   - 创建 `UserRole` 枚举定义角色类型
   - 实现角色权限映射
   - 添加角色辅助函数（权限检查、角色验证等）

2. 认证系统集成
   - 在 `auth.ts` 中集成角色验证
   - 实现 JWT token 中的角色信息处理
   - 添加路由权限控制

3. 仪表盘访问控制
   - 实现基于角色的路由保护
   - 添加开发环境默认管理员账户
   - 集成 Google 登录的角色处理

### 2024-04-04：仪表盘布局实现

1. 组件结构设计
   - `DashboardLayout`: 整体布局组件
   - `DashboardOverview`: 数据概览组件
   - 响应式设计适配

2. 功能实现
   - 可折叠侧边栏导航
   - 顶部状态栏
   - 面包屑导航
   - 数据统计卡片

## 使用指南

### 访问仪表盘

1. 使用预定义管理员账户登录：
   ```bash
   # 开发环境
   邮箱：root@amazon-frontend.com
   密码：admin123
   ```

2. 使用预定义邮箱注册新账户：
   - 使用 `ADMIN_ACCOUNTS` 中的任一邮箱进行注册
   - 系统将自动分配管理员权限

### 权限验证

```typescript
// 检查用户是否有特定权限
const canAccess = hasPermission(userRole, 'canAccessDashboard');

// 检查是否为管理员
const isAdmin = isAdminRole(userRole);

// 检查是否为超级管理员
const isSuperAdmin = isSuperAdmin(userRole);
```

## 组件文档

### DashboardLayout

主要的仪表盘布局组件，提供：
- 响应式侧边栏
- 顶部导航栏
- 面包屑导航
- 用户信息显示

使用示例：
```typescript
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

### DashboardOverview

仪表盘首页组件，展示：
- 数据统计卡片
- 趋势图表
- 活跃度分析

## API文档

### 权限相关 API

1. 角色检查
   ```typescript
   GET /api/auth/check-role
   响应：{ role: UserRole, permissions: RolePermissions }
   ```

2. 权限验证
   ```typescript
   POST /api/auth/verify-permission
   请求体：{ permission: string }
   响应：{ hasPermission: boolean }
   ```

## 待办事项

- [ ] 实现实际的数据获取 API
- [ ] 添加图表库集成
- [ ] 完善用户管理界面
- [ ] 添加数据导出功能
- [ ] 实现系统设置页面

## 贡献指南

1. 组件开发规范
   - 使用 TypeScript
   - 遵循文件命名规范
   - 添加适当的注释和文档

2. 提交代码
   - 遵循 Git commit 规范
   - 确保通过所有测试
   - 更新相关文档 