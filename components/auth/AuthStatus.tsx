'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { User, Heart } from 'lucide-react';
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

    // 移动端菜单保持不变
    if (isMobileMenu) {
        if (status === 'unauthenticated' || !session?.user) {
            return (
                <div className="w-full py-2">
                    <div className="flex flex-col space-y-2 w-full">
                        <Link
                            href="/auth/signin"
                            className="flex items-center justify-start px-3 py-2.5 text-gray-700 bg-gradient-to-r from-[#16A085]/90 to-[#138D75]  font-medium rounded-lg transition-colors hover:bg-gray-100 w-full text-left"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="flex items-center justify-start px-3 py-2.5 text-gray-700 bg-white font-medium rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors w-full text-left"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Sign Up
                        </Link>
                    </div>
                </div>
            );
        }

        const user: User = session.user;

        return (
            <div className="w-full">
                <div className="flex items-center mb-3 px-1">
                    {user.image ? (
                        <div className="relative flex-shrink-0">
                            <Image
                                src={user.image}
                                alt={`${user.name || 'User'}'s avatar`}
                                className="rounded-full object-cover border border-gray-200"
                                width={40}
                                height={40}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 rounded-full border border-white" />
                        </div>
                    ) : (
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-semibold flex items-center justify-center">
                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 rounded-full border border-white" />
                        </div>
                    )}
                    <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-800">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>

                <div className="flex flex-col space-y-1">
                    <Link
                        href="/favorites"
                        className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        My Favorites
                    </Link>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-3 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    // 桌面端新设计 - 使用图标代替按钮
    if (status === 'unauthenticated' || !session?.user) {
        return (
            <div className="flex items-center gap-2">
                {/* 心愿单图标 */}
                <Link
                    href="/favorites"
                    className="relative group"
                >
                    <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                        <Heart size={20} className="text-gray-500 group-hover:text-[#F39C12] transition-colors" />
                    </div>
                </Link>

                {/* 用户登录/注册下拉菜单 */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                    >
                        <User size={20} className="text-gray-500" />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100"
                            >
                                <Link
                                    href="/auth/signin"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Sign Up
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // 已登录用户的桌面端显示
    const user: User = session.user;

    return (
        <div className="flex items-center gap-2">
            {/* 心愿单图标 */}
            <Link
                href="/favorites"
                className="relative group"
            >
                <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <Heart size={20} className="text-gray-500 group-hover:text-[#F39C12] transition-colors" />
                </div>
            </Link>

            {/* 已登录用户下拉菜单 */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={toggleDropdown}
                    className="flex items-center focus:outline-none group"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                >
                    {user.image ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors">
                            <Image
                                src={user.image}
                                alt={`${user.name || '用户'}'s avatar`}
                                className="rounded-full object-cover"
                                fill
                                sizes="36px"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 rounded-full border border-white" />
                        </div>
                    ) : (
                        <div className="relative w-9 h-9">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-semibold border-2 border-transparent hover:border-gray-200 transition-colors flex items-center justify-center">
                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-400 rounded-full border border-white" />
                        </div>
                    )}
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden"
                        >
                            <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
                                <p className="font-medium text-gray-800">{user.name || '用户'}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                            </div>
                            <div className="px-2 py-1">
                                <Link
                                    href="/favorites"
                                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <div className="w-7 h-7 mr-2 flex items-center justify-center rounded-full bg-red-50 text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    My Favorites
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-1"
                                >
                                    <div className="w-7 h-7 mr-2 flex items-center justify-center rounded-full bg-blue-50 text-blue-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>
    );
} 