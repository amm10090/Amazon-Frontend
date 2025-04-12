/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        minimumCacheTTL: 2678400,
        formats: ['image/webp'],
        qualities: [75],

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
    turbopack: {
        rules: {
            fs: false,
            child_process: false,
            net: false,
            tls: false,
            dns: false,
            os: false,
            cluster: false,
            v8: false,
            // MongoDB 相关模块
            mongodb: false,
            'mongodb-client-encryption': false,
            '@mongodb-js/zstd': false,
            snappy: false,
            kerberos: false,
            aws4: false,
        },
    },
    // 保留webpack配置用于生产构建
    webpack: (config, { isServer }) => {
        // 只对客户端构建进行调整，服务器端构建保持不变
        if (!isServer) {
            // 防止客户端包含 Node.js 模块和 MongoDB 相关模块
            // 这解决了 MongoDB 客户端在浏览器环境中尝试加载 Node.js 内置模块的问题
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                child_process: false,
                net: false,
                tls: false,
                dns: false,
                os: false,
                cluster: false,
                v8: false,
                // MongoDB 相关模块
                mongodb: false,
                'mongodb-client-encryption': false,
                '@mongodb-js/zstd': false,
                snappy: false,
                kerberos: false,
                aws4: false,
            };
        }
        return config;
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
