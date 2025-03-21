export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Amazon Deals",
  description: "亚马逊优惠信息展示平台",
  navItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "全部商品",
      href: "/products",
    },
    {
      label: "限时特惠",
      href: "/deals",
    },
    {
      label: "我的收藏",
      href: "/favorites",
    },
    {
      label: "关于我们",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "全部商品",
      href: "/products",
    },
    {
      label: "限时特惠",
      href: "/deals",
    },
    {
      label: "热门分类",
      href: "/categories",
    },
    {
      label: "我的收藏",
      href: "/favorites",
    },
    {
      label: "使用指南",
      href: "/guide",
    },
    {
      label: "联系我们",
      href: "/contact",
    },
    {
      label: "关于我们",
      href: "/about",
    },
  ],
  links: {
    github: "https://github.com/your-username/amazon-deals",
    twitter: "https://twitter.com/your-username",
    docs: "https://your-docs-site.com",
    discord: "https://discord.gg/your-server",
  },
};
