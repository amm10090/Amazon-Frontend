'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { UserRole, isSuperAdmin } from '@/lib/models/UserRole';
import type { UserItem } from '@/types/api';

export function UserDetailPageContent({ userId }: { userId: string }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState<UserItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/users/${userId}`);

                if (!response.ok) {
                    throw new Error(`获取用户详情失败: ${response.statusText}`);
                }

                const data = await response.json();

                // 直接使用返回的数据，因为API直接返回用户对象
                setUser(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '获取用户数据出错');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    const handleDeleteUser = async () => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // 尝试解析JSON响应
                const errorData = await response.json().catch(() => null);

                // 提取错误信息
                let errorMsg = `删除用户失败: ${response.status} ${response.statusText}`;

                if (errorData && errorData.error) {
                    errorMsg = errorData.error;
                    if (errorData.details) {
                        errorMsg += `: ${errorData.details}`;
                    }
                }

                throw new Error(errorMsg);
            }

            // 删除成功后返回用户列表页
            router.push('/dashboard/users');
        } catch (err) {
            setError(err instanceof Error ? err.message : '删除用户出错');
        }
    };

    const handleRoleChange = async (newRole: UserRole) => {
        try {
            const response = await fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error(`更新用户角色失败: ${response.statusText}`);
            }

            // 更新本地用户数据
            setUser(prev => prev ? { ...prev, role: newRole } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新用户角色出错');
        }
    };

    const canModifyRole = session?.user?.role === UserRole.SUPER_ADMIN;
    const canDeleteUser = isSuperAdmin(session?.user?.role as UserRole) ||
        (session?.user?.role === UserRole.ADMIN && user?.role === UserRole.USER);
    const isSelf = session?.user?.id === userId;

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="h-64 bg-gray-200 rounded w-full" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                <p>{error || 'User not found'}</p>
                <Link href="/dashboard/users" className="text-blue-600 underline mt-2 inline-block">
                    Back to Users List
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Users Detail</h1>
                <Link
                    href="/dashboard/users"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Back to Users List
                </Link>
            </div>

            {/* 用户基本信息卡片 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-semibold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            {user.provider === 'google' && (
                                <FaGoogle className="ml-2 text-red-500" title="Google account" />
                            )}
                        </div>
                        <p className="text-gray-600">{user.email}</p>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                ${user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                                    user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'}`}>
                                {user.role === UserRole.SUPER_ADMIN ? 'Super Admin' :
                                    user.role === UserRole.ADMIN ? 'Admin' : 'User'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Registration Time</p>
                        <p className="font-medium">{new Date(user.createdAt).toLocaleString('en-US')}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="font-medium">
                            {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                })
                                : 'Never logged in'
                            }
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">User Role</p>
                        <p className="font-medium">{user.role}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Account Status</p>
                        <p className="font-medium">{user.status === 'active' ? 'Active' : user.status === 'inactive' ? 'Inactive' : 'Disabled'}</p>
                    </div>
                    {user.provider && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Authentication Provider</p>
                            <p className="font-medium flex items-center">
                                {user.provider === 'google' ? (
                                    <>
                                        <FaGoogle className="mr-1 text-red-500" />
                                        Google
                                    </>
                                ) : user.provider === 'credentials' ? 'Password' : user.provider}
                            </p>
                        </div>
                    )}
                </div>

                {/* 用户操作区 */}
                <div className="border-t pt-4 flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-2">
                    {canModifyRole && !isSelf && (
                        <div className="flex items-center space-x-2">
                            <label htmlFor="role-select" className="text-sm font-medium text-gray-700">
                                Change Role:
                            </label>
                            <select
                                id="role-select"
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                value={user.role}
                                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                            >
                                <option value={UserRole.USER}>User</option>
                                <option value={UserRole.ADMIN}>Admin</option>
                                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                            </select>
                        </div>
                    )}

                    {canDeleteUser && !isSelf && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ml-auto md:ml-0"
                        >
                            Delete User
                        </button>
                    )}
                </div>
            </div>

            {/* 删除确认弹窗 */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete User</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete user <span className="font-semibold">{user.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                                onClick={handleDeleteUser}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 