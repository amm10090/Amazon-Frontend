'use client';

import { Node, mergeAttributes, type ChainedCommands } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import Image from 'next/image';
import type { FC } from 'react';

import { formatPrice } from '@/lib/utils';

// 产品节点的属性接口
export interface ProductAttributes {
    id: string;
    title: string;
    price: number;
    image: string;
    sku: string;
}

// 产品节点组件Props
interface ProductComponentProps {
    node: {
        attrs: ProductAttributes;
    };
    selected: boolean;
}

// 产品节点组件
const ProductComponent: FC<ProductComponentProps> = ({ node, selected }) => {
    const { id, title, price, image, sku } = node.attrs;

    return (
        <div
            data-product-id={id}
            className={`flex items-center p-2 my-2 border rounded-md bg-white ${selected ? 'ring-2 ring-blue-500' : ''
                }`}
        >
            {image && (
                <div className="relative w-16 h-16 mr-3 border rounded-md overflow-hidden flex-shrink-0">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <div className="flex-grow min-w-0">
                <div className="font-medium text-gray-900 truncate">{title}</div>
                <div className="flex gap-2 text-sm text-gray-500">
                    <span>{formatPrice(price)}</span>
                    {sku && <span>SKU: {sku}</span>}
                </div>
            </div>
            <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">产品</div>
        </div>
    );
};

// 命令参数的接口
interface CommandProps {
    commands: ChainedCommands;
}

// TipTap产品节点扩展
export const ProductBlot = Node.create({
    name: 'product',
    group: 'block',
    atom: true, // 不可分割的节点

    // 产品节点属性定义
    addAttributes() {
        return {
            id: {
                default: null,
            },
            title: {
                default: '',
            },
            price: {
                default: 0,
                parseHTML: (element: HTMLElement) => {
                    const price = element.getAttribute('data-price');

                    return price ? parseFloat(price) : 0;
                },
            },
            image: {
                default: '',
            },
            sku: {
                default: '',
            },
        };
    },

    // 解析HTML时产品节点的识别规则
    parseHTML() {
        return [
            {
                tag: 'div[data-product-id]',
            },
        ];
    },

    // 产品节点渲染为HTML的规则
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(
                { 'data-product-id': HTMLAttributes.id, 'data-price': HTMLAttributes.price },
                HTMLAttributes,
                { class: 'product-embed' }
            ),
            0,
        ];
    },

    // 添加产品嵌入命令
    addCommands() {
        return {
            // 使用类型断言处理命令类型兼容性问题
            insertProduct: (attributes: ProductAttributes) => ({ commands }: CommandProps) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attributes,
                });
            },
        } as unknown as Record<string, (...args: unknown[]) => (props: { commands: ChainedCommands }) => boolean>;
    },

    // 使用React组件渲染产品节点
    addNodeView() {
        // @ts-expect-error: TipTap 类型系统要求特定的 NodeView 接口，但我们的组件结构略有不同
        return ReactNodeViewRenderer(ProductComponent);
    },
});

export default ProductBlot; 