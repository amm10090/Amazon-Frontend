'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, List, ListOrdered, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Tag,
    AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { ProductBlot, type ProductAttributes } from './ProductBlot';
import { ProductSelector, type Product } from './ProductSelector';

// 扩展命令类型定义
interface ExtendedCommands {
    insertProduct: (attributes: ProductAttributes) => boolean;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    editorClass?: string;
    onEditorReady?: (editor: Editor) => void;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = '在此输入内容...',
    className = '',
    editorClass = '',
    onEditorReady
}: RichTextEditorProps) {
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // 客户端渲染检测
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 初始化编辑器
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                validate: href => /^https?:\/\//.test(href),
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            ProductBlot,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // 当编辑器初始化完成时，调用onEditorReady回调
    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // 处理选择产品
    const handleProductSelect = (product: Product) => {
        // 确保编辑器已初始化
        if (!editor) return;

        // 创建产品嵌入
        (editor.commands as unknown as ExtendedCommands).insertProduct({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image || '',
            sku: product.sku || '',
        });

        // 聚焦编辑器
        editor.commands.focus();
    };

    // 处理图片上传
    const handleImageUpload = () => {
        if (!editor) return;

        const input = document.createElement('input');

        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;

            if (!files || files.length === 0) return;

            const file = files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const result = e.target?.result as string;

                if (result) {
                    editor.chain().focus().setImage({ src: result }).run();
                }
            };

            reader.readAsDataURL(file);
        };

        input.click();
    };

    // 处理链接添加
    const handleLinkAdd = () => {
        if (!editor) return;

        const url = prompt('输入链接URL', 'https://');

        if (url && url !== 'https://') {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    // 如果不在客户端，返回占位符
    if (!isClient) {
        return <div className={className}><div className={editorClass}>加载编辑器...</div></div>;
    }

    // 渲染编辑器工具栏
    return (
        <div className={`rich-text-editor ${className} border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-150`}>
            {/* 工具栏 */}
            <div className="p-2 border-b border-gray-300 flex flex-wrap items-center gap-1">
                {/* 文本格式化 */}
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                    title="加粗"
                >
                    <Bold size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                    title="斜体"
                >
                    <Italic size={18} />
                </button>

                <div className="mx-1 w-px h-6 bg-gray-300" />

                {/* 列表 */}
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                    title="无序列表"
                >
                    <List size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                    title="有序列表"
                >
                    <ListOrdered size={18} />
                </button>

                <div className="mx-1 w-px h-6 bg-gray-300" />

                {/* 对齐方式 */}
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                    title="左对齐"
                >
                    <AlignLeft size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                    title="居中"
                >
                    <AlignCenter size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                    title="右对齐"
                >
                    <AlignRight size={18} />
                </button>

                <div className="mx-1 w-px h-6 bg-gray-300" />

                {/* 链接和图片 */}
                <button
                    type="button"
                    onClick={handleLinkAdd}
                    className={`p-2 rounded hover:bg-gray-100 ${editor?.isActive('link') ? 'bg-gray-200' : ''}`}
                    title="添加链接"
                >
                    <LinkIcon size={18} />
                </button>

                <button
                    type="button"
                    onClick={handleImageUpload}
                    className="p-2 rounded hover:bg-gray-100"
                    title="上传图片"
                >
                    <ImageIcon size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => setShowProductSelector(true)}
                    className="p-2 rounded hover:bg-gray-100"
                    title="添加产品"
                >
                    <Tag size={18} />
                </button>

                <div className="mx-1 w-px h-6 bg-gray-300" />

                {/* 撤销和重做 */}
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().undo().run()}
                    className="p-2 rounded hover:bg-gray-100"
                    title="撤销"
                    disabled={!editor?.can().undo()}
                >
                    <Undo size={18} />
                </button>

                <button
                    type="button"
                    onClick={() => editor?.chain().focus().redo().run()}
                    className="p-2 rounded hover:bg-gray-100"
                    title="重做"
                    disabled={!editor?.can().redo()}
                >
                    <Redo size={18} />
                </button>
            </div>

            {/* 编辑器内容区域 */}
            <EditorContent editor={editor} className={`prose max-w-none p-4 min-h-[200px] overflow-y-auto ${editorClass}`} />

            {/* 产品选择器模态框 */}
            {showProductSelector && (
                <ProductSelector
                    isOpen={showProductSelector}
                    onClose={() => setShowProductSelector(false)}
                    onSelect={handleProductSelect}
                />
            )}
        </div>
    );
} 