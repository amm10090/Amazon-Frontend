'use client';

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

export default function AuthStatus() {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 关闭下拉菜单的点击外部监听器
    useEffect(() => {
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
    }, []);

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
        return (
            <div className="flex gap-2">
                <Link
                    href="/auth/signin"
                    className="bg-[#16A085] text-white font-medium hover:bg-[#138D75] transition-colors px-4 py-1.5 rounded-lg text-sm"
                >
                    Sign In
                </Link>
                <Link
                    href="/auth/signup"
                    className="bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors px-4 py-1.5 rounded-lg text-sm"
                >
                    Sign Up
                </Link>
            </div>
        );
    }

    const user: User = session.user;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 focus:outline-none"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
            >
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={`${user.name || '用户'}的头像`}
                        className="h-8 w-8 rounded-full object-cover"
                        width={32}
                        height={32}
                    />
                ) : (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                )}
                <span className="text-sm font-medium hidden sm:inline-block">{user.name || user.email || '用户'}</span>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user.name || '用户'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        My Favorites
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
} 