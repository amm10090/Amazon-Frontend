import type { MetadataRoute } from 'next';

// 网站地图生成函数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 当前日期作为静态页面的最后修改日期
    const currentDate = new Date().toISOString();

    // 静态路由列表
    const staticRoutes = [
        '',
        '/about-us',
        '/contact-us',
        '/terms-of-use',
        '/privacy-policy',
        '/cookies-policy',
        '/disclaimer',
        '/affiliate-disclosure',
        '/deals',
        '/favorites',
        '/categories',
    ].map(route => ({
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oohunt.com'}${route}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 返回静态路由
    return staticRoutes;
} 