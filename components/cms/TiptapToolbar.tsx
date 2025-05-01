import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Popover, PopoverTrigger, PopoverContent, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Switch, Radio, RadioGroup } from '@heroui/react';
import type { Editor } from '@tiptap/core';
import type { RawCommands } from '@tiptap/react'; // Import RawCommands
import {
    Bold, Italic, Underline, Strikethrough, List, ListOrdered, Undo, Redo,
    Link as LinkIcon, Image as ImageIcon, Tag, Heading,
    AlignLeft, AlignCenter, AlignRight, Code, Quote,
    Trash2, Highlighter, Type, Palette,
    CornerDownLeft,
    Video as YoutubeIcon, // 使用 Video 图标替代已弃用的 Youtube 图标
    Keyboard,
    Database,
    Upload,
    Mail,
    ArrowRight
} from 'lucide-react';
import { useState, useCallback, type MouseEvent } from 'react';

import type { ComponentProduct } from '@/types';

import { ColorPickerPopover } from './ColorPickerPopover';
import { ImageUploader } from './ImageUploader';
import type { ProductAttributes } from './ProductBlot'; // Import ProductAttributes
import type { ProductMetadataAttributes } from './ProductMetadataBlot';
import { ProductMetadataSelector } from './ProductMetadataSelector';
import ProductPickerModal from './ProductPickerModal';
import { type EmailFormAttributes } from './Template/email/EmailCollectionFormBlot';

// 定义用于类型断言的接口
interface ProductMetadataCommands {
    insertProductMetadata: (attributes: ProductMetadataAttributes) => boolean;
}

// 新增：为产品卡片添加命令接口
interface ProductCardCommands {
    insertProduct: (attributes: ProductAttributes) => boolean;
}

// 新增：为邮件收集表单添加命令接口
interface EmailFormCommands {
    insertEmailCollectionForm: (attributes: Partial<EmailFormAttributes>) => boolean;
}

interface TiptapToolbarProps {
    editor: Editor | null;
    onAddProduct: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// 辅助函数，用于生成 Kbd 标签
const ShortcutKey = ({ children }: { children: React.ReactNode }) => (
    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
        {children}
    </kbd>
);

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
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
    const [_selectedProduct, _setSelectedProduct] = useState<ComponentProduct | null>(null);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [showMetadataSelector, setShowMetadataSelector] = useState(false);
    const [pickerMode, setPickerMode] = useState<string | null>(null);
    const [productForMetadata, setProductForMetadata] = useState<ComponentProduct | null>(null);
    const [showImageUploader, setShowImageUploader] = useState(false);
    // Add: Email subscription form modal state
    const [isEmailFormModalOpen, setIsEmailFormModalOpen] = useState(false);
    const [emailFormTitle, setEmailFormTitle] = useState('Subscribe to Get Latest Updates');
    const [emailFormDescription, setEmailFormDescription] = useState('Enter your email address to get the latest product information and discount offers.');
    const [emailInputPlaceholder, setEmailInputPlaceholder] = useState('your.email@example.com');
    const [emailSubmitButtonText, setEmailSubmitButtonText] = useState('Subscribe');
    const [emailSourceType, setEmailSourceType] = useState<'general' | 'blog'>('general');
    const [emailFormStyle, setEmailFormStyle] = useState<'default' | 'compact' | 'blog' | 'deals'>('default');

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

    // 处理本地图片上传
    const handleLocalImageUpload = useCallback((url: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: url }).run();
    }, [editor]);

    // 新增：处理从 ProductPickerModal 返回的产品选择
    const handleProductPicked = useCallback((product: ComponentProduct) => {
        if (!editor) return;

        if (pickerMode === 'product') {
            // 插入产品卡片
            const attributes: ProductAttributes = {
                id: product.id || product.asin || '',
                title: product.title || 'Unnamed Product',
                price: product.price || 0,
                image: product.image || '/placeholder-product.jpg',
                asin: product.asin || '',
                style: 'card', // 默认样式，或从其他地方获取
                alignment: 'left', // 默认对齐
                url: product.url || '',
                cj_url: product.cj_url || '',
                brand: product.brand ?? null,
                originalPrice: product.originalPrice ?? null,
                discount: product.discount ?? null,
                couponType: product.couponType as ProductAttributes['couponType'] ?? null,
                couponValue: product.couponValue ?? null,
                couponExpirationDate: product.couponExpirationDate ?? null,
                isPrime: product.isPrime ?? null,
                isFreeShipping: product.isFreeShipping ?? null,
                category: product.category || ''
            };

            try {
                // 确保 editor.commands.insertProduct 存在
                // 断言编辑器命令类型
                const commands = editor.commands as unknown as Partial<RawCommands & ProductCardCommands>;

                if (commands.insertProduct) {
                    commands.insertProduct(attributes);
                } else {
                    alert('插入产品卡片时出错：命令未找到。');
                }
            } catch {
                alert('插入产品卡片时出错。');
            }
        } else if (pickerMode === 'metadata') {
            // 准备插入元数据
            setProductForMetadata(product);
            setShowMetadataSelector(true);
        }

        // 重置模式并关闭选择器
        setPickerMode(null);
        setShowProductPicker(false);
    }, [editor, pickerMode]);

    // 处理元数据选择 - 同样重写
    const handleMetadataSelect = useCallback((fieldId: string) => {
        // 使用 productForMetadata
        if (!editor || !productForMetadata) return;

        try {
            const attributes: ProductMetadataAttributes = {
                productId: productForMetadata.id || productForMetadata.asin || '',
                fieldId,
                // value 字段由 ProductMetadataBlot/View 内部获取，这里不需要传递
            };
            // 在实际编辑器中尝试直接调用命令
            // 断言以访问自定义命令
            const commands = editor.commands as unknown as Partial<RawCommands & ProductMetadataCommands>;

            if (commands.insertProductMetadata) {
                // 当插件正确注册时使用直接方法
                commands.insertProductMetadata(attributes);
            } else {
                // 回退到链式调用（如果命令没有正确扩展）
                editor.chain().focus().insertContent({
                    type: 'productMetadata',
                    attrs: attributes
                }).run();
            }

        } catch {
            alert('插入元数据时出错，请稍后再试');
        } finally {
            // 不论成功失败，都关闭选择器并重置状态
            setShowMetadataSelector(false);
            setProductForMetadata(null); // 重置关联的产品
        }
    }, [editor, productForMetadata]); // 依赖 productForMetadata

    // 处理添加产品点击
    const handleAddProductClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setPickerMode('product');
        setShowProductPicker(true);
    }, []);

    // 处理添加元数据点击
    const handleAddMetadataClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setPickerMode('metadata');
        setShowProductPicker(true);
    }, []);

    // 处理产品样式变更
    const _handleProductStyleChange = useCallback((style: string) => {
        if (editor && editor.isActive('product')) {
            editor.chain().focus().updateAttributes('product', { style }).run();
        }
    }, [editor]);

    // 新增：打开邮件表单模态框
    const handleEmailFormClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // 重置表单字段为默认值
        setEmailFormTitle('Subscribe to Get Latest Updates');
        setEmailFormDescription('Enter your email address to get the latest product information and discount offers.');
        setEmailInputPlaceholder('your.email@example.com');
        setEmailSubmitButtonText('Subscribe');
        setEmailSourceType('general');
        setEmailFormStyle('default');
        // 打开模态框
        setIsEmailFormModalOpen(true);
    }, []);

    // 新增：插入邮件收集表单
    const insertEmailForm = useCallback(() => {
        if (!editor) return;

        try {
            // 构建表单属性
            const attributes: Partial<EmailFormAttributes> = {
                formTitle: emailFormTitle,
                formDescription: emailFormDescription,
                inputPlaceholder: emailInputPlaceholder,
                submitButtonText: emailSubmitButtonText,
                sourceType: emailSourceType,
                formId: `form-${Date.now()}`, // 生成唯一ID
                style: emailFormStyle
            };

            // 尝试使用插件命令
            const commands = editor.commands as unknown as Partial<RawCommands & EmailFormCommands>;

            if (commands.insertEmailCollectionForm) {
                commands.insertEmailCollectionForm(attributes);
            } else {
                // 回退到通用插入内容方法
                editor.chain().focus().insertContent({
                    type: 'emailCollectionForm',
                    attrs: attributes
                }).run();
            }

            // 关闭模态框
            setIsEmailFormModalOpen(false);
        } catch {
            alert('Error inserting email collection form, please try again later');
        }
    }, [editor, emailFormTitle, emailFormDescription, emailInputPlaceholder, emailSubmitButtonText, emailSourceType, emailFormStyle]);

    if (!editor) {
        return null;
    }

    // 快捷键数据（根据启用的扩展和 Tiptap 文档整理）
    // 注意：Mod = Cmd (macOS) / Ctrl (Windows/Linux)
    const shortcuts = [
        {
            category: 'Basic Operations', items: [
                { action: 'Undo', win: 'Ctrl + Z', mac: 'Cmd + Z' },
                { action: 'Redo', win: 'Ctrl + Shift + Z', mac: 'Cmd + Shift + Z' },
                { action: 'Hard Break', win: 'Shift + Enter or Ctrl + Enter', mac: 'Shift + Enter or Cmd + Enter' },
                { action: 'Copy', win: 'Ctrl + C', mac: 'Cmd + C' },
                { action: 'Cut', win: 'Ctrl + X', mac: 'Cmd + X' },
                { action: 'Paste', win: 'Ctrl + V', mac: 'Cmd + V' },
                { action: 'Paste Without Formatting', win: 'Ctrl + Shift + V', mac: 'Cmd + Shift + V' },
            ]
        },
        {
            category: 'Text Formatting', items: [
                { action: 'Bold', win: 'Ctrl + B', mac: 'Cmd + B' },
                { action: 'Italic', win: 'Ctrl + I', mac: 'Cmd + I' },
                { action: 'Underline', win: 'Ctrl + U', mac: 'Cmd + U' },
                { action: 'Strikethrough', win: 'Ctrl + Shift + S', mac: 'Cmd + Shift + S' },
                { action: 'Code', win: 'Ctrl + E', mac: 'Cmd + E' },
                { action: 'Highlight', win: 'Ctrl + Shift + H', mac: 'Cmd + Shift + H' },
            ]
        },
        {
            category: 'Paragraph Formatting', items: [
                { action: 'Normal Text', win: 'Ctrl + Alt + 0', mac: 'Cmd + Alt + 0' },
                { action: 'Heading 1', win: 'Ctrl + Alt + 1', mac: 'Cmd + Alt + 1' },
                { action: 'Heading 2', win: 'Ctrl + Alt + 2', mac: 'Cmd + Alt + 2' },
                { action: 'Heading 3', win: 'Ctrl + Alt + 3', mac: 'Cmd + Alt + 3' },
                { action: 'Bullet List', win: 'Ctrl + Shift + 8', mac: 'Cmd + Shift + 8' },
                { action: 'Ordered List', win: 'Ctrl + Shift + 7', mac: 'Cmd + Shift + 7' },
                { action: 'Quote', win: 'Ctrl + Shift + B', mac: 'Cmd + Shift + B' },
                { action: 'Code Block', win: 'Ctrl + Alt + C', mac: 'Cmd + Alt + C' },
                { action: 'Align Left', win: 'Ctrl + Shift + L', mac: 'Cmd + Shift + L' },
                { action: 'Center', win: 'Ctrl + Shift + E', mac: 'Cmd + Shift + E' },
                { action: 'Align Right', win: 'Ctrl + Shift + R', mac: 'Cmd + Shift + R' },
            ]
        },
    ];

    // 检测操作系统 (简易方式，可能不完全准确)
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return (
        <div className="p-2 border-b border-gray-300 flex items-center flex-wrap gap-1 bg-white sticky top-0 z-10 w-full">
            {/* 撤销/重做 */}
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                disabled={!editor.can().undo()}
            >
                <Undo size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
                disabled={!editor.can().redo()}
            >
                <Redo size={16} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* 分隔符 */}

            {/* 文本格式化 */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                title="Bold (Ctrl+B)"
            >
                <Bold size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                title="Italic (Ctrl+I)"
            >
                <Italic size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
                title="Underline (Ctrl+U)"
            >
                <Underline size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
                title="Strikethrough (Ctrl+Shift+S)"
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
                        title="Highlight (Ctrl+Shift+H)"
                    >
                        <Highlighter size={16} />
                    </button>
                }
            />

            {/* 文本颜色选择器 Popover */}
            <ColorPickerPopover
                editor={editor}
                mode="textColor"
                trigger={
                    <button
                        type="button"
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('textStyle') ? 'bg-blue-100 text-blue-600' : ''}`}
                        title="Text Color"
                    >
                        <Palette size={16} />
                    </button>
                }
            />

            <button
                type="button"
                onClick={clearFormatting}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Clear Formatting"
            >
                <Trash2 size={16} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* 分隔符 */}

            {/* 标题 - 改为下拉菜单 */}
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        variant="light" // 或其他你喜欢的样式
                        className="p-1.5 rounded hover:bg-gray-100 data-[hover=true]:bg-gray-100 min-w-0 h-auto" // 调整样式以适应按钮
                        title="Heading Level"
                    >
                        {/* 可以根据当前级别显示不同内容，或保持通用图标 */}
                        <Heading size={16} />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    aria-label="Heading Levels"
                    onAction={(key) => {
                        const level = Number(String(key).split('-')[1]);

                        if (level === 0) {
                            editor.chain().focus().setParagraph().run();
                        } else if (level >= 1 && level <= 3) {
                            editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                        }
                    }}
                    selectedKeys={editor.isActive('heading', { level: 1 }) ? ['h-1'] : editor.isActive('heading', { level: 2 }) ? ['h-2'] : editor.isActive('heading', { level: 3 }) ? ['h-3'] : ['h-0']} // 高亮当前级别
                    selectionMode="single"
                >
                    <DropdownItem key="h-0">Normal Text</DropdownItem>
                    <DropdownItem key="h-1">Heading 1</DropdownItem>
                    <DropdownItem key="h-2">Heading 2</DropdownItem>
                    <DropdownItem key="h-3">Heading 3</DropdownItem>
                </DropdownMenu>
            </Dropdown>

            <button
                type="button"
                onClick={applyTypography}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Smart Typography (auto-converts special symbols)"
            >
                <Type size={16} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* 分隔符 */}

            {/* 对齐方式 */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                title="Align Left (Ctrl+Shift+L)"
            >
                <AlignLeft size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                title="Center (Ctrl+Shift+E)"
            >
                <AlignCenter size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                title="Align Right (Ctrl+Shift+R)"
            >
                <AlignRight size={16} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* 分隔符 */}

            {/* 列表 */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                title="Bullet List (Ctrl+Shift+8)"
            >
                <List size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                title="Ordered List (Ctrl+Shift+7)"
            >
                <ListOrdered size={16} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* 分隔符 */}

            {/* 引用和代码块 */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                title="Quote (Ctrl+Shift+B)"
            >
                <Quote size={16} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                title="Code Block (Ctrl+Alt+C)"
            >
                <Code size={16} />
            </button>
            <button
                type="button"
                onClick={toggleHardBreak}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Hard Break (Shift+Enter)"
            >
                <CornerDownLeft size={16} />
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" /> {/* 分隔符 */}

            {/* 链接、图片、产品、YouTube */}
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
                        title="Add/Edit Link"
                    >
                        <LinkIcon size={16} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-72">
                    <div className="space-y-3">
                        <label htmlFor="toolbar-link-url-input" className="block text-sm font-medium text-gray-700 mb-1">
                            Link URL
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
                                Open in new tab
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
                                Remove
                            </Button>
                            <Button size="sm" color="primary" onPress={applyLinkUrl}>
                                Apply
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
                        title="Insert Image"
                    >
                        <ImageIcon size={16} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-72">
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setIsImagePopoverOpen(false);
                                setShowImageUploader(true);
                            }}
                            className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                            type="button"
                        >
                            <Upload size={16} className="mr-2" /> Upload Local Image
                        </button>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-gray-300" />
                            <span className="mx-2 text-xs text-gray-500">Or add through URL</span>
                            <div className="flex-grow border-t border-gray-300" />
                        </div>

                        <div>
                            <label htmlFor="image-url-input" className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL
                            </label>
                            <Input
                                id="image-url-input"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                type="url"
                                size="sm"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button size="sm" variant="bordered" onPress={handleImageCancel}>
                                Cancel
                            </Button>
                            <Button size="sm" color="primary" onPress={applyImageUrl}>
                                Apply
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
                        title="Insert YouTube Video"
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
                                <label htmlFor="youtube-width-input" className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
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
                                <label htmlFor="youtube-height-input" className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
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
                                Cancel
                            </Button>
                            <Button size="sm" color="primary" onPress={applyYoutubeUrl}>
                                Apply
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <button
                type="button"
                onClick={handleAddProductClick}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Add Product"
            >
                <Tag size={16} />
            </button>
            <button
                type="button"
                onClick={handleAddMetadataClick}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Insert Product Metadata"
            >
                <Database size={16} />
            </button>

            {/* 新增：邮件收集表单按钮 */}
            <button
                type="button"
                onClick={handleEmailFormClick}
                className="p-1.5 rounded hover:bg-gray-100"
                title="Insert Email Subscription Form"
            >
                <Mail size={16} />
            </button>

            {/* 新增：快捷键说明按钮 */}
            <button
                type="button"
                onClick={toggleShortcutModal}
                className="p-1.5 rounded hover:bg-gray-100 ml-auto" /* 使用 ml-auto 推到右边 */
                title="View Keyboard Shortcuts"
            >
                <Keyboard size={16} />
            </button>

            {/* Typography Explanation Modal */}
            <Modal isOpen={isTypographyModalOpen} onOpenChange={setIsTypographyModalOpen}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Smart Typography Rules</ModalHeader>
                            <ModalBody>
                                <p>When typing the following characters, they are automatically converted to typographically correct symbols:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                    <li><code className="bg-gray-100 px-1 rounded">--</code> → — (em dash)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">...</code> → … (ellipsis)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">&lt;-</code> → ← (left arrow)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">-&gt;</code> → → (right arrow)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">(c)</code> → © (copyright)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">(r)</code> → ® (registered trademark)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">(tm)</code> → ™ (trademark)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">1/2</code> → ½ (one half)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">1/4</code> → ¼ (one quarter)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">3/4</code> → ¾ (three quarters)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">+/-</code> → ± (plus-minus)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">!=</code> → ≠ (not equal)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">&lt;&lt;</code> → « (left quotation)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">&gt;&gt;</code> → » (right quotation)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">2*3</code> or <code className="bg-gray-100 px-1 rounded">2x3</code> → 2×3 (multiplication)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">^2</code> → ² (superscript 2)</li>
                                    <li><code className="bg-gray-100 px-1 rounded">^3</code> → ³ (superscript 3)</li>
                                    <li>Smart quotes (&apos;, &quot;)</li>
                                </ul>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    Close
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
                                <Keyboard size={18} /> Keyboard Shortcuts
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
                                                                    {(isMac ? item.mac : item.win).split(' or ').map((combo, idx, arr) => (
                                                                        <span key={combo} className="flex items-center gap-1">
                                                                            {combo.split(' + ').map(key => <ShortcutKey key={key}>{key}</ShortcutKey>)}
                                                                            {idx < arr.length - 1 && <span className="text-gray-400 mx-1">or</span>}
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
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 产品选择器 */}
            <ProductPickerModal
                isOpen={showProductPicker}
                onClose={() => setShowProductPicker(false)}
                onProductSelect={handleProductPicked}
            />

            {/* 元数据选择器 - 逻辑改进 */}
            <ProductMetadataSelector
                isOpen={showMetadataSelector}
                onClose={() => {
                    setShowMetadataSelector(false);
                    // 关闭时不重置 productForMetadata，handleMetadataSelect 会处理
                }}
                product={productForMetadata}
                onSelect={handleMetadataSelect}
            />

            {/* 添加图片上传模态框 */}
            <ImageUploader
                isOpen={showImageUploader}
                onClose={() => setShowImageUploader(false)}
                onImageUpload={handleLocalImageUpload}
            />

            {/* 新增：邮件收集表单模态框 */}
            <Modal isOpen={isEmailFormModalOpen} onOpenChange={setIsEmailFormModalOpen}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Mail size={18} />
                                    Insert Email Subscription Form
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email-form-title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Form Title
                                        </label>
                                        <Input
                                            id="email-form-title"
                                            value={emailFormTitle}
                                            onChange={(e) => setEmailFormTitle(e.target.value)}
                                            placeholder="Subscription Newsletter"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email-form-description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Form Description
                                        </label>
                                        <Input
                                            id="email-form-description"
                                            value={emailFormDescription}
                                            onChange={(e) => setEmailFormDescription(e.target.value)}
                                            placeholder="Enter your email to get the latest news"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="email-input-placeholder" className="block text-sm font-medium text-gray-700 mb-1">
                                                Input Placeholder
                                            </label>
                                            <Input
                                                id="email-input-placeholder"
                                                value={emailInputPlaceholder}
                                                onChange={(e) => setEmailInputPlaceholder(e.target.value)}
                                                placeholder="your.email@example.com"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label htmlFor="email-submit-button" className="block text-sm font-medium text-gray-700 mb-1">
                                                Submit Button Text
                                            </label>
                                            <Input
                                                id="email-submit-button"
                                                value={emailSubmitButtonText}
                                                onChange={(e) => setEmailSubmitButtonText(e.target.value)}
                                                placeholder="Subscribe"
                                            />
                                        </div>
                                    </div>

                                    {/* 高级设置 - 隐藏在折叠面板中 */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <details className="text-sm">
                                            <summary className="cursor-pointer text-gray-700 font-medium">Advanced Settings</summary>
                                            <div className="mt-3 pl-4 border-l-2 border-gray-200">
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Form Style
                                                    </label>
                                                    <RadioGroup
                                                        value={emailFormStyle}
                                                        onValueChange={(value) => setEmailFormStyle(value as 'default' | 'compact' | 'blog' | 'deals')}
                                                        orientation="horizontal"
                                                    >
                                                        <Radio value="default">
                                                            <div className="ml-2">Default (Blue gradient)</div>
                                                        </Radio>
                                                        <Radio value="compact">
                                                            <div className="ml-2">Compact (White)</div>
                                                        </Radio>
                                                        <Radio value="blog">
                                                            <div className="ml-2">Blog Style (Blue)</div>
                                                        </Radio>
                                                        <Radio value="deals">
                                                            <div className="ml-2">Deals Newsletter</div>
                                                        </Radio>
                                                    </RadioGroup>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Form Source Type (Only for backend identification)
                                                    </label>
                                                    <RadioGroup
                                                        value={emailSourceType}
                                                        onValueChange={(value) => setEmailSourceType(value as 'general' | 'blog')}
                                                        orientation="horizontal"
                                                    >
                                                        <Radio value="general">
                                                            <div className="ml-2">General Product Email</div>
                                                        </Radio>
                                                        <Radio value="blog">
                                                            <div className="ml-2">Blog Content Email</div>
                                                        </Radio>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </details>
                                    </div>

                                    {/* 表单预览 */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Form Preview:</p>
                                        <div className={`border border-gray-200 rounded-md p-4 ${emailFormStyle === 'default' ? 'bg-gradient-to-br from-[#1A5276] to-[#154360] text-white' :
                                            emailFormStyle === 'compact' ? 'bg-white text-gray-800' :
                                                emailFormStyle === 'blog' ? 'bg-gradient-to-r from-[#3282B7] to-[#1C567B] text-white' :
                                                    'bg-[#2E71A6] text-white'
                                            }`}>
                                            <div className="text-center mb-2">
                                                {emailFormStyle === 'default' && (
                                                    <div className="inline-flex items-center justify-center mb-1">
                                                        <Mail className="w-5 h-5 text-[#FFC107] mr-1.5" strokeWidth={1.5} />
                                                        <h3 className="text-lg font-semibold text-[#FFFFFF]">{emailFormTitle || 'Subscription Newsletter'}</h3>
                                                    </div>
                                                )}
                                                {emailFormStyle === 'compact' && (
                                                    <h3 className="text-lg font-medium">{emailFormTitle || 'Subscription Newsletter'}</h3>
                                                )}
                                                {emailFormStyle === 'blog' && (
                                                    <div className="inline-flex items-center justify-center mb-1">
                                                        <Mail className="w-5 h-5 text-[#FFC107] mr-1.5" strokeWidth={1.5} />
                                                        <h3 className="text-lg font-semibold text-[#FFFFFF]">{emailFormTitle || 'Subscription Newsletter'}</h3>
                                                    </div>
                                                )}
                                                {emailFormStyle === 'deals' && (
                                                    <h3 className="text-lg font-bold text-[#FFFFFF]">{emailFormTitle || 'Subscribe to Our Deals Newsletter'}</h3>
                                                )}
                                                <p className={`${emailFormStyle === 'default' ? 'text-white/90' :
                                                    emailFormStyle === 'compact' ? 'text-gray-600' :
                                                        'text-white/90'
                                                    } text-sm`}>
                                                    {emailFormStyle === 'deals' ?
                                                        (emailFormDescription || "Get the latest deals first-hand, don't miss any money-saving opportunity") :
                                                        (emailFormDescription || 'Enter your email address to get the latest product information and discount offers.')
                                                    }
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className={`flex-grow ${emailFormStyle === 'default' ? 'bg-white' :
                                                    emailFormStyle === 'compact' ? 'bg-gray-50' :
                                                        'bg-white'
                                                    } border ${emailFormStyle === 'default' ? 'border-transparent' :
                                                        emailFormStyle === 'compact' ? 'border-gray-300' :
                                                            'border-transparent'
                                                    } rounded-md px-3 py-2 text-sm text-gray-400`}>
                                                    <span className="flex items-center gap-2">
                                                        {(emailFormStyle !== 'deals') && <Mail size={14} />}
                                                        {emailInputPlaceholder || 'your.email@example.com'}
                                                    </span>
                                                </div>
                                                <div className={`px-3 py-2 ${emailFormStyle === 'default' ? 'bg-[#16A085]' :
                                                    emailFormStyle === 'compact' ? 'bg-blue-600' :
                                                        emailFormStyle === 'blog' ? 'bg-[#16A085]' :
                                                            'bg-[#4DB6AC]'
                                                    } text-white text-sm font-medium rounded-md flex items-center justify-center`}>
                                                    <span>{emailSubmitButtonText || 'Subscribe'}</span>
                                                    {(emailFormStyle === 'default' || emailFormStyle === 'blog') &&
                                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                                    }
                                                </div>
                                            </div>
                                            {emailFormStyle === 'deals' && (
                                                <div className="mt-2 flex items-start gap-2 text-xs text-white/90">
                                                    <input type="checkbox" className="mt-0.5 h-3 w-3" checked readOnly />
                                                    <span>I agree to receive email communications from Oohunt as described in the
                                                        <a href="#" className="text-[#4DB6AC] hover:underline ml-1">Terms</a> &
                                                        <a href="#" className="text-[#4DB6AC] hover:underline ml-1">Privacy Policy</a></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={insertEmailForm}>
                                    Insert Form
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}