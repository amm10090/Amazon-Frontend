import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from './r2';

/**
 * 验证文件类型
 * @param contentType MIME类型
 * @returns 是否为有效的图片类型
 */
export function isValidImageType(contentType: string): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    return validTypes.includes(contentType);
}

/**
 * 从文件名中提取扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export function getExtensionFromFilename(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
}

/**
 * 将图片上传到Cloudflare R2存储
 * @param file 文件Buffer
 * @param filename 原始文件名
 * @param contentType 文件MIME类型
 * @returns 上传后的公开访问URL
 */
export async function uploadImageToR2(
    file: Buffer,
    filename: string,
    contentType: string
): Promise<string> {
    // 生成唯一文件名
    const ext = getExtensionFromFilename(filename);
    const uniqueFilename = `${Date.now()}-${uuidv4().substring(0, 8)}.${ext}`;

    // 存储在images文件夹下，按年月组织
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const key = `images/${year}/${month}/${uniqueFilename}`;

    // 上传文件到R2
    await r2Client.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: contentType,
            // 设置公共访问权限（需要存储桶配置为公共可读）
            ACL: 'public-read',
        })
    );

    // 返回可访问的URL
    return `${R2_PUBLIC_URL}/${key}`;
} 