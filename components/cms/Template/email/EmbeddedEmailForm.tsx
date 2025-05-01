'use client';

import { Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

// 定义组件的属性接口
interface EmbeddedEmailFormProps {
    formTitle: string;
    formDescription: string;
    inputPlaceholder: string;
    submitButtonText: string;
    sourceType: 'general' | 'blog';
    formId: string;
    style?: 'default' | 'compact' | 'blog' | 'deals';
}

/**
 * 前端渲染的电子邮件收集表单组件
 * 用于在实际内容页面中显示和处理电子邮件订阅
 */
export const EmbeddedEmailForm: React.FC<EmbeddedEmailFormProps> = ({
    formTitle,
    formDescription,
    inputPlaceholder,
    submitButtonText,
    sourceType,
    formId,
    style = 'default',
}) => {
    // 组件状态
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [acceptTerms, setAcceptTerms] = useState(false);

    // 电子邮件验证
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);
    };

    // 表单提交处理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 清除之前的状态
        setStatus({ type: null, message: '' });

        // 验证邮箱格式
        if (!validateEmail(email)) {
            setStatus({
                type: 'error',
                message: 'Please enter a valid email address',
            });

            return;
        }

        // 验证条款接受
        if (!acceptTerms) {
            setStatus({
                type: 'error',
                message: 'Please agree to the email subscription terms and privacy policy',
            });

            return;
        }

        setIsSubmitting(true);

        try {
            // 调用API提交邮箱 - 使用与contact-us页面相同的端点
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Newsletter Subscriber', // 默认名称
                    email,
                    subject: 'Newsletter Subscription',
                    message: `Email subscription from ${sourceType} form (ID: ${formId})`,
                    formSource: sourceType, // 添加来源字段来区分
                    formId: formId,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // 成功处理
                setStatus({
                    type: 'success',
                    message: result.message || 'Subscription successful!',
                });
                setEmail(''); // 清除输入
            } else {
                // 错误处理
                setStatus({
                    type: 'error',
                    message: result.message || 'Subscription failed, please try again later',
                });
            }
        } catch {
            // 捕获网络错误等
            setStatus({
                type: 'error',
                message: 'An error occurred, please try again later',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Deals 风格表单 - 更加紧凑且没有图标
    if (style === 'deals') {
        return (
            <div
                className="email-collection-form-wrapper mb-8"
                data-type="email-collection-form"
                data-form-id={formId}
                data-source-type={sourceType}
                data-style={style}
            >
                <div className="bg-[#2E71A6] rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-7">
                        {/* 表单标题和说明 */}
                        <div className="mb-4 text-center">
                            <h2 className="text-xl font-bold text-[#FFFFFF] mb-2">
                                {formTitle || 'Subscribe to Our Deals Newsletter'}
                            </h2>
                            <p className="text-white/90 max-w-md mx-auto">
                                {formDescription || "Get the latest deals first-hand, don't miss any money-saving opportunity"}
                            </p>
                        </div>

                        {/* 表单内容 */}
                        <form onSubmit={handleSubmit} className="w-full mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={inputPlaceholder}
                                    className="w-full py-3 px-4 rounded-md text-gray-800
                                        focus:outline-none border-0 shadow-sm bg-white"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    className="py-3 px-6 bg-[#4DB6AC] hover:bg-[#3EA99E] text-white font-semibold
                                    rounded-md transition-colors sm:min-w-[140px] flex-shrink-0"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Subscribing...' : submitButtonText}
                                </button>
                            </div>

                            {/* 条款同意复选框 */}
                            <div>
                                <label className="flex items-start gap-2 text-sm text-white/90 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded"
                                    />
                                    <span>
                                        I agree to receive email communications from Oohunt as described in the <a href="/email-subscription-terms" className="text-[#4DB6AC] hover:underline" target="_blank" rel="noopener noreferrer">Email Subscription Terms</a> & <a href="/privacy-policy" className="text-[#4DB6AC] hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            {/* 状态消息 */}
                            {status.type === 'error' && (
                                <div className="mt-3 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-md text-red-300 text-sm">
                                    {status.message}
                                </div>
                            )}

                            {status.type === 'success' && (
                                <div className="mt-3 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-md 
                                text-green-300 text-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span>{status.message}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 博客风格的表单
    if (style === 'blog') {
        return (
            <div
                className="email-collection-form-wrapper mb-8"
                data-type="email-collection-form"
                data-form-id={formId}
                data-source-type={sourceType}
                data-style={style}
            >
                <div className="bg-gradient-to-r from-[#3282B7] to-[#1C567B] rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-7 relative z-10">
                        {/* 表单标题 */}
                        <div className="mb-5 text-center">
                            <h2 className="text-xl font-bold text-white flex items-center justify-center mb-2">
                                <Mail className="w-[30px] h-[30px] text-[#FFC107] mr-2.5" strokeWidth={1.5} />
                                <span className="text-[#FFFFFF]">{formTitle}</span>
                            </h2>
                            <p className="text-white/90 max-w-md mx-auto">
                                {formDescription}
                            </p>
                        </div>

                        {/* 表单内容 */}
                        <form onSubmit={handleSubmit} className="w-full mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-grow relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none">
                                        <Mail className="h-[20px] w-[20px] text-gray-500" strokeWidth={2} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={inputPlaceholder}
                                        className={`w-full pl-11 pr-4 py-3.5 rounded-md text-gray-800
                                        focus:outline-none border-0 focus:ring-2 focus:ring-[#FFC107]/30
                                        transition-all duration-200 shadow-sm bg-white`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="py-3.5 px-6 bg-[#16A085] hover:bg-[#117A65] text-white font-semibold
                                    rounded-md transition-all duration-200 hover:-translate-y-0.5
                                    flex items-center justify-center whitespace-nowrap min-w-[120px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Subscribing...' : submitButtonText}
                                </button>
                            </div>

                            {/* 条款同意复选框 */}
                            <div className="mt-4">
                                <label className="flex items-start gap-2.5 text-sm text-white/90 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded"
                                    />
                                    <span>
                                        I agree to receive emails as per <a href="/email-subscription-terms" className="text-[#FFC107] hover:underline" target="_blank" rel="noopener noreferrer">Email Subscription Terms</a> and <a href="/privacy-policy" className="text-[#FFC107] hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                                    </span>
                                </label>
                            </div>

                            {/* 状态消息 */}
                            {status.type === 'error' && (
                                <div className="mt-4 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-md text-red-400 text-sm">
                                    {status.message}
                                </div>
                            )}

                            {status.type === 'success' && (
                                <div className="mt-4 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-md 
                                text-green-400 text-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span>{status.message}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 紧凑风格的表单
    if (style === 'compact') {
        return (
            <div
                className="email-collection-form-wrapper mb-8"
                data-type="email-collection-form"
                data-form-id={formId}
                data-source-type={sourceType}
                data-style={style}
            >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="px-5 py-6">
                        {/* 表单标题 */}
                        <div className="mb-4 text-center">
                            <h3 className="text-lg font-medium text-gray-800">{formTitle}</h3>
                            <p className="text-gray-600 text-sm mt-1">{formDescription}</p>
                        </div>

                        {/* 表单内容 */}
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-grow relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-0 pl-3 pointer-events-none">
                                        <Mail className="h-[16px] w-[16px] text-gray-400 pt" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={inputPlaceholder}
                                        className={`w-full pl-10 pr-3 py-2 rounded-md border ${status.type === 'error'
                                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            } shadow-sm transition-colors`}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`py-2 px-4 ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                        } text-white font-medium rounded-md transition-colors flex items-center justify-center whitespace-nowrap`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Subscribing...' : submitButtonText}
                                </button>
                            </div>

                            {/* 条款同意复选框 */}
                            <div className="mt-3">
                                <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>
                                        I agree to receive emails as per <a href="/email-subscription-terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms</a> and <a href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                                    </span>
                                </label>
                            </div>

                            {/* 状态消息 */}
                            {status.type === 'error' && (
                                <div className="mt-3 text-sm text-red-600">
                                    {status.message}
                                </div>
                            )}

                            {status.type === 'success' && (
                                <div className="mt-3 text-sm text-green-600 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                    <span>{status.message}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 默认风格 - 完整版带渐变背景
    return (
        <div
            className="email-collection-form-wrapper mb-8"
            data-type="email-collection-form"
            data-form-id={formId}
            data-source-type={sourceType}
            data-style={style}
        >
            <div className="bg-gradient-to-br from-[#1A5276] to-[#154360] rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8 relative z-10">
                    {/* 表单标题 */}
                    <div className="mb-4 text-center">
                        <div className="inline-flex items-center justify-center mb-2">
                            <Mail className="w-6 h-6 text-[#FFC107] mr-2" strokeWidth={1.5} />
                            <h3 className="text-xl font-bold text-[#FFFFFF]">{formTitle}</h3>
                        </div>
                        <p className="text-white/90 max-w-md mx-auto">
                            {formDescription}
                        </p>
                    </div>

                    {/* 表单内容 */}
                    <form onSubmit={handleSubmit} className="w-full mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-grow relative">
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 pl-3 pointer-events-none">
                                    <Mail className="h-[20px] w-[20px] text-gray-500 flex-shrink-0 translate-y-[1px]" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={inputPlaceholder}
                                    className={`w-full pl-11 pr-4 py-3 rounded-lg bg-white text-gray-800 
                                    focus:outline-none focus:ring-2 border border-transparent
                                    ${status.type === 'error'
                                            ? 'focus:ring-red-400 border-red-400/50'
                                            : 'focus:ring-[#FFC107] focus:border-[#FFC107]/30'
                                        } transition-all duration-200 shadow-sm`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`py-3 px-6 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#16A085] hover:bg-[#117A65] cursor-pointer'} text-white font-medium
                                rounded-lg transition-all duration-200 shadow-sm hover:shadow
                                flex items-center justify-center whitespace-nowrap`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Subscribing...' : submitButtonText}
                            </button>
                        </div>

                        {/* 条款同意复选框 */}
                        <div className="mt-3 mx-auto">
                            <label className="flex items-start gap-2 text-sm text-white/80 cursor-pointer text-left">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#FFC107] focus:ring-[#FFC107]"
                                />
                                <span>
                                    I agree to receive emails as per <a href="/email-subscription-terms" className="text-[#FFC107] hover:underline" target="_blank" rel="noopener noreferrer">Terms</a> and <a href="/privacy-policy" className="text-[#FFC107] hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                                </span>
                            </label>
                        </div>

                        {/* 状态消息 */}
                        {status.type === 'error' && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg text-red-400 text-sm">
                                {status.message}
                            </div>
                        )}

                        {status.type === 'success' && (
                            <div className="mt-4 bg-green-500/10 border border-green-500/20 px-4 py-3 rounded-lg 
                            text-green-400 text-sm flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span>{status.message}</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmbeddedEmailForm; 