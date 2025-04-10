'use client';

import { addToast } from '@heroui/react';
import { Edit, Eye, PlusCircle, Save, X, Upload, Code, Trash2, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type Quill from 'quill';
import { useEffect, useState, useRef } from 'react';

import { EMAIL_TEMPLATE_TYPES, type EmailTemplateType } from '@/lib/email/email-template-types';

// 引入CSS - 确保在编辑和预览中都能正确显示样式
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

// 内联样式 - 确保只显示一个工具栏
const inlineStyles = `
.ql-toolbar.ql-snow + .ql-toolbar.ql-snow {
  display: none !important;
}
`;

// 动态导入QuillEditor组件，避免服务器端渲染错误
const QuillEditor = dynamic(
    async () => {
        const { default: Quill } = await import('quill');

        // 创建一个用于清理ID的辅助函数，确保生成的ID可用于CSS选择器
        const sanitizeId = (id: string): string => {
            // 移除ID中所有特殊字符，仅保留字母、数字和连字符
            return `quill-${id.replace(/[^a-zA-Z0-9-]/g, "")}`;
        };

        const QuillEditorComponent = ({
            value,
            onChange,
            placeholder,
            modules,
            formats,
            theme = 'snow',
            className = '',
            onEditorReady,
            id = 'quill-editor'
        }: {
            value: string;
            onChange: (content: string) => void;
            placeholder?: string;
            modules?: Record<string, unknown>;
            formats?: string[];
            theme?: string;
            className?: string;
            onEditorReady?: (quill: Quill) => void;
            id?: string;
        }) => {
            const editorRef = useRef<HTMLDivElement>(null);
            const quillInstance = useRef<Quill | null>(null);
            // 确保ID是安全的CSS选择器
            const safeId = sanitizeId(id);
            // 添加初始化标记，确保只初始化一次
            const isInitialized = useRef(false);

            useEffect(() => {
                // 检查编辑器是否已经初始化，避免重复创建实例
                if (editorRef.current && !isInitialized.current) {
                    // 检查DOM元素是否已经有Quill类，避免重复初始化
                    if (editorRef.current.classList.contains('ql-container')) {
                        return;
                    }

                    isInitialized.current = true;

                    try {
                        // 直接使用传入的modules配置，不做额外处理
                        quillInstance.current = new Quill(editorRef.current, {
                            modules,
                            placeholder,
                            theme,
                            formats
                        });

                        // 设置初始内容
                        if (value) {
                            quillInstance.current.clipboard.dangerouslyPasteHTML(value);
                        }

                        // 监听内容变化事件
                        quillInstance.current.on('text-change', () => {
                            const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';

                            onChange(html);
                        });

                        // 向父组件提供Quill实例
                        if (onEditorReady) {
                            onEditorReady(quillInstance.current);
                        }
                    } catch {
                        return
                    }
                }

                // 清理函数
                return () => {
                    if (quillInstance.current) {
                        try {
                            quillInstance.current.off('text-change');
                            quillInstance.current = null;
                            isInitialized.current = false;
                        } catch {
                            return
                        }
                    }
                };
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            // 当value通过props更新时同步内容
            useEffect(() => {
                if (quillInstance.current && value) {
                    const currentContent = editorRef.current?.querySelector('.ql-editor')?.innerHTML;

                    if (currentContent !== value) {
                        quillInstance.current.clipboard.dangerouslyPasteHTML(value);
                    }
                }
            }, [value]);

            return (
                <div className={`quill-container ${className}`} id={`${safeId}-container`}>
                    <div ref={editorRef} className="quill-editor" id={safeId} />
                </div>
            );
        };

        QuillEditorComponent.displayName = 'QuillEditor';

        return QuillEditorComponent;
    },
    {
        ssr: false,
        loading: () => <div className="h-96 border border-gray-300 rounded-md flex items-center justify-center text-gray-500">Loading editor...</div>
    }
);

// 模板类型定义
interface EmailTemplate {
    id: string;
    templateId: string;
    name: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    htmlContent: string;
    type: string;
    isActive: boolean;
    updatedAt: string;
    createdAt: string;
}

// 空白模板
const EMPTY_TEMPLATE: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
    templateId: '',
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    htmlContent: '',
    type: EMAIL_TEMPLATE_TYPES.SUBSCRIPTION_CONFIRMATION,
    isActive: true,
};

// 富文本编辑器支持的格式
const EDITOR_FORMATS = [
    // 内联格式
    'background', 'bold', 'color', 'font', 'code', 'italic', 'link',
    'size', 'strike', 'script', 'underline',

    // 块级格式
    'blockquote', 'header', 'indent', 'list', 'align', 'direction', 'code-block',

    // 嵌入格式
    'formula', 'image', 'video'
];

// 编辑器的默认配置
const DEFAULT_QUILL_MODULES = {
    toolbar: [
        // 字体相关
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],

        // 文本格式化
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],

        // 颜色相关
        [{ 'color': [] }, { 'background': [] }],

        // 文本对齐和方向
        [{ 'align': [] }],
        [{ 'direction': 'rtl' }],

        // 列表和缩进
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],

        // 标题
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        // 链接、图片、视频和公式
        ['link', 'image', 'video', 'formula'],

        // 清除格式
        ['clean']
    ],
    history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true
    }
};

// 主组件
const TemplatesPageContent = () => {
    // 状态管理
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [formData, setFormData] = useState(EMPTY_TEMPLATE);
    const [previewMode, setPreviewMode] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const activeQuillInstance = useRef<Quill | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 添加HTML代码编辑模式状态变量
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    // 删除功能的状态管理
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 变量选择器选项
    const availableVariables = [
        { label: 'Email Address', value: '{{email}}' },
        { label: 'Date', value: '{{date}}' },
        { label: 'Name', value: '{{name}}' },
    ];

    // 模板类型选项
    const templateTypeOptions = [
        { value: EMAIL_TEMPLATE_TYPES.SUBSCRIPTION_CONFIRMATION, label: 'Subscription Confirmation Email' },
        { value: EMAIL_TEMPLATE_TYPES.USER_REGISTRATION, label: 'User Registration Email' },
        { value: EMAIL_TEMPLATE_TYPES.PASSWORD_RESET, label: 'Password Reset Email' },
        { value: EMAIL_TEMPLATE_TYPES.ORDER_CONFIRMATION, label: 'Order Confirmation Email' },
    ];

    // 加载模板列表
    useEffect(() => {
        fetchTemplates();
    }, []);

    // 获取模板数据
    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/email-templates');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch template list');
            }

            setTemplates(data.data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch template list, please try again later');
        } finally {
            setIsLoading(false);
        }
    };

    // 获取单个模板详情
    const fetchTemplateDetails = async (id: string) => {
        try {
            setIsLoading(true);

            const response = await fetch(`/api/email-templates/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch template details');
            }

            setSelectedTemplate(data.data);
            setFormData({
                templateId: data.data.templateId,
                name: data.data.name,
                subject: data.data.subject,
                fromName: data.data.fromName,
                fromEmail: data.data.fromEmail,
                htmlContent: data.data.htmlContent,
                type: data.data.type,
                isActive: data.data.isActive !== undefined ? data.data.isActive : true,
            });
            setEditorContent(data.data.htmlContent);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch template details, please try again later');
            addToast({
                title: "Fetch Failed",
                description: error instanceof Error ? error.message : 'Failed to fetch template details, please try again later',
                color: "danger",
                timeout: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 保存模板
    const saveTemplate = async () => {
        try {
            setIsLoading(true);

            // 根据当前编辑模式获取内容
            let htmlContent = editorContent;

            // 如果是富文本模式，从Quill实例获取内容
            if (!isHtmlMode && activeQuillInstance.current) {
                htmlContent = activeQuillInstance.current.root.innerHTML;
            }
            // 如果是HTML代码模式，直接使用editorContent

            // 验证编辑器内容是否为空
            if (!htmlContent || htmlContent.trim() === '') {
                throw new Error('Email content cannot be empty');
            }

            // 确保表单数据完整
            if (!formData.name || !formData.templateId || !formData.subject || !formData.fromName || !formData.fromEmail) {
                throw new Error('Please fill in all required fields');
            }

            // 验证类型字段是否是有效的枚举值
            if (!Object.values(EMAIL_TEMPLATE_TYPES).includes(formData.type as EmailTemplateType)) {
                throw new Error('Please select a valid template type');
            }

            // 更新完整表单数据 - 使用最终的HTML内容
            const updatedData = {
                ...formData,
                htmlContent: htmlContent
            };

            let response;
            let successMessage;

            if (isCreatingNew) {
                // 创建新模板
                response = await fetch('/api/email-templates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
                successMessage = "Email template has been created successfully";
            } else {
                // 更新现有模板
                if (!selectedTemplate) return;

                response = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedData),
                });
                successMessage = "Email template has been updated successfully";
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save template');
            }

            // 更新成功提示
            addToast({
                title: "Save Successful",
                description: successMessage,
                color: "success",
                timeout: 5000,
            });

            // 刷新数据
            await fetchTemplates();

            // 如果是新创建的模板，则获取其ID并加载详情
            if (isCreatingNew && data.data && data.data.id) {
                // 添加短暂延迟以确保API端完成数据更新
                await new Promise(resolve => setTimeout(resolve, 1000));
                await fetchTemplateDetails(data.data.id);
                setIsCreatingNew(false);
            } else if (selectedTemplate) {
                // 添加短暂延迟以确保API端完成数据更新
                await new Promise(resolve => setTimeout(resolve, 1000));
                await fetchTemplateDetails(selectedTemplate.id);
            }

            // 退出编辑模式
            setIsEditing(false);
        } catch (error) {
            // 获取更详细的错误信息
            let errorMessage = 'Failed to save template, please try again later';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            addToast({
                title: "Save Failed",
                description: errorMessage,
                color: "danger",
                timeout: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 处理删除模板
    const handleDeleteClick = (template: EmailTemplate, e?: React.MouseEvent) => {
        // 如果是从列表点击，防止冒泡触发选中模板
        if (e) {
            e.stopPropagation();
        }

        // 设置要删除的模板并打开确认对话框
        setTemplateToDelete(template);
        setIsDeleteDialogOpen(true);
    };

    // 确认删除模板
    const confirmDelete = async () => {
        if (!templateToDelete) return;

        try {
            setIsDeleting(true);

            const response = await fetch(`/api/email-templates/${templateToDelete.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete template');
            }

            // 删除成功提示
            addToast({
                title: "Delete Successful",
                description: "Email template has been deleted successfully",
                color: "success",
                timeout: 5000,
            });

            // 刷新模板列表
            await fetchTemplates();

            // 如果删除的是当前选中的模板，重置选中状态
            if (selectedTemplate && selectedTemplate.id === templateToDelete.id) {
                setSelectedTemplate(null);
                setFormData(EMPTY_TEMPLATE);
                setEditorContent('');
            }

            // 关闭对话框
            setIsDeleteDialogOpen(false);
            setTemplateToDelete(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete template, please try again later';

            setError(errorMessage);
            addToast({
                title: "Delete Failed",
                description: errorMessage,
                color: "danger",
                timeout: 5000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // 取消删除
    const cancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
    };

    // 处理表单输入
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 处理编辑器内容变化
    const handleEditorChange = (content: string) => {
        setEditorContent(content);
        // 同时更新formData中的htmlContent字段
        setFormData(prev => ({
            ...prev,
            htmlContent: content
        }));
    };

    // 处理编辑器实例就绪事件
    const handleEditorReady = (quill: Quill) => {
        activeQuillInstance.current = quill;
    };

    // 插入变量到编辑器
    const insertVariable = async (variable: string) => {
        // 确保只在客户端执行
        if (typeof window === 'undefined') return;

        try {
            // 使用保存的Quill实例直接操作
            if (!activeQuillInstance.current) {
                addToast({
                    title: "Operation Failed",
                    description: "Editor not ready, please try again later",
                    color: "danger",
                    timeout: 3000,
                });

                return;
            }

            // 获取当前选区
            const range = activeQuillInstance.current.getSelection(true);

            if (range) {
                // 在当前选区插入变量文本
                activeQuillInstance.current.insertText(range.index, variable);
                // 更新选区位置
                activeQuillInstance.current.setSelection(range.index + variable.length);

                // 给用户反馈
                addToast({
                    title: "Variable Inserted",
                    description: `${variable} has been inserted into the editor`,
                    color: "success",
                    timeout: 2000,
                });
            } else {
                // 如果没有选区，则在编辑器末尾插入
                const length = activeQuillInstance.current.getLength();

                activeQuillInstance.current.insertText(length - 1, variable);
                activeQuillInstance.current.setSelection(length - 1 + variable.length);

                addToast({
                    title: "Variable Inserted",
                    description: `${variable} has been inserted at the end of the editor`,
                    color: "success",
                    timeout: 2000,
                });
            }
        } catch {
            addToast({
                title: "Variable Insertion Failed",
                description: "Error occurred while inserting variable, please try again",
                color: "danger",
                timeout: 3000,
            });
        }
    };

    // 移除手动同步按钮，替换为自动同步功能
    const syncEditorContent = () => {
        if (activeQuillInstance.current) {
            const content = activeQuillInstance.current.root.innerHTML;

            // 更新状态和表单数据
            setEditorContent(content);
            setFormData(prev => ({
                ...prev,
                htmlContent: content
            }));

            return true;
        }

        return false;
    };

    // 保存前确保内容同步
    const handleSave = () => {
        // 先同步编辑器内容
        syncEditorContent();
        // 然后保存模板
        saveTemplate();
    };

    // 处理添加新模板
    const handleAddTemplate = () => {
        // 重置表单数据为空白模板
        setFormData(EMPTY_TEMPLATE);
        // 重置编辑器内容
        setEditorContent('');
        // 标记为创建新模板
        setIsCreatingNew(true);
        // 取消选中当前模板
        setSelectedTemplate(null);
        // 进入编辑模式
        setIsEditing(true);
        // 退出预览模式
        setPreviewMode(false);
    };

    // 处理文件上传
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) return;

        const file = files[0];

        // 检查文件类型
        if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
            addToast({
                title: 'just upload html file',
                description: 'Please upload a .html file',
                color: "danger",
                timeout: 5000,
            });

            return;
        }

        try {
            setUploadLoading(true);
            const formData = new FormData();

            formData.append('file', file);

            const response = await fetch('/api/email-templates/upload-html', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Upload HTML file failed');
            }

            // 更新编辑器内容和表单数据
            setEditorContent(result.data.htmlContent);
            setFormData(prev => ({
                ...prev,
                htmlContent: result.data.htmlContent,
            }));

            addToast({
                title: 'HTML file uploaded successfully',
                description: `Successfully loaded ${file.name} file content`,
                color: "success",
                timeout: 5000,
            });
        } catch (error) {
            addToast({
                title: 'Upload Failed',
                description: error instanceof Error ? error.message : 'Upload HTML file failed, please try again',
                color: "danger",
                timeout: 5000,
            });
        } finally {
            setUploadLoading(false);
            // 重置文件输入，允许再次上传相同文件
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // 触发文件选择对话框
    const triggerFileUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 渲染模板列表
    const renderTemplateList = () => {
        if (templates.length === 0) {
            return (
                <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-600">No email templates yet</p>
                    <button
                        onClick={handleAddTemplate}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Create First Template
                    </button>
                </div>
            );
        }

        return (
            <div className="divide-y divide-gray-200">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedTemplate?.id === template.id ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                            fetchTemplateDetails(template.id);
                            setPreviewMode(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                fetchTemplateDetails(template.id);
                                setPreviewMode(false);
                            }
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center">
                                    <h3 className="text-md font-medium text-gray-900">{template.name}</h3>
                                    {template.isActive === false && (
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                                            Inactive
                                        </span>
                                    )}
                                    {template.isActive && (
                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">ID: {template.templateId}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Type: {templateTypeOptions.find(opt => opt.value === template.type)?.label || template.type}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Last updated: {new Date(template.updatedAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fetchTemplateDetails(template.id);
                                        setIsEditing(true);
                                        setPreviewMode(false);
                                    }}
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={(e) => handleDeleteClick(template, e)}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // 渲染编辑表单
    const renderEditForm = () => {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-medium">{isCreatingNew ? "Create New Template" : "Edit Template"}</h2>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </button>
                        <button
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                            onClick={() => {
                                setIsEditing(false);
                                setIsCreatingNew(false);
                                // 仅当有selectedTemplate时才重置为原始数据
                                if (selectedTemplate) {
                                    setFormData({
                                        templateId: selectedTemplate.templateId,
                                        name: selectedTemplate.name,
                                        subject: selectedTemplate.subject,
                                        fromName: selectedTemplate.fromName,
                                        fromEmail: selectedTemplate.fromEmail,
                                        htmlContent: selectedTemplate.htmlContent,
                                        type: selectedTemplate.type,
                                        isActive: selectedTemplate.isActive !== undefined ? selectedTemplate.isActive : true,
                                    });
                                    setEditorContent(selectedTemplate.htmlContent);
                                }
                            }}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Subscription Confirmation"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
                            <input
                                type="text"
                                name="templateId"
                                value={formData.templateId}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., subscription_confirmation"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Welcome to our newsletter!"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                            <input
                                type="text"
                                name="fromName"
                                value={formData.fromName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., OOHUNT Team"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                            <input
                                type="email"
                                name="fromEmail"
                                value={formData.fromEmail}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., newsletter@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                {templateTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                The template type determines how the system automatically uses this template
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Status</label>
                            <div className="mt-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                isActive: e.target.checked
                                            }));
                                        }}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    Disabled templates will not be automatically used by the system
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <label htmlFor="html-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                HTML Content
                            </label>
                            <div className="flex items-center space-x-2">
                                {/* 变量选择器 */}
                                <select
                                    className="text-sm border border-gray-300 rounded-md p-1.5 bg-white dark:bg-gray-800 dark:border-gray-600"
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            insertVariable(e.target.value);
                                            e.target.value = ''; // 重置选择
                                        }
                                    }}
                                    disabled={!activeQuillInstance.current}
                                >
                                    <option value="">Insert variable...</option>
                                    {availableVariables.map((variable) => (
                                        <option key={variable.value} value={variable.value}>
                                            {variable.label}
                                        </option>
                                    ))}
                                </select>

                                {/* HTML文件上传按钮 */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".html"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={triggerFileUpload}
                                    disabled={uploadLoading}
                                    className={`flex items-center p-1.5 text-sm rounded-md ${uploadLoading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                    title="Upload HTML File"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="ml-1.5">{uploadLoading ? 'Uploading...' : 'Upload HTML'}</span>
                                </button>

                                {/* HTML代码模式切换按钮 */}
                                <button
                                    type="button"
                                    onClick={handleModeToggle}
                                    className={`flex items-center p-1.5 text-sm rounded-md ${isHtmlMode
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    title={isHtmlMode ? "Switch to Rich Text Mode" : "Switch to HTML Code Mode"}
                                >
                                    <Code className="w-4 h-4" />
                                    <span className="ml-1.5">{isHtmlMode ? "Rich Text" : "HTML Code"}</span>
                                </button>

                                {/* 预览切换按钮 */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        // 先同步内容
                                        if (!isHtmlMode && activeQuillInstance.current) {
                                            // 从富文本编辑器获取内容
                                            const newContent = activeQuillInstance.current.root.innerHTML;

                                            setEditorContent(newContent);
                                            setFormData(prev => ({
                                                ...prev,
                                                htmlContent: newContent
                                            }));
                                        }
                                        // 切换预览模式
                                        setPreviewMode(!previewMode);
                                    }}
                                    className={`flex items-center p-1.5 text-sm rounded-md ${previewMode
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    title={previewMode ? "Back to Edit Mode" : "Preview HTML"}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="ml-1.5">{previewMode ? "Back to Edit" : "Preview"}</span>
                                </button>
                            </div>
                        </div>

                        <div className="border rounded-md">
                            {!isHtmlMode ? (
                                // 富文本编辑器模式
                                <QuillEditor
                                    theme="snow"
                                    value={editorContent}
                                    onChange={handleEditorChange}
                                    modules={DEFAULT_QUILL_MODULES}
                                    formats={EDITOR_FORMATS}
                                    placeholder="Edit your email HTML content here..."
                                    className="h-96"
                                    onEditorReady={handleEditorReady}
                                    id={`editor-${selectedTemplate?.id || 'new-template'}`}
                                />
                            ) : (
                                // HTML代码编辑模式
                                <textarea
                                    value={editorContent}
                                    onChange={(e) => handleEditorChange(e.target.value)}
                                    className="w-full h-96 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0 resize-none"
                                    placeholder="<!-- Edit your HTML code here -->"
                                    spellCheck="false"
                                    style={{
                                        lineHeight: '1.5',
                                        tabSize: 2,
                                    }}
                                />
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                                {isHtmlMode
                                    ? "You are in HTML code editing mode. Changes will be reflected in the rich text editor when you switch back."
                                    : "Content will be automatically synchronized when saved. You can use variables like {{email}} to dynamically replace content."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 渲染模板详情
    const renderTemplateDetails = () => {
        // 如果是创建新模板或正在编辑，显示编辑表单
        if (isEditing) {
            return renderEditForm();
        }

        // 如果没有选中模板且不是创建新模板模式，显示提示信息
        if (!selectedTemplate) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Please select a template from the list</p>
                </div>
            );
        }

        if (previewMode) {
            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-medium">Preview Mode</h2>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                onClick={() => setPreviewMode(false)}
                            >
                                Back
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p><strong>Subject:</strong> {selectedTemplate.subject}</p>
                            <p><strong>From:</strong> {selectedTemplate.fromName} &lt;{selectedTemplate.fromEmail}&gt;</p>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-1 bg-gray-100 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="flex-1 text-center text-xs text-gray-500">Email Preview</div>
                                </div>
                            </div>
                            <div
                                className="p-4 ql-editor"
                                dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // 正常查看模式
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-medium">{selectedTemplate.name}</h2>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </button>
                        <button
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                            onClick={() => setPreviewMode(true)}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                        </button>
                        <button
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                            onClick={() => handleDeleteClick(selectedTemplate)}
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                            <div className="space-y-2">
                                <p><strong>Template ID:</strong> {selectedTemplate.templateId}</p>
                                <p>
                                    <strong>Type:</strong> {templateTypeOptions.find(opt => opt.value === selectedTemplate.type)?.label || selectedTemplate.type}
                                </p>
                                <p>
                                    <strong>Status:</strong> {' '}
                                    {selectedTemplate.isActive ? (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Active</span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">Inactive</span>
                                    )}
                                </p>
                                <p><strong>Created:</strong> {new Date(selectedTemplate.createdAt).toLocaleString()}</p>
                                <p><strong>Last Updated:</strong> {new Date(selectedTemplate.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Email Settings</h3>
                            <div className="space-y-2">
                                <p><strong>Subject:</strong> {selectedTemplate.subject}</p>
                                <p><strong>From:</strong> {selectedTemplate.fromName} &lt;{selectedTemplate.fromEmail}&gt;</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Email HTML Content Preview</h3>
                        <div className="border rounded-lg p-4 mt-2 bg-white max-h-96 overflow-auto">
                            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 确保编辑器实例在编辑模式改变时重置
    useEffect(() => {
        // 当退出编辑模式时，清理编辑器实例
        if (!isEditing) {
            activeQuillInstance.current = null;
        }
    }, [isEditing]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            activeQuillInstance.current = null;
        };
    }, []);

    // 添加编辑器全局变更事件监听
    useEffect(() => {
        // 确保编辑器实例存在并且处于编辑模式
        const quillInstance = activeQuillInstance.current;

        if (!quillInstance || !isEditing) return;

        // 监听所有编辑器变化事件
        quillInstance.on('editor-change', (eventName) => {
            if (eventName === 'text-change' && quillInstance) {
                const html = quillInstance.root.innerHTML;

                // 同步更新状态和表单数据
                setEditorContent(html);
                setFormData(prev => ({
                    ...prev,
                    htmlContent: html
                }));
            }
        });

        // 清理函数
        return () => {
            quillInstance.off('editor-change');
        };
    }, [isEditing]); // 仅依赖编辑状态，避免使用引用类型导致频繁重新订阅

    // 添加模式切换处理函数
    const handleModeToggle = () => {
        // 如果当前是富文本模式，切换到HTML模式前需要同步内容
        if (!isHtmlMode && activeQuillInstance.current) {
            // 获取最新的富文本内容
            const htmlContent = activeQuillInstance.current.root.innerHTML;

            setEditorContent(htmlContent);
            setFormData(prev => ({
                ...prev,
                htmlContent: htmlContent
            }));
        }

        // 切换模式
        setIsHtmlMode(!isHtmlMode);
    };

    // 主要渲染
    return (
        <div className="space-y-6 max-w-full">
            {/* 添加内联样式 */}
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Email Template Management</h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex flex-col lg:flex-row min-h-[600px]">
                    {/* 左侧模板列表 */}
                    <div className="w-full lg:w-1/3 border-r border-gray-200">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-medium">Template List</h2>
                            <button
                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                                onClick={handleAddTemplate}
                            >
                                <PlusCircle className="w-4 h-4 mr-1" />
                                Add Template
                            </button>
                        </div>
                        {isLoading && !selectedTemplate ? (
                            <div className="p-6 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                                <p className="mt-2 text-gray-500">Loading...</p>
                            </div>
                        ) : (
                            renderTemplateList()
                        )}
                    </div>

                    {/* 右侧模板详情/编辑 */}
                    <div className="w-full lg:w-2/3 min-h-[600px]">
                        {isLoading && selectedTemplate ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                                <p className="ml-2 text-gray-500">Loading template content...</p>
                            </div>
                        ) : (
                            renderTemplateDetails()
                        )}
                    </div>
                </div>
            </div>

            {/* 删除确认对话框 */}
            {isDeleteDialogOpen && templateToDelete && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4 text-red-600">
                            <AlertCircle className="w-6 h-6 mr-2" />
                            <h3 className="text-lg font-medium">Confirm Delete</h3>
                        </div>

                        <p className="mb-4">
                            Are you sure you want to delete the template <strong>&ldquo;{templateToDelete.name}&rdquo;</strong>? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                onClick={cancelDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplatesPageContent; 