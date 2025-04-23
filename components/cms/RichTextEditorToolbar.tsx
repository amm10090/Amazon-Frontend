import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Image, Link,
    Code, Quote, Undo, Redo, Package
} from 'lucide-react';
import type Quill from 'quill';
import { useState } from 'react';

import { ProductSelector, type Product } from './ProductSelector';

interface RichTextEditorToolbarProps {
    quill: Quill;
}

/**
 * 富文本编辑器工具栏组件
 * 提供常用的格式化工具和插入产品功能
 */
const RichTextEditorToolbar: React.FC<RichTextEditorToolbarProps> = ({ quill }) => {
    const [showProductSelector, setShowProductSelector] = useState(false);

    if (!quill) return null;

    const formatText = (format: string) => {
        const selection = quill.getSelection();

        if (selection) {
            quill.format(format, !quill.getFormat(selection)[format]);
        }
    };

    const formatBlock = (format: string, value: unknown) => {
        const selection = quill.getSelection();

        if (selection) {
            quill.format(format, value);
        }
    };

    const handleInsertProduct = (product: Product) => {
        // 获取当前光标位置
        const range = quill.getSelection(true);

        // 在光标位置插入产品Blot
        quill.insertEmbed(range.index, 'product', {
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price
        });

        // 将光标移动到产品后面
        quill.setSelection(range.index + 1);

        // 关闭产品选择器
        setShowProductSelector(false);
    };

    // 常用按钮组
    const buttons = [
        {
            icon: <Bold size={18} />,
            action: () => formatText('bold'),
            title: '粗体'
        },
        {
            icon: <Italic size={18} />,
            action: () => formatText('italic'),
            title: '斜体'
        },
        {
            icon: <Underline size={18} />,
            action: () => formatText('underline'),
            title: '下划线'
        },
        {
            icon: <Strikethrough size={18} />,
            action: () => formatText('strike'),
            title: '删除线'
        },
        {
            icon: <AlignLeft size={18} />,
            action: () => formatBlock('align', ''),
            title: '左对齐'
        },
        {
            icon: <AlignCenter size={18} />,
            action: () => formatBlock('align', 'center'),
            title: '居中对齐'
        },
        {
            icon: <AlignRight size={18} />,
            action: () => formatBlock('align', 'right'),
            title: '右对齐'
        },
        {
            icon: <AlignJustify size={18} />,
            action: () => formatBlock('align', 'justify'),
            title: '两端对齐'
        },
        {
            icon: <List size={18} />,
            action: () => formatBlock('list', 'bullet'),
            title: '无序列表'
        },
        {
            icon: <ListOrdered size={18} />,
            action: () => formatBlock('list', 'ordered'),
            title: '有序列表'
        },
        {
            icon: <Heading1 size={18} />,
            action: () => formatBlock('header', 1),
            title: '一级标题'
        },
        {
            icon: <Heading2 size={18} />,
            action: () => formatBlock('header', 2),
            title: '二级标题'
        },
        {
            icon: <Link size={18} />,
            action: () => {
                const url = prompt('输入链接URL:');

                if (url) {
                    const range = quill.getSelection();

                    if (range) {
                        quill.format('link', url);
                    }
                }
            },
            title: '插入链接'
        },
        {
            icon: <Image size={18} aria-hidden="false" aria-label="插入图片" />,
            action: () => {
                const url = prompt('输入图片URL:');

                if (url) {
                    const range = quill.getSelection(true);

                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1);
                }
            },
            title: '插入图片'
        },
        {
            icon: <Quote size={18} />,
            action: () => formatBlock('blockquote', !quill.getFormat().blockquote),
            title: '引用'
        },
        {
            icon: <Code size={18} />,
            action: () => formatBlock('code-block', !quill.getFormat()['code-block']),
            title: '代码块'
        },
        {
            icon: <Undo size={18} />,
            action: () => quill.history.undo(),
            title: '撤销'
        },
        {
            icon: <Redo size={18} />,
            action: () => quill.history.redo(),
            title: '重做'
        },
        {
            icon: <Package size={18} className="text-green-600" />,
            action: () => setShowProductSelector(true),
            title: '插入产品',
            highlight: true
        }
    ];

    return (
        <>
            <div className="flex flex-wrap items-center bg-gray-50 border-b border-gray-200 p-2 gap-1">
                {buttons.map((button) => (
                    <button
                        key={`button-${button.title}`}
                        onClick={button.action}
                        className={`p-1.5 rounded hover:bg-gray-200 ${button.highlight ? 'bg-green-50 hover:bg-green-100' : ''}`}
                        title={button.title}
                        type="button"
                    >
                        {button.icon}
                    </button>
                ))}
            </div>

            {/* 产品选择器模态框 */}
            {showProductSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <ProductSelector
                            isOpen={true}
                            onSelect={handleInsertProduct}
                            onClose={() => setShowProductSelector(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default RichTextEditorToolbar; 