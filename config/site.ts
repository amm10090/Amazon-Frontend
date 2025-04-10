export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "OOHUNT",
  description: "Amazon Deals Display Platform",
  navItems: [
    {
      label: "All Products",
      href: "/products",
    },
    {
      label: "Limited Time Deals",
      href: "/deals",
    },
    {
      label: "About Us",
      href: "/about",
    },
  ],
  navMenuItems: [

    {
      label: "All Products",
      href: "/products",
    },
    {
      label: "Limited Time Deals",
      href: "/deals",
    },
    {
      label: "About Us",
      href: "/about",
    },
    {
      label: "Contact Us",
      href: "/legal/contact",
    },
  ],
  links: {
    github: "https://github.com/your-username/amazon-deals",
    twitter: "https://twitter.com/your-username",
    docs: "https://your-docs-site.com",
    discord: "https://discord.gg/your-server",
  },
};
