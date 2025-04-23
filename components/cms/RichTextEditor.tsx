'use client';

import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Input,
    Button
} from '@heroui/react';
import { type Editor as EditorType } from '@tiptap/core';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, List, ListOrdered,
    Link as LinkIcon, Image as ImageIcon, Tag, Heading1, Heading2,
    Strikethrough, Code, Quote, Eye, Edit3, Highlighter, Palette
} from 'lucide-react';
import { useState, useEffect, useCallback, type MouseEvent } from 'react';

import { ProductBlot, type ProductAttributes } from './ProductBlot';
import { ProductSelector, type Product } from './ProductSelector';
import { TiptapToolbar } from './TiptapToolbar';

// 产品命令类型定义
interface ProductCommands {
    insertProduct: (attributes: ProductAttributes) => boolean;
}

// 默认字符限制
const DEFAULT_CHAR_LIMIT = 10000;

// 预设文本颜色
const TEXT_COLORS = {
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
    placeholder = '在此输入内容...',
    className = '',
    editorClass = '',
    onEditorReady,
    charLimit = DEFAULT_CHAR_LIMIT // 默认2000字符
}: RichTextEditorProps) {
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [charactersCount, setCharactersCount] = useState(0);
    const [wordsCount, setWordsCount] = useState(0);
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    // 客户端渲染检测
    useEffect(() => {
        setIsClient(true);
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
                heading: {
                    levels: [1, 2, 3],
                },
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
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            Image.configure({
                inline: false,
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
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image || '',
            sku: product.sku || '',
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

    // 处理文本颜色
    const handleTextColor = useCallback((e: MouseEvent<HTMLButtonElement>, color: string | null) => {
        // 阻止事件冒泡，防止触发表单提交
        e.preventDefault();
        e.stopPropagation();

        if (!editor) return;

        try {
            if (color === null) {
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

    // 处理 FloatingMenu 中的图片添加
    const handleFloatingImageAdd = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        // 阻止事件冒泡，防止触发表单提交
        e.preventDefault();
        e.stopPropagation();

        if (!editor) return;
        const url = prompt('输入图片 URL:', 'https://');

        if (url && url !== 'https://') {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    // 打开产品选择器的回调
    const handleAddProductClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
        // 阻止事件冒泡，防止触发表单提交
        e.preventDefault();
        e.stopPropagation();

        setShowProductSelector(true);
    }, []);

    // 切换编辑/预览模式
    const togglePreviewMode = useCallback(() => {
        setIsPreviewMode(!isPreviewMode);
    }, [isPreviewMode]);

    // 或者你可能需要创建一个新的工具栏调用包装器
    const handleAddProductWrapper = () => {
        setShowProductSelector(true);
    };

    // 如果不在客户端，返回占位符
    if (!isClient) {
        return <div className={className}><div className={editorClass}>加载编辑器...</div></div>;
    }

    return (
        <div className={`rich-text-editor ${className} border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-150 ${isOverLimit ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' : ''}`}>
            {/* 编辑器顶部工具栏 */}
            <div className="flex justify-between items-center border-b border-gray-300 bg-gray-50">
                {!isPreviewMode ? (
                    <TiptapToolbar editor={editor} onAddProduct={handleAddProductWrapper} />
                ) : (
                    <div className="px-3 py-2 font-medium text-gray-700">
                        预览模式
                    </div>
                )}

                <div className="flex items-center py-1 px-3">
                    <button
                        type="button"
                        onClick={togglePreviewMode}
                        className={`px-3 py-1.5 rounded hover:bg-gray-100 text-gray-700 flex items-center ${isPreviewMode ? 'bg-gray-200' : ''}`}
                        title={isPreviewMode ? "切换到编辑模式" : "切换到预览模式"}
                    >
                        {isPreviewMode ? (
                            <>
                                <Edit3 size={16} className="mr-1" />
                                <span>编辑</span>
                            </>
                        ) : (
                            <>
                                <Eye size={16} className="mr-1" />
                                <span>预览</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 编辑器内容区域 */}
            <div className={`relative ${isPreviewMode ? 'bg-white' : ''}`}>
                <EditorContent
                    editor={editor}
                    className={`prose max-w-none p-4 min-h-[300px] overflow-y-auto ${editorClass} ${isPreviewMode ? 'prose-sm sm:prose lg:prose-lg' : ''}`}
                    readOnly={isPreviewMode}
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
                        color: #444;
                    }
                    .ProseMirror h3 {
                        font-size: 1.25rem;
                        font-weight: 500;
                        margin-top: 0.6rem;
                        margin-bottom: 0.3rem;
                        color: #555;
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
                `}</style>

                {/* Markdown快捷方式提示 */}
                {!isPreviewMode && !editor?.getText() && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-center pointer-events-none">
                        <p className="mb-2">Markdown快捷方式可用</p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="text-left"># 标题1</div>
                            <div className="text-left">## 标题2</div>
                            <div className="text-left">*斜体*</div>
                            <div className="text-left">**粗体**</div>
                            <div className="text-left">`代码`</div>
                            <div className="text-left">&gt; 引用</div>
                            <div className="text-left">- 列表项</div>
                            <div className="text-left">1. 有序列表</div>
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
                                字符数: <span className={`font-medium ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : ''}`}>
                                    {charactersCount}
                                </span>
                                {charLimit ? (
                                    <span className="text-gray-400 ml-1">/ {charLimit}</span>
                                ) : null}
                            </div>
                            <div>
                                词数: <span className="font-medium">{wordsCount}</span>
                            </div>
                        </div>

                        {isNearLimit && !isOverLimit && (
                            <div className="text-yellow-600 font-medium">
                                剩余: {remainingChars} 字符
                            </div>
                        )}

                        {isOverLimit && (
                            <div className="text-red-500 font-medium animate-pulse">
                                已超出 {Math.abs(remainingChars)} 字符
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bubble Menu: 用于内联格式化 (仅编辑模式) */}
            {editor && !isPreviewMode && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{
                        duration: 150,
                        placement: 'top',
                        offset: [0, 10],
                        zIndex: 50,
                        animation: 'shift-away',
                        interactive: true,
                        appendTo: () => document.body,
                        onShow: () => {
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
                        }
                    }}
                    className="bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 flex gap-1.5 transition-opacity duration-150"
                    shouldShow={({ editor }) => {
                        const { state } = editor;

                        return !state.selection.empty && !isLinkPopoverOpen;
                    }}
                >
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
                        title="加粗"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
                        title="斜体"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('strike') ? 'bg-blue-100 text-blue-600' : ''}`}
                        title="删除线"
                    >
                        <Strikethrough size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={handleHighlight}
                        className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('highlight') ? 'bg-blue-100 text-blue-600' : ''}`}
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

                    {/* 文本颜色下拉 - 使用 Popover 替换 */}
                    <Popover placement="bottom" showArrow>
                        <PopoverTrigger>
                            <button
                                type="button"
                                className={`p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition-colors ${editor?.isActive('textStyle') ? 'bg-blue-100 text-blue-600' : ''}`}
                                title="文本颜色"
                            >
                                <Palette size={16} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-1">
                            <div className="grid grid-cols-5 gap-1 p-1 bg-gray-50 rounded">
                                {/* 默认颜色 */}
                                <button
                                    type="button"
                                    onClick={(e) => handleTextColor(e, null)}
                                    className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:shadow-sm ${!editor?.isActive('textStyle') ? 'ring-2 ring-blue-500' : ''}`}
                                    title="默认颜色"
                                >
                                    <span className="text-xs">Aa</span>
                                </button>

                                {/* 文本颜色选项 */}
                                {Object.entries(TEXT_COLORS).filter(([name]) => name !== 'default').map(([name, color]) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={(e) => handleTextColor(e, color)}
                                        className={`w-6 h-6 rounded-full border border-gray-300 hover:shadow-sm ${editor?.isActive('textStyle', { color }) ? 'ring-2 ring-blue-500' : ''}`}
                                        style={{ backgroundColor: color }}
                                        title={`文本颜色 (${name})`}
                                    />
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </BubbleMenu>
            )}

            {/* Floating Menu: 用于插入块级元素 (仅编辑模式) */}
            {editor && !isPreviewMode && (
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
                    className="bg-white border border-gray-200 p-1 rounded shadow-lg flex flex-col gap-0.5 z-50" // 增加 z-index 确保在最上层
                    shouldShow={({ state }) => {
                        const { $from } = state.selection;
                        const currentLineIsEmpty = $from.parent.content.size === 0;

                        return currentLineIsEmpty && $from.parent.type.name === 'paragraph';
                    }}
                >
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <Heading1 size={16} /> 一级标题
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <Heading2 size={16} /> 二级标题
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <List size={16} /> 无序列表
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <ListOrdered size={16} /> 有序列表
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <Quote size={16} /> 引用
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <Code size={16} /> 代码块
                    </button>
                    <button
                        type="button"
                        onClick={handleFloatingImageAdd}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <ImageIcon size={16} /> 插入图片 (URL)
                    </button>
                    <button
                        type="button"
                        onClick={handleAddProductClick}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                        <Tag size={16} /> 插入产品
                    </button>
                </FloatingMenu>
            )}

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