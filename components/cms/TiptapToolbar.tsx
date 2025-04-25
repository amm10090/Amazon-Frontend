import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Popover, PopoverTrigger, PopoverContent, Input, Kbd, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch } from '@heroui/react';
import type { Editor } from '@tiptap/core';
import {
    Bold, Italic, Underline, Strikethrough, List, ListOrdered, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Tag, Heading,
    AlignLeft, AlignCenter, AlignRight, Code, Quote,
    Trash2, Highlighter, Type, Palette,
    CornerDownLeft,
    Video as YoutubeIcon, // 使用 Video 图标替代已弃用的 Youtube 图标
    Keyboard,
    Database
} from 'lucide-react';
import { useState, useCallback } from 'react';

import type { ComponentProduct } from '@/types';

import { ColorPickerPopover } from './ColorPickerPopover';
import type { ProductMetadataAttributes } from './ProductMetadataBlot';
import { ProductMetadataSelector } from './ProductMetadataSelector';
import { ProductSelector } from './ProductSelector';

// 为编辑器链定义扩展接口
interface ExtendedChain {
    insertProductMetadata: (attributes: ProductMetadataAttributes) => { run: () => boolean };
}

interface TiptapToolbarProps {
    editor: Editor | null;
    onAddProduct: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// 辅助函数，用于生成 Kbd 标签
const ShortcutKey = ({ children }: { children: React.ReactNode }) => (
    <Kbd className="text-xs">{children}</Kbd>
);

export function TiptapToolbar({ editor, onAddProduct }: TiptapToolbarProps) {
    const [isTypographyModalOpen, setIsTypographyModalOpen] = useState(false);
    const [isYoutubePopoverOpen, setIsYoutubePopoverOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [youtubeWidth, setYoutubeWidth] = useState('640');
    const [youtubeHeight, setYoutubeHeight] = useState('480');
    // 新增链接和图片 Popover 状态
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false);
    const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    // 新增：快捷键模态框状态
    const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ComponentProduct | null>(null);
    const [isMetadataSelectorOpen, setIsMetadataSelectorOpen] = useState(false);
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

    // 新增：切换快捷键模态框
    const toggleShortcutModal = useCallback(() => {
        setIsShortcutModalOpen(!isShortcutModalOpen);
    }, [isShortcutModalOpen]);

    // 清除格式
    const clearFormatting = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().clearNodes().unsetAllMarks().run();
    }, [editor]);

    // 应用排版规则
    const applyTypography = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsTypographyModalOpen(true);
    }, []);

    // 插入或取消强制换行（硬断行）
    const toggleHardBreak = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().setHardBreak().run();
    }, [editor]);

    // 修改：handleYoutubeAdd 只打开 Popover
    const handleYoutubeAdd = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!editor) return;
        // 打开 Popover 时，不清空 URL，以便用户可以编辑之前的输入
        setIsYoutubePopoverOpen(true);
    }, [editor]);

    // 更新：应用 YouTube URL，包含宽度和高度
    const applyYoutubeUrl = useCallback(() => {
        if (!editor) return;
        const urlToApply = youtubeUrl.trim();
        const parsedWidth = parseInt(youtubeWidth, 10);
        const parsedHeight = parseInt(youtubeHeight, 10);
        const finalWidth = (!isNaN(parsedWidth) && parsedWidth > 0) ? parsedWidth : 640;
        const finalHeight = (!isNaN(parsedHeight) && parsedHeight > 0) ? parsedHeight : 480;

        if (urlToApply) {
            try {
                new URL(urlToApply);
                if (urlToApply.includes('youtube.com') || urlToApply.includes('youtu.be')) {
                    editor.chain().focus().setYoutubeVideo({
                        src: urlToApply,
                        width: finalWidth,
                        height: finalHeight
                    }).run();
                    setIsYoutubePopoverOpen(false);
                    setYoutubeUrl('');
                    setYoutubeWidth('640');
                    setYoutubeHeight('480');
                } else {
                    alert('请输入有效的 YouTube 或 YouTube Music 链接。');
                }
            } catch {
                alert('输入的 URL 无效。');
            }
        } else {
            setIsYoutubePopoverOpen(false);
            setYoutubeUrl('');
            setYoutubeWidth('640');
            setYoutubeHeight('480');
        }
    }, [editor, youtubeUrl, youtubeWidth, youtubeHeight]);

    // 新增：处理取消操作，重置状态
    const handleYoutubeCancel = useCallback(() => {
        setIsYoutubePopoverOpen(false);
        setYoutubeUrl('');
        setYoutubeWidth('640');
        setYoutubeHeight('480');
    }, []);

    // 应用链接 URL
    const applyLinkUrl = useCallback(() => {
        if (!editor) return;
        const urlToSet = linkUrl.trim();

        if (urlToSet === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            if (!/^https?:\/\//i.test(urlToSet)) {
                alert('请输入有效的 URL (以 http:// 或 https:// 开头)');

                return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({
                href: urlToSet,
                target: linkOpenInNewTab ? '_blank' : null
            }).run();
        }
        setIsLinkPopoverOpen(false);
        setLinkUrl('');
        setLinkOpenInNewTab(false);
    }, [editor, linkUrl, linkOpenInNewTab]);

    // 移除链接
    const handleLinkRemove = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setIsLinkPopoverOpen(false);
        setLinkUrl('');
        setLinkOpenInNewTab(false);
    }, [editor]);

    // 应用图片 URL
    const applyImageUrl = useCallback(() => {
        if (!editor) return;
        const urlToApply = imageUrl.trim();

        if (urlToApply) {
            // 可选：添加更严格的URL验证
            try {
                new URL(urlToApply); // 基础验证
                editor.chain().focus().setImage({ src: urlToApply }).run();
                setIsImagePopoverOpen(false);
                setImageUrl(''); // 成功后清空
            } catch {
                alert('输入的图片 URL 无效。');
            }
        } else {
            // 如果URL为空，可以选择关闭或提示用户输入
            setIsImagePopoverOpen(false);
        }
    }, [editor, imageUrl]);

    // 取消图片插入
    const handleImageCancel = useCallback(() => {
        setIsImagePopoverOpen(false);
        setImageUrl(''); // 取消时清空
    }, []);

    // 修改 handleMetadataSelect 函数
    const handleMetadataSelect = useCallback((fieldId: string) => {
        if (!editor || !selectedProduct) return;

        const attributes: ProductMetadataAttributes = {
            productId: selectedProduct.id || selectedProduct.asin || '',
            fieldId
        };

        // 使用 chain() 方法
        const chain = editor.chain().focus();

        (chain as unknown as ExtendedChain).insertProductMetadata(attributes).run();
    }, [editor, selectedProduct]);

    // 修改 handleProductSelect 函数
    const handleProductSelect = useCallback((product: ComponentProduct) => {
        setSelectedProduct(product);
        setIsMetadataSelectorOpen(true);
    }, []);

    // 新增处理数据库按钮点击的函数
    const handleMetadataButtonClick = useCallback(() => {
        setIsProductSelectorOpen(true);
    }, []);

    // 新增：获取当前标题级别或'p'
    const getCurrentHeadingLevel = useCallback(() => {
        if (!editor) return 'p';
        for (let i = 1; i <= 6; i++) {
            if (editor.isActive('heading', { level: i as 1 | 2 | 3 | 4 | 5 | 6 })) {
                return `h${i}`;
            }
        }

        return 'p';
    }, [editor]);

    // 新增：处理标题选择
    const handleHeadingSelect = useCallback((key: React.Key) => {
        if (!editor) return;
        const level = key.toString();

        if (level === 'p') {
            editor.chain().focus().setParagraph().run();
        } else {
            const headingLevel = parseInt(level.substring(1), 10) as 1 | 2 | 3 | 4 | 5 | 6;

            editor.chain().focus().toggleHeading({ level: headingLevel }).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    // 快捷键数据（根据启用的扩展和 Tiptap 文档整理）
    // 注意：Mod = Cmd (macOS) / Ctrl (Windows/Linux)
    const shortcuts = [
        {
            category: '基本操作', items: [
                { action: '撤销', win: 'Ctrl + Z', mac: 'Cmd + Z' },
                { action: '重做', win: 'Ctrl + Shift + Z', mac: 'Cmd + Shift + Z' },
                { action: '强制换行', win: 'Shift + Enter 或 Ctrl + Enter', mac: 'Shift + Enter 或 Cmd + Enter' },
                { action: '复制', win: 'Ctrl + C', mac: 'Cmd + C' },
                { action: '剪切', win: 'Ctrl + X', mac: 'Cmd + X' },
                { action: '粘贴', win: 'Ctrl + V', mac: 'Cmd + V' },
                { action: '无格式粘贴', win: 'Ctrl + Shift + V', mac: 'Cmd + Shift + V' },
            ]
        },
        {
            category: '文本格式化', items: [
                { action: '加粗', win: 'Ctrl + B', mac: 'Cmd + B' },
                { action: '斜体', win: 'Ctrl + I', mac: 'Cmd + I' },
                { action: '下划线', win: 'Ctrl + U', mac: 'Cmd + U' },
                { action: '删除线', win: 'Ctrl + Shift + S', mac: 'Cmd + Shift + S' },
                { action: '代码', win: 'Ctrl + E', mac: 'Cmd + E' },
                { action: '高亮', win: 'Ctrl + Shift + H', mac: 'Cmd + Shift + H' },
            ]
        },
        {
            category: '段落格式化', items: [
                { action: '普通文本', win: 'Ctrl + Alt + 0', mac: 'Cmd + Alt + 0' },
                { action: '一级标题', win: 'Ctrl + Alt + 1', mac: 'Cmd + Alt + 1' },
                { action: '二级标题', win: 'Ctrl + Alt + 2', mac: 'Cmd + Alt + 2' },
                { action: '三级标题', win: 'Ctrl + Alt + 3', mac: 'Cmd + Alt + 3' },
                { action: '无序列表', win: 'Ctrl + Shift + 8', mac: 'Cmd + Shift + 8' },
                { action: '有序列表', win: 'Ctrl + Shift + 7', mac: 'Cmd + Shift + 7' },
                { action: '引用', win: 'Ctrl + Shift + B', mac: 'Cmd + Shift + B' },
                { action: '代码块', win: 'Ctrl + Alt + C', mac: 'Cmd + Alt + C' },
                { action: '左对齐', win: 'Ctrl + Shift + L', mac: 'Cmd + Shift + L' },
                { action: '居中对齐', win: 'Ctrl + Shift + E', mac: 'Cmd + Shift + E' },
                { action: '右对齐', win: 'Ctrl + Shift + R', mac: 'Cmd + Shift + R' },
            ]
        },
    ];

    // 检测操作系统 (简易方式，可能不完全准确)
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return (
        <div className="p-2 border-b border-gray-300 flex items-center justify-between bg-white sticky top-0 z-10 w-full">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* 撤销/重做 */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="撤销 (Ctrl+Z)"
                        disabled={!editor.can().undo()}
                    >
                        <Undo size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="重做 (Ctrl+Shift+Z)"
                        disabled={!editor.can().redo()}
                    >
                        <Redo size={16} />
                    </button>
                </div>
                <div className="h-6 w-px bg-gray-300" />

                {/* 文本格式化 */}
                <div className="flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                        title="加粗 (Ctrl+B)"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                        title="斜体 (Ctrl+I)"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
                        title="下划线 (Ctrl+U)"
                    >
                        <Underline size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
                        title="删除线 (Ctrl+Shift+S)"
                    >
                        <Strikethrough size={16} />
                    </button>

                    {/* 高亮颜色选择器 Popover */}
                    <ColorPickerPopover
                        editor={editor}
                        mode="highlight"
                        trigger={
                            <button
                                type="button"
                                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('highlight') ? 'bg-blue-100 text-blue-600' : ''}`}
                                title="高亮颜色 (Ctrl+Shift+H)"
                            >
                                <Highlighter size={16} />
                            </button>
                        }
                    />
                </div>

                {/* 文本颜色选择器 Popover */}
                <div className="flex items-center">
                    <ColorPickerPopover
                        editor={editor}
                        mode="textColor"
                        trigger={
                            <button
                                type="button"
                                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('textStyle') ? 'bg-blue-100 text-blue-600' : ''}`}
                                title="文本颜色"
                            >
                                <Palette size={16} />
                            </button>
                        }
                    />
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
            <div className="h-6 w-px bg-gray-300" />

            {/* 标题 - 改为下拉菜单 */}
            <div className="flex items-center space-x-1">
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            variant="light" // 或其他你喜欢的样式
                            className="p-1.5 rounded hover:bg-gray-100 data-[hover=true]:bg-gray-100 min-w-0" // 调整样式以适应按钮
                            title="标题级别"
                        >
                            {/* 可以根据当前级别显示不同内容，或保持通用图标 */}
                            <Heading size={16} />
                            {/* <span className="ml-1 text-xs">{getCurrentHeadingLevel().toUpperCase()}</span> */}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Heading Levels"
                        onAction={handleHeadingSelect}
                        selectedKeys={[getCurrentHeadingLevel()]} // 高亮当前级别
                        selectionMode="single"
                    >
                        <DropdownItem key="p">普通文本</DropdownItem>
                        <DropdownItem key="h1">一级标题</DropdownItem>
                        <DropdownItem key="h2">二级标题</DropdownItem>
                        <DropdownItem key="h3">三级标题</DropdownItem>
                        <DropdownItem key="h4">四级标题</DropdownItem>
                        <DropdownItem key="h5">五级标题</DropdownItem>
                        <DropdownItem key="h6">六级标题</DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <button
                    type="button"
                    onClick={applyTypography}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="智能排版 (自动转换特殊符号)"
                >
                    <Type size={16} />
                </button>
            </div>
            <div className="h-6 w-px bg-gray-300" />

            {/* 对齐方式 */}
            <div className="flex items-center space-x-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                    title="左对齐 (Ctrl+Shift+L)"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                    title="居中 (Ctrl+Shift+E)"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                    title="右对齐 (Ctrl+Shift+R)"
                >
                    <AlignRight size={16} />
                </button>
            </div>
            <div className="h-6 w-px bg-gray-300" />

            {/* 列表 */}
            <div className="flex items-center space-x-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                    title="无序列表 (Ctrl+Shift+8)"
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                    title="有序列表 (Ctrl+Shift+7)"
                >
                    <ListOrdered size={16} />
                </button>
            </div>
            <div className="h-6 w-px bg-gray-300" />

            {/* 引用和代码块 */}
            <div className="flex items-center space-x-1">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                    title="引用 (Ctrl+Shift+B)"
                >
                    <Quote size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                    title="代码块 (Ctrl+Alt+C)"
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
            <div className="h-6 w-px bg-gray-300" />

            {/* 链接、图片、产品、YouTube */}
            <div className="flex items-center space-x-1">
                {/* 链接 Popover */}
                <Popover placement="bottom" isOpen={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                    <PopoverTrigger>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const attrs = editor?.getAttributes('link');
                                const currentUrl = attrs?.href || '';
                                const currentTarget = attrs?.target;

                                setLinkUrl(currentUrl);
                                setLinkOpenInNewTab(currentTarget === '_blank');
                                setIsLinkPopoverOpen(true);
                            }}
                            className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
                            title="添加/编辑链接"
                        >
                            <LinkIcon size={16} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 w-72">
                        <div className="space-y-3">
                            <label htmlFor="toolbar-link-url-input" className="block text-sm font-medium text-gray-700 mb-1">
                                链接 URL
                            </label>
                            <Input
                                id="toolbar-link-url-input"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                type="url"
                                size="sm"
                            />
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                <label htmlFor="toolbar-link-new-tab" className="text-sm text-gray-600 select-none">
                                    在新标签页打开
                                </label>
                                <Switch
                                    id="toolbar-link-new-tab"
                                    isSelected={linkOpenInNewTab}
                                    onValueChange={setLinkOpenInNewTab}
                                    size="sm"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button size="sm" variant="bordered" onPress={handleLinkRemove}>
                                    移除
                                </Button>
                                <Button size="sm" color="primary" onPress={applyLinkUrl}>
                                    应用
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* 图片 Popover */}
                <Popover placement="bottom" isOpen={isImagePopoverOpen} onOpenChange={setIsImagePopoverOpen}>
                    <PopoverTrigger>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setImageUrl('');
                                setIsImagePopoverOpen(true);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title="插入图片 (URL)"
                        >
                            <ImageIcon size={16} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 w-72">
                        <div className="space-y-3">
                            <label htmlFor="image-url-input" className="block text-sm font-medium text-gray-700 mb-1">
                                图片 URL
                            </label>
                            <Input
                                id="image-url-input"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                type="url"
                                size="sm"
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button size="sm" variant="bordered" onPress={handleImageCancel}>
                                    取消
                                </Button>
                                <Button size="sm" color="primary" onPress={applyImageUrl}>
                                    应用
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* YouTube Popover */}
                <Popover placement="bottom" isOpen={isYoutubePopoverOpen} onOpenChange={setIsYoutubePopoverOpen}>
                    <PopoverTrigger>
                        <button
                            type="button"
                            onClick={handleYoutubeAdd}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title="插入 YouTube 视频"
                        >
                            <YoutubeIcon size={16} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 w-72">
                        <div className="space-y-3">
                            <label htmlFor="youtube-url-input" className="block text-sm font-medium text-gray-700 mb-1">
                                YouTube URL
                            </label>
                            <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                type="url"
                                size="sm"
                                id="youtube-url-input"
                                className=""
                            />
                            <div className="flex gap-3 mb-3">
                                <div className="flex-1">
                                    <label htmlFor="youtube-width-input" className="block text-sm font-medium text-gray-700 mb-1">宽度 (px)</label>
                                    <Input
                                        placeholder="640"
                                        value={youtubeWidth}
                                        onChange={(e) => setYoutubeWidth(e.target.value)}
                                        type="number"
                                        min="1"
                                        size="sm"
                                        id="youtube-width-input"
                                        className=""
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="youtube-height-input" className="block text-sm font-medium text-gray-700 mb-1">高度 (px)</label>
                                    <Input
                                        placeholder="480"
                                        value={youtubeHeight}
                                        onChange={(e) => setYoutubeHeight(e.target.value)}
                                        type="number"
                                        min="1"
                                        size="sm"
                                        id="youtube-height-input"
                                        className=""
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button size="sm" variant="bordered" onPress={handleYoutubeCancel}>
                                    取消
                                </Button>
                                <Button size="sm" color="primary" onPress={applyYoutubeUrl}>
                                    应用
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <button
                    type="button"
                    onClick={onAddProduct}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="添加产品"
                >
                    <Tag size={16} />
                </button>
                <button
                    type="button"
                    onClick={handleMetadataButtonClick}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="插入产品元数据"
                >
                    <Database size={16} />
                </button>
            </div>

            {/* 新增：快捷键说明按钮 */}
            <div className="flex items-center ml-4">
                <button
                    type="button"
                    onClick={toggleShortcutModal}
                    className="p-1.5 rounded hover:bg-gray-100"
                    title="查看键盘快捷键"
                >
                    <Keyboard size={16} />
                </button>
            </div>

            {/* Typography Explanation Modal */}
            <Modal isOpen={isTypographyModalOpen} onOpenChange={setIsTypographyModalOpen}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">智能排版规则</ModalHeader>
                            <ModalBody>
                                <p>输入以下字符时，它们会自动转换为更符合排版规范的符号：</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                    <li><code className="bg-gray-100 px-1 rounded">--</code> → — (破折号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">...</code> → … (省略号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">&lt;-</code> → ← (左箭头)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">-&gt;</code> → → (右箭头)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">(c)</code> → © (版权)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">(r)</code> → ® (注册商标)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">(tm)</code> → ™ (商标)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">1/2</code> → ½ (二分之一)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">1/4</code> → ¼ (四分之一)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">3/4</code> → ¾ (四分之三)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">+/-</code> → ± (正负号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">!=</code> → ≠ (不等号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">&lt;&lt;</code> → « (左书名号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">&gt;&gt;</code> → » (右书名号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">2*3</code> 或 <code className="bg-gray-100 px-1 rounded">2x3</code> → 2×3 (乘号)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">^2</code> → ² (上标2)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">^3</code> → ³ (上标3)</li>
                                    <li>智能引号 (‘’, “”)</li>
                                </ul>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    关闭
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 新增：快捷键说明模态框 */}
            <Modal isOpen={isShortcutModalOpen} onOpenChange={setIsShortcutModalOpen} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <Keyboard size={18} /> 键盘快捷键
                            </ModalHeader>
                            <ModalBody className="max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    {shortcuts.map((group) => (
                                        <div key={group.category}>
                                            <h4 className="text-sm font-semibold mb-2 text-gray-600">{group.category}</h4>
                                            <table className="w-full text-sm border-collapse">
                                                <tbody>
                                                    {group.items.map((item) => (
                                                        <tr key={item.action} className="border-b border-gray-100">
                                                            <td className="py-2 pr-4 text-gray-700">{item.action}</td>
                                                            <td className="py-2 pl-4 text-right">
                                                                <div className="flex justify-end items-center gap-1">
                                                                    {(isMac ? item.mac : item.win).split(' 或 ').map((combo, idx, arr) => (
                                                                        <span key={combo} className="flex items-center gap-1">
                                                                            {combo.split(' + ').map(key => <ShortcutKey key={key}>{key}</ShortcutKey>)}
                                                                            {idx < arr.length - 1 && <span className="text-gray-400 mx-1">或</span>}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    关闭
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 产品选择器 (用于选择产品后插入元数据) */}
            <ProductSelector
                isOpen={isProductSelectorOpen}
                onClose={() => setIsProductSelectorOpen(false)}
                onSelect={handleProductSelect}
            />

            {/* 在组件末尾添加 */}
            {selectedProduct && (
                <ProductMetadataSelector
                    isOpen={isMetadataSelectorOpen}
                    onClose={() => {
                        setIsMetadataSelectorOpen(false);
                        setSelectedProduct(null);
                    }}
                    product={selectedProduct}
                    onSelect={handleMetadataSelect}
                />
            )}
        </div>
    );
}