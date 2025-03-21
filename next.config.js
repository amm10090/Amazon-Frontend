/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images-na.ssl-images-amazon.com', 'images-cn.ssl-images-amazon.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://89.116.212.208:5001/api/:path*',
            },
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
