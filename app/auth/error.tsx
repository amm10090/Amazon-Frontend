'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// 定义错误消息映射
const errorMessages: Record<string, string> = {
    Configuration: "服务器配置错误，请联系管理员",
    AccessDenied: "访问被拒绝，您可能没有足够的权限或登录过程出现错误",
    Verification: "登录链接已过期或已被使用",
    CredentialsSignin: "用户名或密码无效",
    Default: "身份验证过程中发生错误",

    // 添加针对MongoDB连接错误的特殊消息
    DatabaseConnection: "数据库连接错误，开发环境下您仍可登录",

    // 添加针对Google登录错误的特殊消息
    GoogleOAuthError: "Google登录过程出错，请稍后再试"
};

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [errorDesc, setErrorDesc] = useState<string>("");
    const [redirectCount, setRedirectCount] = useState(0);

    useEffect(() => {

        // 检查重定向计数器，防止无限循环
        const count = searchParams?.get("redirectCount");

        if (count) {
            setRedirectCount(parseInt(count, 10));
            // 如果重定向次数过多，自动转到主页
            if (parseInt(count, 10) > 10) {
                router.push("/");

                return;
            }
        }

        // 从 URL 中获取错误信息
        const errorType = searchParams?.get("error") || "Default";
        const errorDescParam = searchParams?.get("error_description");

        setError(errorType);

        if (errorDescParam) {
            setErrorDesc(decodeURIComponent(errorDescParam));
        } else {
            // 根据错误类型显示相应消息
            setErrorDesc(errorMessages[errorType] || errorMessages.Default);

            // 如果是AccessDenied错误，并且在开发环境，添加更多提示
            if (errorType === "AccessDenied" && process.env.NODE_ENV === "development") {
                setErrorDesc(prev => `${prev}\n\n开发环境下，可能是MongoDB连接失败导致的。请检查数据库配置。`);
            }
        }
    }, [searchParams, router]);

    // 处理返回主页按钮
    const handleReturnHome = () => {
        router.push("/");
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-red-600">
                        身份验证错误
                    </h2>
                    <p className="mt-2 text-center text-lg whitespace-pre-line">
                        {error ? errorDesc : "加载中..."}
                    </p>
                    {redirectCount > 0 && (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            检测到重定向次数: {redirectCount} 次
                        </p>
                    )}
                </div>
                <div className="flex justify-center space-x-4">
                    <Link
                        href="/auth/signin"
                        className="rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        返回登录
                    </Link>
                    <button
                        onClick={handleReturnHome}
                        className="rounded-md bg-gray-600 py-2 px-4 text-sm font-semibold text-white hover:bg-gray-500"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        </div>
    );
} 