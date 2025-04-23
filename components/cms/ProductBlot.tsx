'use client';

import { Node, mergeAttributes, type ChainedCommands } from '@tiptap/core';
import { DOMSerializer, type Node as ProseMirrorNodeType } from '@tiptap/pm/model';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import Image from 'next/image';
import { type FC, useState } from 'react';
// 从 @tiptap/pm/model 导入需要的类型和类

import { formatPrice } from '@/lib/utils';

// 产品节点的属性接口
export interface ProductAttributes {
    id: string;
    title: string;
    price: number;
    image: string;
    asin: string;
    style?: string; // 添加样式属性
}

// 产品节点组件Props - 现在使用 NodeViewProps
// type ProductComponentProps = NodeViewProps;
// 或者，如果需要扩展：
type ProductComponentProps = NodeViewProps

// 产品样式选项
const PRODUCT_STYLES = [
    { id: 'simple', name: '简单布局' },
    { id: 'card', name: '卡片布局' },
    { id: 'horizontal', name: '水平布局' },
    { id: 'mini', name: '迷你布局' }
];

// 产品节点组件
const ProductComponent: FC<ProductComponentProps> = ({ node, selected, updateAttributes }) => {
    // 直接访问 attrs，类型应该匹配了
    const { id, title, price, image, asin, style = 'simple' } = node.attrs as ProductAttributes;
    const [showStyleSelector, setShowStyleSelector] = useState(false);

    // 样式选择处理函数
    const handleStyleChange = (newStyle: string) => {
        updateAttributes({ style: newStyle });
        setShowStyleSelector(false);
    };

    // 根据样式渲染不同的商品布局
    const renderProductContent = () => {
        switch (style) {
            case 'card':
                // 更新卡片样式，使其与ContentRenderer.tsx保持一致
                return (
                    <div className="my-4 w-full max-w-[280px] mx-auto">
                        {/* 收藏按钮位置标记 - 在编辑器预览中仅作为UI指示 */}
                        <div className="absolute top-3 right-3 z-20">
                            <div className="w-8 h-8 rounded-full bg-white/80 shadow-sm flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                            {/* 产品图片 */}
                            <div className="relative w-full aspect-[1/1] bg-white pt-0.5">
                                <div className="h-full w-full relative">
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt={title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                            className="object-cover p-2"
                                            onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400 bg-white">
                                            无图片
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 产品信息 */}
                            <div className="p-3 flex-grow flex flex-col">
                                {/* 品牌信息和商店标识 */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block">
                                        品牌
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">商店</span>
                                </div>

                                <h3 className="text-base font-medium line-clamp-2 mb-2 flex-grow text-primary-dark">
                                    {title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                </h3>

                                {/* 价格和折扣 */}
                                <div className="flex items-center justify-between mt-1 mb-2">
                                    <div className="flex items-baseline min-w-0 overflow-hidden mr-2">
                                        <span className="text-lg font-semibold text-primary whitespace-nowrap">
                                            {formatPrice(price)}
                                        </span>
                                        <span className="text-xs text-secondary line-through whitespace-nowrap ml-1.5">
                                            {formatPrice(price * 1.2)}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 bg-primary-badge">
                                        -20%
                                    </span>
                                </div>
                            </div>

                            {/* 查看详情按钮 */}
                            <div className="px-3 pb-3">
                                <div className="w-full py-2 bg-primary-button hover:bg-primary-button-hover text-white text-center rounded-full font-medium shadow-sm transition-colors">
                                    查看详情
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'horizontal':
                return (
                    <div className="flex w-full border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                        {image && (
                            <div className="relative w-32 h-32 bg-gray-100 flex-shrink-0">
                                <Image
                                    src={image}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 128px"
                                    className="object-cover"
                                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                                />
                            </div>
                        )}
                        <div className="p-3 flex-1">
                            <div className="font-medium text-gray-900 mb-1">{title}</div>
                            <div className="flex justify-between items-end h-full">
                                <span className="text-lg font-bold text-green-600">{formatPrice(price)}</span>
                                {asin && <span className="text-xs text-gray-500">ASIN: {asin}</span>}
                            </div>
                        </div>
                    </div>
                );

            case 'mini':
                return (
                    <div className="flex items-center space-x-2 w-full border rounded-md p-2 bg-white">
                        {image && (
                            <div className="relative w-10 h-10 bg-gray-100 rounded">
                                <Image
                                    src={image}
                                    alt={title}
                                    fill
                                    sizes="40px"
                                    className="object-cover rounded"
                                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
                            <div className="text-xs text-green-600">{formatPrice(price)}</div>
                        </div>
                    </div>
                );

            case 'simple':
            default:
                return (
                    <div className="flex items-center w-full p-2 border rounded-md bg-white">
                        {image && (
                            <div className="relative w-16 h-16 mr-3 border rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                    src={image}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 768px) 10vw, 64px"
                                    className="object-cover"
                                    onError={(e) => { e.currentTarget.src = '/placeholder-product.jpg'; }}
                                />
                            </div>
                        )}
                        <div className="flex-grow min-w-0">
                            <div className="font-medium text-gray-900 truncate">{title}</div>
                            <div className="flex gap-2 text-sm text-gray-500">
                                <span>{formatPrice(price)}</span>
                                {asin && <span>ASIN: {asin}</span>}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <NodeViewWrapper className="product-node-wrapper my-2 relative">
            <div
                data-product-id={id}
                data-node-type="product"
                data-title={title}
                data-price={price}
                data-image={image}
                data-asin={asin}
                data-style={style}
                className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
            >
                {renderProductContent()}

                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    {/* 样式标签 */}
                    <div className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full cursor-pointer shadow-sm"
                        onClick={() => setShowStyleSelector(!showStyleSelector)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setShowStyleSelector(!showStyleSelector);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        {PRODUCT_STYLES.find(s => s.id === style)?.name || '样式选择'}
                    </div>

                    <div className="text-xs px-2 py-1 bg-gray-100 rounded-full shadow-sm">产品</div>
                </div>
            </div>

            {/* 样式选择器弹出框 */}
            {showStyleSelector && (
                <div className="absolute top-10 right-2 mt-1 bg-white border rounded-md shadow-lg z-50 p-2">
                    <div className="text-xs font-medium mb-1 px-2 py-1 bg-gray-50">选择产品展示样式</div>
                    {PRODUCT_STYLES.map((styleOption) => (
                        <div
                            key={styleOption.id}
                            className={`px-4 py-2 text-sm cursor-pointer rounded hover:bg-gray-50 ${style === styleOption.id ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handleStyleChange(styleOption.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleStyleChange(styleOption.id);
                                }
                            }}

                        >
                            {styleOption.name}
                        </div>
                    ))}
                </div>
            )}
        </NodeViewWrapper>
    );
};

// 命令参数的接口
interface CommandProps {
    commands: ChainedCommands;
}

// 创建一个自定义的序列化函数，用于序列化产品节点
const createProductSerializer = () => {
    // 序列化函数，将节点转换为DOM元素
    const productNodeToDom = (node: ProseMirrorNodeType) => {
        const el = document.createElement('div');

        el.setAttribute('data-node-type', 'product');
        el.setAttribute('data-product-id', node.attrs.id || '');
        el.setAttribute('data-title', node.attrs.title || '未命名产品');
        el.setAttribute('data-price', String(node.attrs.price || 0));
        el.setAttribute('data-image', node.attrs.image || '/placeholder-product.jpg');
        el.setAttribute('data-asin', node.attrs.asin || '');
        el.setAttribute('data-style', node.attrs.style || 'simple'); // 添加样式属性

        return el;
    };

    // 扩展DOMSerializer，添加对产品节点的支持
    const originalFromSchema = DOMSerializer.fromSchema;

    DOMSerializer.fromSchema = function (schema) {
        const serializer = originalFromSchema.call(this, schema);

        // 找到产品节点类型并添加自定义序列化函数
        const productNodeType = schema.nodes.product;

        if (productNodeType) {
            serializer.nodes.product = productNodeToDom;
        }

        return serializer;
    };
};

// 标准的 ProseMirror 节点规范中的 toDOM 函数
const productToDOM = (node: ProseMirrorNodeType) => {
    return [
        'div',
        {
            'data-node-type': 'product',
            'data-product-id': node.attrs.id || '',
            'data-title': node.attrs.title || '未命名产品',
            'data-price': String(node.attrs.price || 0),
            'data-image': node.attrs.image || '/placeholder-product.jpg',
            'data-asin': node.attrs.asin || '',
            'data-style': node.attrs.style || 'simple', // 添加样式属性
        },
        0
    ];
};

// TipTap产品节点扩展
export const ProductBlot = Node.create<ProductAttributes>({
    name: 'product',
    group: 'block',
    atom: true,
    inline: false,
    draggable: true,

    // 明确定义spec扩展，包含toDOM方法
    extending: {
        spec: {
            toDOM: productToDOM
        }
    },

    // 初始化扩展时调用，确保序列化器被正确设置
    onTransaction() {
        createProductSerializer();

        return false;
    },

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: element => element.getAttribute('data-product-id'),
                renderHTML: attributes => ({
                    'data-product-id': attributes.id,
                }),
            },
            title: {
                default: '未命名产品',
                parseHTML: element => element.getAttribute('data-title'),
                renderHTML: attributes => ({
                    'data-title': attributes.title,
                }),
            },
            price: {
                default: 0,
                parseHTML: element => parseFloat(element.getAttribute('data-price') || '0'),
                renderHTML: attributes => ({
                    'data-price': attributes.price,
                }),
            },
            image: {
                default: '/placeholder-product.jpg',
                parseHTML: element => element.getAttribute('data-image'),
                renderHTML: attributes => ({
                    'data-image': attributes.image,
                }),
            },
            asin: {
                default: '',
                parseHTML: element => element.getAttribute('data-asin'),
                renderHTML: attributes => ({
                    'data-asin': attributes.asin,
                }),
            },
            style: { // 添加样式属性
                default: 'simple',
                parseHTML: element => element.getAttribute('data-style'),
                renderHTML: attributes => ({
                    'data-style': attributes.style,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-node-type="product"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        // 确保返回正确的DOM结构
        return [
            'div',
            mergeAttributes({ 'data-node-type': 'product' }, HTMLAttributes),
            0
        ];
    },

    // 此方法将被用于序列化节点到HTML
    toDOM: productToDOM,

    addNodeView() {
        return ReactNodeViewRenderer(ProductComponent);
    },

    addCommands() {
        return {
            insertProduct: (attributes: Partial<ProductAttributes>) => ({ commands }: CommandProps) => {
                const fullAttributes: ProductAttributes = {
                    id: attributes.id || '',
                    title: attributes.title || '未命名产品',
                    price: attributes.price || 0,
                    image: attributes.image || '/placeholder-product.jpg',
                    asin: attributes.asin || '',
                    style: attributes.style || 'simple', // 添加样式默认值
                };

                return commands.insertContent({
                    type: this.name,
                    attrs: fullAttributes,
                });
            },
        } as unknown as Record<string, (...args: unknown[]) => (props: { commands: ChainedCommands }) => boolean>;
    },
});

// 初始化时注册序列化器
createProductSerializer();

export default ProductBlot; 