export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "OOHUNT",
  description: "Amazon Deals Display Platform",
  navItems: [
    {
      label: "All Products",
      href: "/product",
    },
    {
      label: "Limited Time Deals",
      href: "/deals",
    },
    {
      label: "About Us",
      href: "/about-us",
    },
  ],
  navMenuItems: [

    {
      label: "All Products",
      href: "/product",
    },
    {
      label: "Limited Time Deals",
      href: "/deals",
    },
    {
      label: "About Us",
      href: "/about-us",
    },
    {
      label: "Contact Us",
      href: "/contact-us",
    },
  ],
  links: {
    github: "https://github.com/your-username/amazon-deals",
    twitter: "https://twitter.com/your-username",
    docs: "https://your-docs-site.com",
    discord: "https://discord.gg/your-server",
  },
};
