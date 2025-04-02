'use client';

import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

import { UserRole } from '@/lib/models/UserRole';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();
    const scrollPosition = useRef(0);

    // Responsive handling
    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;

            setIsMobile(newIsMobile);
            // 宽屏设备默认展开，窄屏设备默认收起
            if (newIsMobile !== isMobile) {
                setIsSidebarOpen(window.innerWidth >= 1024);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // 实现更强大的滚动锁定
    useEffect(() => {
        if (isMobile && isSidebarOpen) {
            // 保存当前滚动位置
            scrollPosition.current = window.scrollY;

            // 锁定滚动 - 设置固定位置并隐藏溢出内容
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPosition.current}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // 恢复滚动
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            // 恢复滚动位置
            if (scrollPosition.current > 0) {
                window.scrollTo(0, scrollPosition.current);
            }
        }

        return () => {
            // 组件卸载时恢复滚动能力
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            // 恢复滚动位置
            if (scrollPosition.current > 0) {
                window.scrollTo(0, scrollPosition.current);
            }
        };
    }, [isMobile, isSidebarOpen]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Users', href: '/dashboard/users', icon: '👥' },
        { name: 'Products', href: '/dashboard/products', icon: '📦' },
    ];

    if (!session?.user || !session.user.role ||
        (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
        return <div className="p-4">No access to dashboard</div>;
    }

    const closeSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* 移动端背景遮罩 - 添加毛玻璃效果并修复定位 */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={closeSidebar}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            closeSidebar();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                />
            )}

            {/* 侧边栏 - 修复移动端定位和过渡效果 */}
            <aside
                className={`fixed md:sticky top-0 left-0 z-50
                    ${isSidebarOpen ? 'w-64' : isMobile ? '0' : 'w-20'} 
                    ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                    transition-all duration-300 ease-in-out h-screen`}
            >
                <div className="flex flex-col h-full bg-white shadow-lg">
                    {/* 侧边栏头部 */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white flex-shrink-0">
                        <div className={`font-bold text-blue-600 text-xl transition-opacity duration-200 
                            ${(!isSidebarOpen && !isMobile) ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
                            OOHUNT
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                            aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                        >
                            {isSidebarOpen
                                ? <ChevronLeft size={20} />
                                : <ChevronRight size={20} />
                            }
                        </button>
                    </div>

                    {/* 导航菜单 */}
                    <div className="flex-grow overflow-y-auto">
                        <nav className="px-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-4 py-2.5 mt-1 first:mt-1.5 rounded-lg group
                                    ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}
                                    transition-all duration-200`}
                                    onClick={isMobile ? closeSidebar : undefined}
                                >
                                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                                    <span className={`ml-3 transition-all duration-200 whitespace-nowrap
                                        ${(!isSidebarOpen && !isMobile) ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                                        {item.name}
                                    </span>
                                    {!isSidebarOpen && !isMobile && (
                                        <div className="absolute left-16 z-50 whitespace-nowrap bg-gray-800 text-white px-2 py-1 rounded 
                                            ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 底部用户信息 */}
                    <div className={`mt-auto border-t border-gray-200 p-4 ${(!isSidebarOpen && !isMobile) ? 'hidden' : 'block'}`}>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                {session.user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium truncate">{session.user.name || session.user.email}</p>
                                <p className="text-xs text-gray-500">{session.user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 主内容区域 */}
            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isMobile && isSidebarOpen ? 'opacity-50' : 'opacity-100'}`}
                style={{
                    marginLeft: isMobile ? 0 : 0
                }}
            >
                {/* 顶部导航栏 */}
                <header className="bg-white shadow-sm z-20 flex-shrink-0">
                    <div className="flex h-16 items-center justify-between px-4 md:px-6">
                        <div className="flex items-center">
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 mr-2 text-gray-600"
                                    aria-label="Open Menu"
                                >
                                    <Menu size={20} />
                                </button>
                            )}
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">
                                    {session.user.name || session.user.email}
                                </span>
                                <span className="hidden md:inline px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                                    {session.user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 面包屑导航 */}
                    <div className="px-4 md:px-6 py-2 text-sm text-gray-600 border-t border-gray-100">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span>{navigation.find(item => item.href === pathname)?.name || 'Dashboard'}</span>
                    </div>
                </header>

                {/* 内容区域 */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="w-full">
                        {children}
                    </div>
                </main>

                {/* 页脚 */}
                <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500 flex-shrink-0">
                    <p>© {new Date().getFullYear()} OOHUNT Admin Dashboard. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;