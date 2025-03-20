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
};

module.exports = nextConfig;
