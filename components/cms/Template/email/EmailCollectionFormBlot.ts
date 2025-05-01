import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { EmailCollectionFormView } from './EmailCollectionFormView';

// 表单属性类型接口
export interface EmailFormAttributes {
    formTitle: string;
    formDescription: string;
    inputPlaceholder: string;
    submitButtonText: string;
    sourceType: 'general' | 'blog';
    formId: string;
    style: 'default' | 'compact' | 'blog' | 'deals';
}

// 扩展命令类型
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        emailCollectionForm: {
            /**
             * 插入电子邮件收集表单
             */
            insertEmailCollectionForm: (attributes?: Partial<EmailFormAttributes>) => ReturnType;
        };
    }
}

// 定义Email Collection Form 节点扩展
export const EmailCollectionFormBlot = Node.create<{
    HTMLAttributes: Record<string, string | number | boolean | null | undefined>;
}>({
    name: 'emailCollectionForm', // 节点名称
    group: 'block',              // 块级节点
    atom: true,                  // 作为不可分割的原子节点
    isolating: true,             // 隔离内容

    // 定义属性及默认值
    addAttributes() {
        return {
            formTitle: {
                default: 'Subscribe to get the latest news',
            },
            formDescription: {
                default: 'Enter your email address to get the latest product information and discount offers.',
            },
            inputPlaceholder: {
                default: 'your.email@example.com',
            },
            submitButtonText: {
                default: 'Subscribe',
            },
            sourceType: {
                default: 'general',
                parseHTML: (element) => element.getAttribute('data-source-type') || 'general',
                renderHTML: (attributes) => {
                    return {
                        'data-source-type': attributes.sourceType,
                    };
                },
            },
            formId: {
                default: () => `form-${Date.now()}`, // 生成唯一ID
                parseHTML: (element) => element.getAttribute('data-form-id') || `form-${Date.now()}`,
                renderHTML: (attributes) => {
                    return {
                        'data-form-id': attributes.formId,
                    };
                },
            },
            style: {
                default: 'default',
                parseHTML: (element) => element.getAttribute('data-style') || 'default',
                renderHTML: (attributes) => {
                    return {
                        'data-style': attributes.style,
                    };
                },
            },
        };
    },

    // 定义HTML解析规则
    parseHTML() {
        return [
            {
                tag: 'div[data-type="email-collection-form"]',
            },
        ];
    },

    // 定义HTML渲染规则
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(
                {
                    'data-type': 'email-collection-form',
                    'data-form-title': HTMLAttributes.formTitle,
                    'data-form-description': HTMLAttributes.formDescription,
                    'data-input-placeholder': HTMLAttributes.inputPlaceholder,
                    'data-submit-button-text': HTMLAttributes.submitButtonText,
                    'data-source-type': HTMLAttributes.sourceType,
                    'data-form-id': HTMLAttributes.formId,
                    'data-style': HTMLAttributes.style
                },
                HTMLAttributes
            ),
            '', // 空内容，实际内容由React组件渲染
        ];
    },

    // 添加节点视图渲染器
    addNodeView() {
        return ReactNodeViewRenderer(EmailCollectionFormView);
    },

    // 添加命令
    addCommands() {
        return {
            insertEmailCollectionForm: (attributes = {}) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attributes,
                });
            },
        };
    },
}); 