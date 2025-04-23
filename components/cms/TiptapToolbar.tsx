import type { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough, List, ListOrdered, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Tag, Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, Code, Quote,
    Trash2, ChevronsUp, ChevronsDown, Highlighter, Type, Palette,
    CornerDownLeft
} from 'lucide-react';
import { useCallback } from 'react';

interface TiptapToolbarProps {
    editor: Editor | null;
    onAddProduct: (e: React.MouseEvent<HTMLButtonElement>) => void; // 更新回调函数类型
}

// 预设高亮颜色
const highlightColors = {
    yellow: '#fef3c7',
    green: '#d1fae5',
    pink: '#fce7f3',
    blue: '#dbeafe',
};

// 预设文本颜色
const textColors = {
    default: '#000000',
    gray: '#64748b',
    brown: '#78350f',
    red: '#dc2626',
    orange: '#ea580c',
    yellow: '#ca8a04',
    green: '#16a34a',
    blue: '#2563eb',
    purple: '#9333ea',
    pink: '#db2777',
};

export function TiptapToolbar({ editor, onAddProduct }: TiptapToolbarProps) {
    // 处理图片上传
    const handleImageUpload = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!editor) return;

        const url = prompt('输入图片 URL:', 'https://');

        if (url && url !== 'https://') {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    // 处理链接添加
    const handleLinkAdd = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = prompt('输入链接 URL:', previousUrl || 'https://');

        // 用户取消
        if (url === null) {
            return;
        }

        // 用户清空URL，则移除链接
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        // 设置链接
        if (url && url !== 'https://') {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    }, [editor]);

    // 清除格式
    const clearFormatting = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().clearNodes().unsetAllMarks().run();
    }, [editor]);

    // 应用排版规则
    const applyTypography = useCallback(() => {
        if (!editor) return;
        // Typography 插件会自动将(c) → ©, (tm) → ™, 等
        // 这个按钮主要是提示用户有这个功能
        alert('排版功能已启用，支持以下自动转换：\n\n(c) → ©\n(tm) → ™\n(r) → ®\n1/2 → ½\n-> → →\n-- → –\n... → …');
    }, [editor]);

    // 插入或取消强制换行（硬断行）
    const toggleHardBreak = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().setHardBreak().run();
    }, [editor]);

    // 向上/向下移动段落
    const moveParagraphUp = useCallback(() => {
        if (!editor) return;
        // 目前Tiptap没有内置命令用于移动段落，这里只是示例
        // 实际需要自定义扩展实现
        alert('【功能演示】向上移动段落');
    }, [editor]);

    const moveParagraphDown = useCallback(() => {
        if (!editor) return;
        // 目前Tiptap没有内置命令用于移动段落，这里只是示例
        // 实际需要自定义扩展实现
        alert('【功能演示】向下移动段落');
    }, [editor]);

    // 应用高亮颜色
    const applyHighlightColor = useCallback((color: string | null) => {
        if (!editor) return;
        if (color === null) {
            // 移除高亮
            editor.chain().focus().unsetHighlight().run();
        } else {
            // 应用或切换指定颜色高亮
            editor.chain().focus().toggleHighlight({ color }).run();
        }
    }, [editor]);

    // 应用文本颜色
    const applyTextColor = useCallback((color: string | null) => {
        if (!editor) return;

        try {
            if (color === null || color === textColors.default) {
                // 移除颜色，使用unsetColor命令
                editor.chain().focus().unsetColor().run();
            } else {
                // 设置颜色，使用setColor命令
                editor.chain().focus().setColor(color).run();
            }
        } catch {
            return
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="p-2 border-b border-gray-300 flex flex-wrap items-center gap-1 bg-white sticky top-0 z-10">
            {/* 撤销/重做 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="撤销"
                    disabled={!editor.can().undo()}
                >
                    <Undo size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="重做"
                    disabled={!editor.can().redo()}
                >
                    <Redo size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 文本格式化 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                    title="加粗"
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                    title="斜体"
                >
                    <Italic size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
                    title="下划线"
                >
                    <Underline size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
                    title="删除线"
                >
                    <Strikethrough size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => applyHighlightColor(null)}
                    className={`p-1.5 rounded hover:bg-gray-100 ${!editor.isActive('highlight') ? '' : 'bg-gray-200'}`}
                    title="移除高亮"
                >
                    <Highlighter size={16} className="text-gray-400" />
                </button>
                <div className="flex items-center ml-1 border-l pl-1">
                    <Palette size={16} className="mr-1 text-gray-500" />
                    {Object.entries(highlightColors).map(([name, color]) => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => applyHighlightColor(color)}
                            className={`w-5 h-5 rounded border border-gray-300 mr-1 ${editor.isActive('highlight', { color }) ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                            style={{ backgroundColor: color }}
                            title={`高亮 (${name})`}
                        />
                    ))}
                </div>

                {/* 文本颜色选择器 */}
                <div className="flex items-center ml-1 border-l pl-1">
                    <span className="inline-block w-4 h-4 mr-1 text-gray-500 font-bold">A</span>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {/* 默认黑色 */}
                        <button
                            type="button"
                            onClick={() => applyTextColor(null)}
                            className={`w-5 h-5 rounded-full border border-gray-300 mr-0.5 flex items-center justify-center ${!editor.isActive('textStyle') ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                            title="默认颜色"
                        >
                            <span className="text-[10px]">Aa</span>
                        </button>

                        {/* 其他颜色选项 */}
                        {Object.entries(textColors).filter(([name]) => name !== 'default').map(([name, color]) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => applyTextColor(color)}
                                className={`w-5 h-5 rounded-full border border-gray-300 mr-0.5 ${editor.isActive('textStyle', { color }) ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                style={{ backgroundColor: color }}
                                title={`文本颜色 (${name})`}
                            />
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={clearFormatting}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="清除格式"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 标题 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                    title="一级标题"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                    title="二级标题"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                    title="三级标题"
                >
                    <Heading3 size={16} />
                </button>
                <button
                    type="button"
                    onClick={applyTypography}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="智能排版 (自动转换特殊符号)"
                >
                    <Type size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 对齐方式 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                    title="左对齐"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                    title="居中"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                    title="右对齐"
                >
                    <AlignRight size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 列表 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                    title="无序列表"
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                    title="有序列表"
                >
                    <ListOrdered size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 引用和代码块 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                    title="引用"
                >
                    <Quote size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                    title="代码块"
                >
                    <Code size={16} />
                </button>
                <button
                    type="button"
                    onClick={toggleHardBreak}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="强制换行 (Shift+Enter)"
                >
                    <CornerDownLeft size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 链接、图片、产品 */}
            <div className="flex items-center mr-1">
                <button
                    type="button"
                    onClick={handleLinkAdd}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
                    title="添加/编辑链接"
                >
                    <LinkIcon size={16} />
                </button>
                <button
                    type="button"
                    onClick={handleImageUpload}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="插入图片 (URL)"
                >
                    <ImageIcon size={16} />
                </button>
                <button
                    type="button"
                    onClick={onAddProduct}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="添加产品"
                >
                    <Tag size={16} />
                </button>
            </div>
            <div className="mx-1 w-px h-6 bg-gray-300" />

            {/* 段落操作 */}
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={moveParagraphUp}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="向上移动段落"
                >
                    <ChevronsUp size={16} />
                </button>
                <button
                    type="button"
                    onClick={moveParagraphDown}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="向下移动段落"
                >
                    <ChevronsDown size={16} />
                </button>
            </div>
        </div>
    );
} 