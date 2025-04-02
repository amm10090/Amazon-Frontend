'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

import { UserRole } from '@/lib/models/UserRole';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();

    // Responsive handling
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsSidebarOpen(window.innerWidth >= 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: '📊' },
        { name: 'Users', href: '/dashboard/users', icon: '👥' },
        { name: 'Products', href: '/dashboard/products', icon: '📦' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
        { name: 'System Settings', href: '/dashboard/settings', icon: '⚙️' },
    ];

    if (!session?.user || !session.user.role ||
        (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
        return <div className="p-4">No access to dashboard</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Mobile overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsSidebarOpen(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setIsSidebarOpen(false);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed md:relative z-40 flex-shrink-0 transition-all duration-300 ease-in-out h-full
                    ${isSidebarOpen ? 'w-64' : isMobile ? '0' : 'w-20'} 
                    ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}
            >
                <div className="flex flex-col h-full bg-white shadow-lg">
                    {/* Sidebar header */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <div className={`font-bold text-blue-600 text-xl transition-opacity duration-200 
                            ${(!isSidebarOpen && !isMobile) ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
                            OOHUNT
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                        >
                            {isSidebarOpen ? '◀️' : '▶️'}
                        </button>
                    </div>

                    {/* Navigation menu */}
                    <div className="flex-grow overflow-y-auto">
                        <nav className="mt-2 px-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 my-1 rounded-lg group
                                    ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}
                                    transition-all duration-200`}
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

                    {/* User info at bottom */}
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
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top navigation bar */}
                <header className="bg-white shadow-sm z-20 flex-shrink-0">
                    <div className="flex h-16 items-center justify-between px-4 md:px-6">
                        <div className="flex items-center">
                            {isMobile && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 mr-2"
                                    aria-label="Open Menu"
                                >
                                    ☰
                                </button>
                            )}
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center space-x-4">
                                <Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                                <Link href="/dashboard/products" className="text-gray-600 hover:text-blue-600">All Products</Link>
                                <Link href="/dashboard/settings" className="text-gray-600 hover:text-blue-600">Settings</Link>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="hidden md:inline px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                                    {session.user.role}
                                </span>
                                <span className="text-sm text-gray-600 font-medium">
                                    {session.user.name || session.user.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breadcrumb navigation */}
                    <div className="px-4 md:px-6 py-2 text-sm text-gray-600 border-t border-gray-100">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span>{navigation.find(item => item.href === pathname)?.name || 'Dashboard'}</span>
                    </div>
                </header>

                {/* Content area */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <div className="container mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500 flex-shrink-0">
                    <p>© {new Date().getFullYear()} OOHUNT Admin Dashboard. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;