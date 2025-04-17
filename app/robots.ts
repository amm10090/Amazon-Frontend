import type { MetadataRoute } from 'next';

// robots.txt 生成函数
export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.SITE_URL || 'https://www.oohunt.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',
                '/api/',
                '/auth/signin',
                '/auth/signout',
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
} 