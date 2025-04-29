'use client';

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Input,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from '@heroui/react';
import { type Editor as EditorType } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import Dropcursor from '@tiptap/extension-dropcursor';
import Focus from '@tiptap/extension-focus';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import ListKeymap from '@tiptap/extension-list-keymap';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu, isNodeSelection } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, List, ListOrdered,
    Link as LinkIcon, Image as ImageIcon, Heading1, Heading2,
    Strikethrough, Code, Quote, Highlighter, Palette, Minus
} from 'lucide-react';
import { useState, useEffect, useCallback, type MouseEvent } from 'react';

import { ColorPickerPopover } from './ColorPickerPopover';
import { EmailCollectionFormBlot } from './EmailCollectionFormBlot';
import { ProductBlot, type ProductAttributes, PRODUCT_STYLES } from './ProductBlot';
import { ProductMetadataBlot } from './ProductMetadataBlot';
import { ProductSelector, type Product } from './ProductSelector';
import { TiptapToolbar } from './TiptapToolbar';

// 产品命令类型定义
interface ProductCommands {
    insertProduct: (attributes: ProductAttributes) => boolean;
}

// 默认字符限制
const DEFAULT_CHAR_LIMIT = 10000;

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    editorClass?: string;
    onEditorReady?: (editor: EditorType) => void;
    charLimit?: number; // 添加字符限制属性
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Enter content here...',
    className = '',
    editorClass = '',
    onEditorReady,
    charLimit = DEFAULT_CHAR_LIMIT // 默认10000
}: RichTextEditorProps) {
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [charactersCount, setCharactersCount] = useState(0);
    const [wordsCount, setWordsCount] = useState(0);
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showProductPicker] = useState(false);
    const [showMetadataSelector] = useState(false);
    const [showFloatingImageInput, setShowFloatingImageInput] = useState(false);

    // 客户端渲染检测
    useEffect(() => {
        setIsClient(true);

        // 添加全局样式以修复气泡菜单宽度问题
        const style = document.createElement('style');

        style.innerHTML = `
            .tippy-box {
                width: auto !important;
                max-width: none !important;
            }
            .tippy-content {
                width: auto !important;
                max-width: none !important;
                white-space: nowrap !important;
            }
            
            /* 确保模态框在编辑器浮动菜单之上 */
            .modal-backdrop, .modal-content {
                z-index: 9999 !important; /* 使用更高的z-index值 */
            }
            
            /* 针对HeroUI Modal组件的CSS选择器 */
            [data-overlay-container] [role="dialog"],
            [aria-labelledby="modal-title"] {
                z-index: 9999 !important;
            }
            [data-overlay-container] [data-backdrop],
            [data-backdrop] {
                z-index: 9998 !important;
            }
            div[role="presentation"][data-overlay] {
                z-index: 9999 !important;
            }
            /* 修复模态框叠加问题 */
            div[data-overlay-container="true"] {
                isolation: isolate;
            }
            
            /* 新增：隐藏 FloatingMenu 的 CSS 类 */
            .floating-menu-hidden {
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
                transition: none !important; /* 确保立即隐藏 */
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // 初始化编辑器
    const editor = useEditor({
        extensions: [
            // 首先加载TextStyle和Color扩展，确保它们在其他扩展之前初始化
            // 文本样式扩展 - 用于颜色等
            TextStyle,
            // 颜色扩展
            Color.configure({
                types: ['textStyle'],
            }),
            // 然后加载其他扩展
            StarterKit.configure({
                // 配置 StarterKit 选项
                heading: false, // 禁用StarterKit自带的heading扩展
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-gray-100 rounded p-2 font-mono text-sm',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-gray-300 pl-4 italic',
                    },
                },
                dropcursor: false
            }),
            // 单独配置Heading扩展支持六级标题
            Heading.configure({
                levels: [1, 2, 3, 4, 5, 6],
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Image.configure({
                inline: true,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'mx-auto rounded max-w-full',
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                validate: href => /^https?:\/\//i.test(href),
                HTMLAttributes: {
                    class: 'text-blue-500 underline',
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right'],
                defaultAlignment: 'left',
            }),
            // 高亮插件
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'bg-yellow-200 px-1 rounded',
                },
            }),
            // 排版插件
            Typography,
            Underline,
            ProductBlot,
            ProductMetadataBlot,
            EmailCollectionFormBlot,
            // 字符计数扩展
            CharacterCount.configure({
                limit: charLimit, // 设置字符限制
                // 使用更准确的分词方法计算中文单词数
                wordCounter: (text) => {
                    // 移除空白字符后按照中英文分词规则计算
                    const trimmedText = text.trim();

                    if (!trimmedText) return 0;

                    // 对中英文进行简单分词，处理中英文混合情况
                    // 1. 英文以空格分隔
                    // 2. 中文每个字符视为一个词的一部分
                    // 3. 中英文交界处分词

                    // 将文本按空格分隔，然后处理每个部分
                    const parts = trimmedText.split(/\s+/);
                    let wordCount = 0;

                    for (const part of parts) {
                        if (!part) continue;

                        // 判断是否包含中文字符
                        const hasChinese = /[\u4e00-\u9fff]/.test(part);

                        if (hasChinese) {
                            // 中文分词：连续的中文字符视为一个词
                            // 简单方法：将中英文交界处分词
                            const segments = part.split(/(?:(?<=[\u4e00-\u9fff])(?=[^\u4e00-\u9fff])|(?<=[^\u4e00-\u9fff])(?=[\u4e00-\u9fff]))/);

                            wordCount += segments.filter(segment => segment.length > 0).length;
                        } else {
                            // 非中文（英文、数字等）
                            wordCount += 1;
                        }
                    }

                    return wordCount;
                }
            }),
            Dropcursor,
            Focus.configure({ className: 'has-focus', mode: 'all' }),
            ListKeymap,
            Youtube.configure({
                // 可以根据需要添加配置，例如：
                // width: 640,
                // height: 480,
                // nocookie: true,
                // controls: false,
                // allowFullscreen: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());

            // 更新字符和单词计数
            if (editor.storage.characterCount) {
                setCharactersCount(editor.storage.characterCount.characters());
                setWordsCount(editor.storage.characterCount.words());
            }
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none prose max-w-none',
            },
            // 阻止编辑器中的键盘事件冒泡到表单
            handleKeyDown: (view, event) => {
                // 阻止Ctrl+S或Cmd+S (保存快捷键)
                if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                    event.preventDefault();

                    return true;
                }

                // 阻止单独的Enter键冒泡到表单（防止表单提交）
                if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
                    // 不阻止编辑器内部的Enter操作，但阻止冒泡
                    event.stopPropagation();

                    return false; // 让Tiptap继续处理Enter键
                }

                return false;
            },
        },
        immediatelyRender: false, // 解决SSR水合问题
    });

    // 当编辑器初始化完成时，调用onEditorReady回调
    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // 计算字符限制进度
    const characterLimitProgress = editor && editor.storage.characterCount
        ? Math.min(100, Math.round((charactersCount / charLimit) * 100))
        : 0;

    // 判断是否接近或超过限制
    const isNearLimit = characterLimitProgress > 80 && characterLimitProgress < 100;
    const isOverLimit = characterLimitProgress >= 100;

    // 计算剩余字符数
    const remainingChars = Math.max(0, charLimit - charactersCount);

    // 当超出字符限制时，通知父组件
    useEffect(() => {
        // 如果编辑器被初始化，并且有onEditorReady回调
        if (editor && onEditorReady) {
            // 将编辑器实例和字符限制状态传递给父组件
            onEditorReady(editor);

            // 可以通过自定义事件或者修改DOM属性来通知表单
            if (editor.options.element) {
                // 在编辑器元素上设置自定义属性，表单可以检查此属性决定是否允许提交
                const editorElement = editor.options.element as HTMLElement;

                editorElement.dataset.isOverLimit = String(isOverLimit);
            }
        }
    }, [editor, onEditorReady, isOverLimit]);

    // 处理选择产品
    const handleProductSelect = (product: Product) => {
        if (!editor) return;

        // 使用类型断言处理插入产品命令
        const commands = editor.commands as unknown as ProductCommands;

        commands.insertProduct({
            id: product.id || product.asin || '',
            title: product.title,
            price: product.price || 0,
            // 图片处理：优先使用 main_image，其次是image
            image: product.main_image || product.image_url || '/placeholder-product.jpg',
            // asin处理：直接使用asin或默认为空字符串
            asin: product.asin || '',
            // 样式处理：使用产品提供的样式或默认为卡片样式
            style: product.style || 'card'
        });

        editor.commands.focus();
        setShowProductSelector(false);
    };

    // 新增：处理链接 Popover 打开/关闭
    const handleLinkOpenChange = useCallback((open: boolean) => {
        if (open && editor) {
            const currentUrl = editor.getAttributes('link').href || '';

            setLinkUrl(currentUrl);
        }
        setIsLinkPopoverOpen(open);
    }, [editor]);

    // 应用链接
    const handleApplyLink = useCallback(() => {
        if (!editor) return;
        const urlToSet = linkUrl.trim();

        // 简单 URL 验证 (或根据需要移除/增强)
        if (!urlToSet || !/^https?:\/\//i.test(urlToSet)) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: urlToSet }).run();
        }
        setIsLinkPopoverOpen(false);
    }, [editor, linkUrl]);

    // 移除链接
    const handleRemoveLink = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setIsLinkPopoverOpen(false);
    }, [editor]);

    // 处理高亮文本
    const handleHighlight = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        // 阻止事件冒泡，防止触发表单提交
        e.preventDefault();
        e.stopPropagation();

        if (!editor) return;
        editor.chain().focus().toggleHighlight().run();
    }, [editor]);

    // 处理 FloatingMenu 中的图片添加
    const handleFloatingImageAdd = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        // 阻止事件冒泡，防止触发表单提交
        e.preventDefault();
        e.stopPropagation();

        if (!editor) return;

        // 立即使编辑器失去焦点，确保菜单消失
        editor.commands.blur();

        // 不再使用原生prompt，改用状态控制的模态框或Popover
        // 恢复直接设置状态
        setShowFloatingImageInput(true);
    }, [editor]);

    // 处理图片URL应用
    const handleApplyImageUrl = useCallback((url: string) => {
        if (!editor || !url) return;

        if (url && url !== 'https://') {
            editor.chain().focus().setImage({ src: url }).run();
        }

        setShowFloatingImageInput(false);
    }, [editor]);

    // 打开产品选择器的回调
    const _handleAddProductClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // 立即使编辑器失去焦点，确保菜单消失
        editor?.commands.blur();

        // 恢复直接设置状态
        setShowProductSelector(true);
    }, [editor]);

    // 或者你可能需要创建一个新的工具栏调用包装器
    const handleAddProductWrapper = () => {
        setShowProductSelector(true);
    };

    // 恢复 handleProductStyleChange，因为样式按钮仍然需要它
    const handleProductStyleChange = useCallback((style: string) => {
        if (editor && editor.isActive('product')) {
            editor.chain().focus().updateAttributes('product', { style }).run();
        }
    }, [editor]);

    // 当任何模态框打开时，确保编辑器失去焦点
    useEffect(() => {
        if (showProductSelector || showProductPicker || showMetadataSelector || showFloatingImageInput) {
            editor?.commands.blur();
        }
    }, [editor, showProductSelector, showProductPicker, showMetadataSelector, showFloatingImageInput]);

    // 如果不在客户端，返回占位符
    if (!isClient) {
        return <div className={className}><div className={editorClass}>Loading editor...</div></div>;
    }

    return (
        <div className={`rich-text-editor ${className} border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-150 ${isOverLimit ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' : ''}`}>
            {/* 编辑器顶部工具栏 */}
            <div className="p-2 border-b border-gray-300 flex flex-wrap items-center gap-1 bg-white sticky top-0 z-10">
                <TiptapToolbar editor={editor} onAddProduct={handleAddProductWrapper} />
            </div>

            {/* 编辑器内容区域 */}
            <div className="relative">
                <EditorContent
                    editor={editor}
                    className={`prose max-w-none p-4 min-h-[300px] overflow-y-auto ${editorClass}`}
                    translate="no"
                />

                {/* 添加自定义样式 */}
                <style jsx global>{`
                    .ProseMirror h1 {
                        font-size: 2rem;
                        font-weight: 700;
                        margin-top: 1rem;
                        margin-bottom: 0.5rem;
                        color: #333;
                    }
                    .ProseMirror h2 {
                        font-size: 1.5rem;
                        font-weight: 600;
                        margin-top: 0.8rem;
                        margin-bottom: 0.4rem;
                        color: #333;
                    }
                    .ProseMirror h3 {
                        font-size: 1.25rem;
                        font-weight: 500;
                        margin-top: 0.6rem;
                        margin-bottom: 0.3rem;
                        color: #333;
                    }
                    .ProseMirror h4 {
                        font-size: 1.15rem;
                        font-weight: 500;
                        margin-top: 0.5rem;
                        margin-bottom: 0.3rem;
                        color: #333;
                    }
                    .ProseMirror h5 {
                        font-size: 1.05rem;
                        font-weight: 500;
                        margin-top: 0.5rem;
                        margin-bottom: 0.2rem;
                        color: #333;
                    }
                    .ProseMirror h6 {
                        font-size: 1rem;
                        font-weight: 500;
                        margin-top: 0.5rem;
                        margin-bottom: 0.2rem;
                        color: #333;
                    }
                    .ProseMirror p {
                        margin-bottom: 0.75rem;
                    }
                    .ProseMirror ul, .ProseMirror ol {
                        padding-left: 1.5rem;
                        margin-bottom: 0.75rem;
                    }
                    
                    /* 禁用翻译功能相关样式 */
                    .ProseMirror {
                        translate: no; /* 现代浏览器禁用翻译 */
                        -webkit-translate: no; /* Safari 特定属性 */
                    }
                    
                    /* 修改选择文本样式 */
                    .ProseMirror ::selection {
                        background-color: rgba(59, 130, 246, 0.3);
                        color: inherit;
                    }

                    /* 修复气泡菜单宽度问题 */
                    .tippy-box {
                        width: auto !important;
                        max-width: none !important;
                        white-space: nowrap !important;
                    }
                    .tippy-content {
                        width: auto !important;
                        max-width: none !important;
                        white-space: nowrap !important;
                    }
                    
                    /* 确保模态框在编辑器浮动菜单之上 */
                    .modal-backdrop, .modal-content {
                        z-index: 9999 !important; /* 使用更高的z-index值 */
                    }
                    
                    /* 新增：隐藏 FloatingMenu 的 CSS 类 */
                    .floating-menu-hidden {
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                        transition: none !important; /* 确保立即隐藏 */
                    }
                `}</style>

                {/* Markdown快捷方式提示 */}
                {!editor?.getText() && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-center pointer-events-none">
                        <p className="mb-2">Markdown shortcuts available</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="text-left"># H1 Title</div>
                            <div className="text-left">## H2 Title</div>
                            <div className="text-left">*italic*</div>
                            <div className="text-left">**bold**</div>
                            <div className="text-left">`code`</div>
                            <div className="text-left">&gt; quote</div>
                            <div className="text-left">- list item</div>
                            <div className="text-left">1. ordered list</div>
                        </div>
                    </div>
                )}
            </div>

            {/* 字符统计和单词统计 */}
            {editor && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                    {/* 字符限制进度条 */}
                    <div className="h-1.5 w-full bg-gray-200 rounded-full mb-2">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                            style={{ width: `${characterLimitProgress}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-4 text-gray-500">
                            <div>
                                Characters: <span className={`font-medium ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : ''}`}>
                                    {charactersCount}
                                </span>
                                {charLimit ? (
                                    <span className="text-gray-400 ml-1">/ {charLimit}</span>
                                ) : null}
                            </div>
                            <div>
                                Words: <span className="font-medium">{wordsCount}</span>
                            </div>
                        </div>

                        {isNearLimit && !isOverLimit && (
                            <div className="text-yellow-600 font-medium">
                                Remaining: {remainingChars} characters
                            </div>
                        )}

                        {isOverLimit && (
                            <div className="text-red-500 font-medium animate-pulse">
                                Exceeded by {Math.abs(remainingChars)} characters
                            </div>
                        )}
                    </div>
                </div>
            )}

            {editor && (
                /* 气泡菜单：添加 whitespace-nowrap 和 min-w-max 类解决菜单宽度不自适应内容的问题 */
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{
                        duration: 100,
                        maxWidth: 'none', // 允许菜单完全扩展到其内容的宽度
                        placement: 'top',
                        offset: [0, 10],
                        zIndex: 50,
                        animation: 'shift-away',
                        interactive: true,
                        appendTo: () => document.body,
                        // 确保菜单不会超出视口
                        popperOptions: {
                            modifiers: [
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        boundary: 'viewport',
                                        padding: 5,
                                    },
                                },
                                {
                                    name: 'flip',
                                    options: {
                                        fallbackPlacements: ['bottom', 'right', 'left'],
                                        padding: 5,
                                    },
                                },
                                {
                                    name: 'sizeByReference', // 添加确保宽度自适应的修饰符
                                    enabled: true,
                                    options: {
                                        width: 'auto',
                                    },
                                },
                            ],
                        },
                        onCreate: ({ popper }) => {
                            // 直接设置popper样式
                            if (popper && popper.firstElementChild) {
                                (popper.firstElementChild as HTMLElement).style.width = 'auto';
                                (popper.firstElementChild as HTMLElement).style.maxWidth = 'none';
                                (popper.firstElementChild as HTMLElement).style.whiteSpace = 'nowrap';
                            }
                        },
                        onShow: (instance) => {
                            // 防止谷歌翻译触发
                            const selection = window.getSelection();

                            if (selection && selection.toString()) {
                                // 延迟执行，让BubbleMenu先显示
                                setTimeout(() => {
                                    // 暂时清除选择然后立即恢复，打断谷歌翻译
                                    if (selection.rangeCount > 0) {
                                        const range = selection.getRangeAt(0);

                                        selection.removeAllRanges();
                                        setTimeout(() => {
                                            selection.addRange(range);
                                        }, 0);
                                    }
                                }, 0);
                            }

                            // 修复宽度问题
                            if (instance.popper && instance.popper.firstElementChild) {
                                (instance.popper.firstElementChild as HTMLElement).style.width = 'auto';
                                (instance.popper.firstElementChild as HTMLElement).style.maxWidth = 'none';
                                (instance.popper.firstElementChild as HTMLElement).style.whiteSpace = 'nowrap';
                            }
                        }
                    }}
                    className="bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 flex items-center gap-1.5 transition-opacity duration-150 whitespace-nowrap w-auto min-w-fit"
                    shouldShow={({ state }) => {
                        const { selection } = state;
                        const { $from, empty } = selection;

                        const isTextSelection = !empty && ($from.parent.type.name === 'paragraph' || $from.parent.type.name === 'heading');
                        const isProductNodeSelected = isNodeSelection(selection) && selection.node?.type.name === 'product';

                        return (isTextSelection || isProductNodeSelected) && !isLinkPopoverOpen;
                    }}
                >
                    {isNodeSelection(editor.state.selection) && editor.isActive('product') ? (
                        // --- 产品节点选中时的菜单 (只有样式按钮) ---
                        (() => {
                            const selection = editor.state.selection;
                            const currentNode = isNodeSelection(selection) ? selection.node : null;
                            const currentStyle = currentNode?.attrs.style;
                            // const currentAlignment = currentNode?.attrs.alignment || 'left'; // Alignment no longer needed here

                            return (
                                <div className="flex items-center gap-1.5 whitespace-nowrap min-w-max overflow-visible flex-shrink-0 flex-nowrap">
                                    {/* 样式按钮 - 使用 nowrap，移除 flex-wrap */}
                                    <span className="text-xs text-gray-500 mr-1 flex-shrink-0">layout:</span>
                                    <div className="flex items-center flex-shrink-0 flex-nowrap">
                                        {PRODUCT_STYLES.map((styleOption) => (
                                            <button
                                                key={styleOption.id}
                                                type="button"
                                                onClick={() => handleProductStyleChange(styleOption.id)}
                                                className={`px-1.5 py-0.5 rounded text-xs hover:bg-gray-100 transition-colors flex-shrink-0 ${currentStyle === styleOption.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700'}`}
                                                title={styleOption.name}
                                            >
                                                {styleOption.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        // --- 文本格式化工具 (保持不变) ---
                        <>
                            <div className="flex items-center whitespace-nowrap min-w-max flex-shrink-0 flex-nowrap">
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 ${editor?.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
                                    title="加粗"
                                >
                                    <Bold size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 ${editor?.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
                                    title="斜体"
                                >
                                    <Italic size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                                    className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 ${editor?.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''}`}
                                    title="删除线"
                                >
                                    <Strikethrough size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleHighlight}
                                    className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 ${editor?.isActive('highlight') ? 'bg-blue-100 text-blue-600' : ''}`}
                                    title="高亮文本"
                                >
                                    <Highlighter size={16} />
                                </button>
                                <Popover placement="bottom" isOpen={isLinkPopoverOpen} onOpenChange={handleLinkOpenChange}>
                                    <PopoverTrigger>
                                        <div>
                                            <button
                                                type="button"
                                                className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('link') ? 'bg-blue-100 text-blue-600' : ''}`}
                                                title="添加/编辑链接"
                                            >
                                                <LinkIcon size={16} />
                                            </button>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-2 w-64">
                                        <div className="space-y-2">
                                            <Input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                className="w-full"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" onClick={handleApplyLink}>应用</Button>
                                                <Button size="sm" onClick={handleRemoveLink}>移除</Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <ColorPickerPopover
                                    editor={editor}
                                    trigger={
                                        <button
                                            type="button"
                                            className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('textStyle') ? 'bg-blue-100 text-blue-600' : ''}`}
                                            title="文本颜色"
                                        >
                                            <Palette size={16} />
                                        </button>
                                    }
                                />
                            </div>
                        </>
                    )}
                </BubbleMenu>
            )}

            {/* 只有在没有任何模态框打开时才显示FloatingMenu */}
            {editor && (
                () => {
                    // 计算模态框是否打开的状态
                    const isModalOpen = showProductSelector || showFloatingImageInput || showMetadataSelector;

                    return (
                        <FloatingMenu
                            editor={editor}
                            tippyOptions={{
                                duration: 100,
                                appendTo: () => document.body, // 附加到 body
                                placement: 'bottom-start',      // 初始位置
                                popperOptions: {
                                    modifiers: [
                                        {
                                            name: 'flip',
                                            options: {
                                                fallbackPlacements: ['top-start', 'right-start', 'left-start'], // 翻转顺序
                                                padding: 5, // 距离视口边缘的内边距
                                            },
                                        },
                                        {
                                            name: 'preventOverflow',
                                            options: {
                                                boundary: 'viewport', // 防止溢出视口
                                                padding: 5, // 距离视口边缘的内边距
                                            },
                                        },
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, 8], // 向下偏移 8px
                                            },
                                        },
                                    ],
                                },
                            }}
                            // 动态添加隐藏类
                            className={`bg-white border border-gray-200 p-1 rounded shadow-lg flex flex-col gap-0.5 z-[50] ${isModalOpen ? 'floating-menu-hidden' : ''}`}
                            shouldShow={({ state }) => {
                                const { $from } = state.selection;
                                const currentLineIsEmpty = $from.parent.content.size === 0;
                                const baseCondition = currentLineIsEmpty && $from.parent.type.name === 'paragraph';

                                // 不再需要在此处检查模态框状态，交给 className 处理
                                // const modalIsOpen = showProductSelector || showFloatingImageInput || showMetadataSelector;
                                // return baseCondition && !modalIsOpen; 
                                return baseCondition;
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Heading1 size={16} /> H1 Title
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Heading2 size={16} /> H2 Title
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Heading2 size={15} /> H3 Title
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Heading2 size={14} /> H4 Title
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Heading2 size={13} /> H5 Title
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Heading2 size={12} /> H6 Title
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <List size={16} /> Unordered List
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <ListOrdered size={16} /> Ordered List
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Quote size={16} /> Quote
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Code size={16} /> Code Block
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <Minus size={16} /> Horizontal Rule
                            </button>
                            <button
                                type="button"
                                onClick={handleFloatingImageAdd}
                                className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                            >
                                <ImageIcon size={16} /> Insert Image (URL)
                            </button>
                        </FloatingMenu>
                    );
                }
            )()}

            {showProductSelector && (
                <ProductSelector
                    isOpen={showProductSelector}
                    onClose={() => setShowProductSelector(false)}
                    onSelect={handleProductSelect}
                />
            )}

            {/* 图片URL输入模态框 */}
            {showFloatingImageInput && (
                <Modal
                    isOpen={showFloatingImageInput}
                    onClose={() => setShowFloatingImageInput(false)}
                    disableAnimation={false}
                    classNames={{
                        backdrop: "z-[9998]",
                        base: "z-[9999]",
                        wrapper: "z-[9999]"
                    }}
                >
                    <ModalContent className="max-w-md">
                        <ModalHeader>
                            <h3 className="text-lg font-medium">Insert Image</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="image-url-input" className="block text-sm font-medium text-gray-700 mb-1">
                                        Image URL
                                    </label>
                                    <Input
                                        id="image-url-input"
                                        placeholder="https://example.com/image.jpg"
                                        defaultValue="https://"
                                        type="url"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const input = e.currentTarget as HTMLInputElement;

                                                handleApplyImageUrl(input.value);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onClick={() => setShowFloatingImageInput(false)}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onClick={() => {
                                    const input = document.getElementById('image-url-input') as HTMLInputElement;

                                    handleApplyImageUrl(input.value);
                                }}
                            >
                                Insert
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
} 