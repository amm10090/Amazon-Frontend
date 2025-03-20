# AmazonDeals - 亚马逊优惠商品展示

一个现代化的电商优惠信息展示网站，基于Next.js构建。

## 🌟 特性

- 🎨 现代化UI设计，支持亮色/暗色主题
- 🚀 流畅的页面过渡动画
- 📱 完全响应式设计
- 🔍 智能分类和筛选系统
- ⚡ 实时价格更新
- 💖 用户收藏功能
- 📊 商品价格历史追踪

## 🛠 技术栈

- **框架**: Next.js 15 + TypeScript
- **样式**: TailwindCSS
- **状态管理**: Zustand
- **数据获取**: SWR
- **动画**: Framer Motion
- **3D效果**: Three.js
- **监控**: Sentry + Hotjar

## 🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/your-username/amazon-deals.git
cd amazon-deals
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```
然后编辑 `.env.local` 文件，填入必要的环境变量。

4. 启动开发服务器
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 📦 项目结构

```
amazon-deals/
├── app/                # Next.js 应用目录
├── components/         # React组件
├── lib/               # 工具函数和hooks
├── public/            # 静态资源
├── styles/            # 全局样式
└── types/             # TypeScript类型定义
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可

MIT License 