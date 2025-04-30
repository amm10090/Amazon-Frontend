import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';

interface CoverImageUploaderProps {
    currentImageUrl: string;
    onImageUploaded: (url: string) => void;
}

/**
 * 封面图片上传组件
 * 用于CMS页面的封面图片上传
 */
export default function CoverImageUploader({ currentImageUrl, onImageUploaded }: CoverImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(currentImageUrl);

    // 当外部currentImageUrl变化时更新内部状态
    React.useEffect(() => {
        setImageUrl(currentImageUrl);
    }, [currentImageUrl]);

    // 处理文件上传 (Moved before handleDrop)
    const handleFileUpload = useCallback(async (file: File) => {
        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)');

            return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');

            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();

            formData.append('file', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // 设置内部状态并通知父组件
            setImageUrl(data.url);
            onImageUploaded(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during upload');
        } finally {
            setIsUploading(false);
        }
    }, [onImageUploaded]);

    // 处理拖拽进入事件
    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    // 处理拖拽离开事件
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    // 处理拖拽悬停事件
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // 处理拖放事件
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;

        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    }, [handleFileUpload]);

    // 处理文件选择事件
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            handleFileUpload(file);
        }
    }, [handleFileUpload]);

    // 处理URL输入变更
    const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setImageUrl(e.target.value);
        // 当用户输入URL时同时通知父组件
        onImageUploaded(e.target.value);
    }, [onImageUploaded]);

    // 移除当前图片
    const handleRemoveImage = useCallback(() => {
        setImageUrl('');
        onImageUploaded('');
    }, [onImageUploaded]);

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>

            {imageUrl ? (
                <div className="relative inline-block">
                    <Image
                        src={imageUrl}
                        alt="Cover Image"
                        width={320}
                        height={200}
                        className="h-40 w-64 object-cover rounded-md border border-gray-300"
                        unoptimized
                    />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1"
                        title="Remove Image"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : null}

            <div
                className={`border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-md p-6 transition-colors`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                        <p className="text-sm text-gray-600">
                            {imageUrl ? 'Drag and drop new image here to replace' : 'Drag and drop image here to upload'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Supports JPEG, PNG, GIF, WebP, SVG (Max 5MB)
                        </p>
                        <button
                            onClick={() => document.getElementById('cover-image-input')?.click()}
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            type="button"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={14} className="mr-1" />
                                    Select Image
                                </>
                            )}
                        </button>
                        <input
                            id="cover-image-input"
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
            )}

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1">
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={handleUrlChange}
                        placeholder="Enter image URL..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
} 