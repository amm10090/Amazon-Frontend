# AmazonDeals - 亚马逊优惠商品展示
# AmazonDeals - Amazon Discount Products Platform

一个基于Next.js 15构建的现代化电商优惠信息聚合平台，为用户提供实时的亚马逊商品优惠信息、智能分类和个性化收藏功能。

*A modern e-commerce discount information aggregation platform built with Next.js 15, providing users with real-time Amazon product discount information, intelligent categorization, and personalized collection features.*

## 🌟 特性 | Features

- 🎨 **现代化UI设计** - 采用HeroUI和TailwindCSS构建的简洁美观界面，支持亮色/暗色主题切换  
  *Modern UI Design - Clean and beautiful interface built with HeroUI and TailwindCSS, supporting light/dark theme switching*

- 🚀 **流畅的页面过渡动画** - 基于Framer Motion实现的自然、流畅的页面切换效果  
  *Smooth Page Transitions - Natural and fluid page switching effects implemented with Framer Motion*

- 📱 **完全响应式布局** - 从手机到桌面设备的完美适配体验  
  *Fully Responsive Layout - Perfect adaptation experience from mobile to desktop devices*

- 🔍 **智能分类与筛选** - 多维度商品筛选系统，支持价格区间、品类、评分和折扣力度等条件组合  
  *Intelligent Categorization & Filtering - Multi-dimensional product filtering system supporting combinations of price range, category, rating, and discount strength*

- ⚡ **近实时数据更新** - 基于SWR的智能缓存和自动数据刷新机制  
  *Near Real-time Data Updates - Smart caching and automatic data refresh mechanism based on SWR*

- 💖 **用户收藏系统** - 支持登录用户创建个性化收藏列表并接收价格变动提醒  
  *User Collection System - Allows logged-in users to create personalized collection lists and receive price change alerts*

- 🔒 **安全的用户认证** - 基于NextAuth.js的多方式登录认证，支持邮箱、社交账号登录  
  *Secure User Authentication - Multi-method login authentication based on NextAuth.js, supporting email and social account login*

- 📊 **性能监控与分析** - 集成Sentry错误跟踪和Hotjar用户行为分析  
  *Performance Monitoring & Analysis - Integrated with Sentry error tracking and Hotjar user behavior analysis*

## 🛠 技术栈 | Tech Stack

- **框架 | Framework**: Next.js 15 + TypeScript + React 19
- **路由 | Routing**: App Router (RSC) + Server Actions
- **样式 | Styling**: TailwindCSS 4 + tailwind-merge + clsx
- **状态管理 | State Management**: Zustand
- **数据获取 | Data Fetching**: SWR + Axios
- **认证 | Authentication**: NextAuth.js v5 + MongoDB Adapter + bcryptjs
- **数据库 | Database**: MongoDB + Mongoose
- **动画 | Animation**: Framer Motion
- **3D效果 | 3D Effects**: Three.js + React Three Fiber + Drei
- **UI库 | UI Libraries**: HeroUI + Heroicons + Lucide Icons
- **监控 | Monitoring**: Sentry + Hotjar
- **Lint/Format**: ESLint + Prettier
- **包管理 | Package Management**: pnpm

## 🚀 快速开始 | Quick Start

1. 克隆项目 | Clone the project
```bash
git clone https://github.com/your-username/amazon-deals.git
cd amazon-deals
```

2. 安装依赖 | Install dependencies
```bash
pnpm install
```

3. 配置环境变量 | Configure environment variables
```bash
cp .env.example .env.local
```
然后编辑 `.env.local` 文件，填入必要的环境变量，包括：
*Then edit the `.env.local` file and fill in the necessary environment variables, including:*
- MongoDB连接字符串 | MongoDB connection string
- NextAuth密钥和提供商配置 | NextAuth keys and provider configuration
- API密钥和端点 | API keys and endpoints

4. 启动开发服务器 | Start the development server
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看本地开发环境。
*Visit [http://localhost:3000](http://localhost:3000) to view the local development environment.*

## 📦 项目结构 | Project Structure

```
amazon-deals/
├── app/                # Next.js 应用目录 (App Router) | Next.js application directory
│   ├── api/            # API 路由和服务器端点 | API routes and server endpoints
│   ├── auth/           # 认证相关页面 | Authentication-related pages
│   └── (routes)/       # 应用页面路由 | Application page routes
├── components/         # React UI 组件 | React UI components
│   ├── ui/             # 通用UI组件 | General UI components
│   ├── layout/         # 布局组件 | Layout components
│   └── features/       # 功能型组件 | Feature components
├── lib/                # 工具函数、hooks 和共享逻辑 | Utility functions, hooks, and shared logic
│   ├── api/            # API客户端和请求函数 | API clients and request functions
│   ├── hooks/          # 自定义React hooks | Custom React hooks
│   └── utils/          # 工具函数 | Utility functions
├── store/              # Zustand 状态管理 | Zustand state management
├── config/             # 项目配置文件 | Project configuration files
├── public/             # 静态资源 (图片、字体等) | Static resources (images, fonts, etc.)
├── styles/             # 全局样式和 Tailwind 配置 | Global styles and Tailwind configuration
├── types/              # TypeScript 类型定义 | TypeScript type definitions
├── auth.ts             # NextAuth.js 配置文件 | NextAuth.js configuration file
└── ...                 # 其他配置文件 | Other configuration files
```

## 📝 开发指南 | Development Guidelines

- **组件开发 | Component Development**: 所有新组件应放置在适当的目录结构中，遵循项目的命名和样式约定  
  *All new components should be placed in the appropriate directory structure, following the project's naming and styling conventions*

- **状态管理 | State Management**: 使用Zustand创建和管理全局状态，将复杂状态逻辑拆分为独立的store  
  *Use Zustand to create and manage global state, splitting complex state logic into separate stores*

- **API调用 | API Calls**: 通过SWR进行数据获取，确保正确处理加载状态、错误和缓存  
  *Fetch data through SWR, ensuring proper handling of loading states, errors, and caching*

- **样式 | Styling**: 优先使用TailwindCSS类，避免内联样式和自定义CSS文件  
  *Prioritize using TailwindCSS classes, avoid inline styles and custom CSS files*

## 🤝 贡献 | Contributing

欢迎提交Issue和Pull Request！请确保新提交的代码：
*Issues and Pull Requests are welcome! Please ensure that newly submitted code:*

1. 通过所有Lint检查和类型检查  
   *Passes all lint checks and type checks*
2. 包含必要的测试  
   *Includes necessary tests*
3. 遵循项目的代码风格和架构约定  
   *Follows the project's code style and architectural conventions*

## 📄 许可 | License

MIT License 