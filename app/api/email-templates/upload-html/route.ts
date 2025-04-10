import { NextResponse } from 'next/server';

// 处理HTML文件上传
export async function POST(request: Request) {
    try {
        // 使用Web标准的FormData API处理上传的文件
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'No file found' },
                { status: 400 }
            );
        }

        // 检查文件类型
        const fileType = file.type;

        if (fileType !== 'text/html' && !fileType.includes('html')) {
            return NextResponse.json(
                { success: false, message: 'Only HTML files are supported' },
                { status: 400 }
            );
        }

        // 获取文件内容
        const fileContent = await file.text();

        // 检查内容是否为有效的HTML
        if (!fileContent.includes('<!DOCTYPE html>') && !fileContent.includes('<html') && !fileContent.includes('<body')) {
            return NextResponse.json(
                { success: false, message: 'The file content is not a valid HTML' },
                { status: 400 }
            );
        }

        // 返回HTML内容
        return NextResponse.json({
            success: true,
            message: 'HTML file uploaded successfully',
            data: {
                htmlContent: fileContent,
                filename: file.name,
            }
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to upload HTML file, please try again later',
            },
            { status: 500 }
        );
    }
} 