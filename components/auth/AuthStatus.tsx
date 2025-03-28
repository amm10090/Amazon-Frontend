'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface AuthStatusProps {
    isMobileMenu?: boolean;
}

export default function AuthStatus({ isMobileMenu = false }: AuthStatusProps) {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 关闭下拉菜单的点击外部监听器
    useEffect(() => {
        // 只有在非移动菜单模式下才需要点击外部关闭
        if (isMobileMenu) return;

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        // 添加事件监听器
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            // 移除事件监听器
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenu]);

    const handleSignOut = async () => {
        try {
            // 关闭下拉菜单
            setIsDropdownOpen(false);

            // 直接调用signOut并指定回调URL
            await signOut({
                redirect: true,
                callbackUrl: '/'
            });
        } catch {
            setError("退出失败，请重试");
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (status === 'loading') {
        return (
            <div className="animate-pulse flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="h-4 w-20 bg-gray-200 rounded ml-2" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-500">
                {error} <button onClick={() => window.location.reload()} className="text-blue-500 underline">重试</button>
            </div>
        );
    }

    if (status === 'unauthenticated' || !session?.user) {
        // 根据是否为移动菜单显示不同的登录/注册按钮
        if (isMobileMenu) {
            return (
                <div className="w-full flex flex-col space-y-3 py-4">
                    <Link
                        href="/auth/signin"
                        className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-[#16A085]/90 to-[#138D75] text-white font-medium rounded-xl transition-all duration-200 hover:shadow-md group"
                    >
                        <div className="flex items-center">
                            <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-lg bg-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <span>Sign In</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="flex items-center justify-between w-full px-4 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all duration-200 group"
                    >
                        <div className="flex items-center">
                            <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-lg bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <span>Sign Up</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            );
        }

        return (
            <div className="flex gap-3 items-center">
                <Link
                    href="/auth/signin"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-[#16A085] px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:bg-[#138D75] active:scale-95"
                >
                    <span className="relative flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In
                    </span>
                </Link>
                <Link
                    href="/auth/signup"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 ease-out hover:bg-gray-50 active:scale-95 border border-gray-200"
                >
                    <span className="relative flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Sign Up
                    </span>
                </Link>
            </div>
        );
    }

    const user: User = session.user;

    // 在移动菜单中呈现简化版本的已登录用户菜单
    if (isMobileMenu) {
        return (
            <div className="w-full flex flex-col space-y-2 py-3">
                <div className="flex items-center px-4 py-3 bg-blue-50/70 rounded-xl mb-2">
                    {user.image ? (
                        <div className="relative">
                            <Image
                                src={user.image}
                                alt={`${user.name || '用户'}'s avatar`}
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                                width={40}
                                height={40}
                            />
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white" />
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold text-lg shadow-sm">
                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white" />
                        </div>
                    )}
                    <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-800">{user.name || '用户'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                <div className="w-full px-2 py-1 space-y-2">
                    <Link
                        href="/favorites"
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50/50 rounded-xl transition-all duration-200 group"
                    >
                        <div className="w-9 h-9 mr-3 flex items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">My Favorites</p>
                            <p className="text-xs text-gray-500">View your saved items</p>
                        </div>
                    </Link>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50/50 rounded-xl transition-all duration-200 group"
                    >
                        <div className="w-9 h-9 mr-3 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Sign Out</p>
                            <p className="text-xs text-gray-500">Log out of your account</p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // 优化常规下拉菜单显示
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none group"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
            >
                {user.image ? (
                    <div className="relative">
                        <Image
                            src={user.image}
                            alt={`${user.name || '用户'}'s avatar`}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200 group-hover:border-primary transition-colors"
                            width={32}
                            height={32}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border border-white" />
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-semibold group-hover:shadow-md transition-shadow">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border border-white" />
                    </div>
                )}
                <span className="text-sm font-medium hidden sm:inline-block group-hover:text-primary transition-colors">{user.name || user.email || '用户'}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 hidden sm:block text-gray-400 group-hover:text-primary transition-colors transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'} duration-300`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
                            <p className="font-medium text-gray-800">{user.name || '用户'}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        </div>
                        <div className="px-2 py-2">
                            <Link
                                href="/favorites"
                                className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-lg bg-red-50 text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                My Favorites
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-1"
                            >
                                <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 