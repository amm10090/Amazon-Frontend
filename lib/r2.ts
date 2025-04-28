import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cloudflare R2存储客户端配置
 * 使用AWS S3兼容API与Cloudflare R2进行交互
 */
export const r2Client = new S3Client({
    region: 'auto', // Cloudflare R2使用auto作为区域
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

// 存储桶名称
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'amazon-frontend-assets';

// 公共访问URL前缀
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; 