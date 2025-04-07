/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images-na.ssl-images-amazon.com',
            },
            {
                protocol: 'https',
                hostname: 'images-cn.ssl-images-amazon.com',
            },
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
    async rewrites() {
        return [
            // 转发非用户管理的 API 到远程服务器
            {
                source: '/api/brands/:path*',
                destination: 'http://89.116.212.208:5001/api/brands/:path*',
            },
            {
                source: '/api/products/:path*',
                destination: 'http://89.116.212.208:5001/api/products/:path*',
            },
            {
                source: '/api/categories/:path*',
                destination: 'http://89.116.212.208:5001/api/categories/:path*',
            },
            {
                source: '/api/health/:path*',
                destination: 'http://89.116.212.208:5001/api/health/:path*',
            },
            {
                source: '/api/search/products/:path*',
                destination: 'http://89.116.212.208:5001/api/search/products/:path*',
            },
            {
                source: '/api/products/count/:path*',
                destination: 'http://89.116.212.208:5001/api/products/list/:path*',
            },
            // 其他 API 路由保持在本地
            {
                source: '/api/users/:path*',
                destination: '/api/users/:path*', // 本地路由
            }
        ];
    },
    async headers() {
        return [
            {
                // 匹配所有API路由
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
                ],
            },
        ];
    },
};

export default nextConfig;
