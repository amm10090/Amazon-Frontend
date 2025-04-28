'use client';

import { Upload, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

/**
 * 图片上传测试页面
 * 用于测试R2图片上传API
 */
export default function TestUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // 处理文件选择
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!validTypes.includes(selectedFile.type)) {
            setError('请选择有效的图片文件 (JPEG, PNG, GIF, WebP)');

            return;
        }

        // 验证文件大小 (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('图片大小不能超过 5MB');

            return;
        }

        setFile(selectedFile);
        setError(null);
        setSuccess(false);
        setUploadedUrl(null);

        // 创建预览
        const reader = new FileReader();

        reader.onload = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    // 上传图片
    const handleUpload = async () => {
        if (!file) {
            setError('请先选择图片');

            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();

            formData.append('file', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '上传失败');
            }

            setUploadedUrl(data.url);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : '上传过程中发生错误');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">图片上传测试</h1>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800">
                    此页面用于测试图片上传API功能。确保已在环境变量中配置了Cloudflare R2。
                </p>
            </div>

            <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                        type="file"
                        id="file-input"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                        {preview ? (
                            <div className="relative">
                                <Image
                                    src={preview}
                                    alt="预览"
                                    width={256}
                                    height={256}
                                    className="max-h-64 mx-auto rounded-md object-contain"
                                />
                                <div className="mt-2 text-sm text-gray-600">点击更换图片</div>
                            </div>
                        ) : (
                            <div>
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">点击选择图片</p>
                                    <p className="text-xs text-gray-500 mt-1">支持 JPEG, PNG, GIF, WebP (最大 5MB)</p>
                                </div>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                    <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
                    <Check className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-green-700 text-sm">图片上传成功！</p>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${!file || uploading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
            >
                {uploading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        正在上传...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2" size={18} />
                        上传图片
                    </>
                )}
            </button>

            {uploadedUrl && (
                <div className="mt-6">
                    <h3 className="font-medium mb-2">上传结果：</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-mono break-all">{uploadedUrl}</p>
                        <div className="mt-2">
                            <a
                                href={uploadedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                在新窗口打开图片
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 