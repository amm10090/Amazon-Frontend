import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@/auth';

// 初始化S3客户端（用于Cloudflare R2）
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

// 允许的文件类型
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];

// 最大文件大小（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 是否为测试模式
const TEST_MODE = process.env.R2_TEST_MODE === 'true';

export async function POST(request: NextRequest) {
    try {
        // 验证用户身份
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: '未授权访问' },
                { status: 401 }
            );
        }

        // 检查用户角色（可选，根据需要调整）
        // 此处可根据实际需求增加管理员角色验证

        // 处理表单数据
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: '未找到文件' },
                { status: 400 }
            );
        }

        // 验证文件类型
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: '不支持的文件类型' },
                { status: 400 }
            );
        }

        // 验证文件大小
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: '文件大小超过限制（5MB）' },
                { status: 400 }
            );
        }

        // 如果是测试模式，则返回模拟成功响应
        if (TEST_MODE) {

            // 生成唯一文件名
            const extension = file.name.split('.').pop() || '';
            const fileName = `test-${uuidv4()}.${extension}`;
            const filePath = `uploads/images/${fileName}`;

            // 构建模拟URL
            const publicUrl = `https://test-r2-url.example.com/${filePath}`;

            return NextResponse.json({
                success: true,
                url: publicUrl,
                fileName,
                testMode: true
            });
        }

        // 读取文件内容
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // 生成唯一文件名
        const extension = file.name.split('.').pop() || '';
        const fileName = `${uuidv4()}.${extension}`;
        const filePath = `uploads/images/${fileName}`;

        // 上传到R2
        await s3Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filePath,
            Body: fileBuffer,
            ContentType: file.type,
        }));

        // 构建公共URL
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${filePath}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName,
        });

    } catch {

        return NextResponse.json(
            { error: '上传图片失败' },
            { status: 500 }
        );
    }
}

// 设置允许的最大负载大小（10MB）
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}; 