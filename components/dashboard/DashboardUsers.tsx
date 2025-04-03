'use client';

import { addToast } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { useUserList } from '@/lib/hooks';
import { UserRole, isSuperAdmin } from '@/lib/models/UserRole';
import type { UserItem } from '@/types/api';

interface UserFilterProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    roleFilter: string;
    setRoleFilter: (value: string) => void;
}

// 用户筛选组件
const UserFilter: React.FC<UserFilterProps> = ({
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
                    <input
                        type="text"
                        id="search"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                    <select
                        id="role-filter"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value={UserRole.USER}>User</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                    </select>
                </div>
                <div className="w-full md:w-auto flex items-end">
                    <button
                        className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => {
                            setSearchTerm('');
                            setRoleFilter('');
                        }}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UserActionsProps {
    user: UserItem;
    currentUserRole: UserRole;
    currentUserId?: string;
    onUpdateRole: (userId: string, newRole: UserRole) => void;
    onDeleteUser: (userId: string) => void;
}

// User actions component
const UserActions: React.FC<UserActionsProps> = ({
    user,
    currentUserRole,
    currentUserId,
    onUpdateRole,
    onDeleteUser
}) => {
    const isSelf = user.id === currentUserId;

    // 修改权限检查逻辑
    // 只有超级管理员可以修改角色，或者管理员可以修改普通用户的角色
    const canUpdateRole = (isSuperAdmin(currentUserRole) ||
        (currentUserRole === UserRole.ADMIN && user.role === UserRole.USER)) && !isSelf;

    // 禁止管理员删除超级管理员，管理员只能删除普通用户
    const canDelete = (isSuperAdmin(currentUserRole) ||
        (currentUserRole === UserRole.ADMIN && user.role === UserRole.USER)) && !isSelf;

    return (
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Link
                href={`/dashboard/users/${user.id}`}
                className="text-blue-600 hover:text-blue-900 text-center px-2 py-1"
            >
                View
            </Link>
            {canUpdateRole && (
                <button
                    onClick={() => {
                        const newRole = user.role === UserRole.USER
                            ? UserRole.ADMIN
                            : UserRole.USER;

                        onUpdateRole(user.id, newRole);
                    }}
                    className="text-blue-600 hover:text-blue-900 text-center px-2 py-1"
                >
                    Change Role
                </button>
            )}
            {canDelete && (
                <button
                    onClick={() => onDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 text-center px-2 py-1"
                >
                    Delete
                </button>
            )}
        </div>
    );
};

const DashboardUsers: React.FC = () => {
    const { data: userList = [], isLoading, isError, mutate = () => { } } = useUserList();
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 用户角色更新
    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        // 检查是否正在修改自己的角色
        if (userId === session?.user?.id) {
            addToast({
                title: "Action Not Allowed",
                description: "You cannot change your own role.",
                color: "warning",
                timeout: 5000,
            });

            return;
        }

        // 获取用户角色信息
        const targetUser = userList.find(user => user.id === userId);

        // 检查权限: 普通管理员不能修改超级管理员或其他管理员的角色
        if (targetUser &&
            session?.user?.role === UserRole.ADMIN &&
            (targetUser.role === UserRole.SUPER_ADMIN || targetUser.role === UserRole.ADMIN)) {
            addToast({
                title: "Permission Denied",
                description: "You don't have permission to change this user's role.",
                color: "danger",
                timeout: 5000,
            });

            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                throw new Error(errorData?.error || '更新用户角色失败');
            }

            // 添加成功吐司提示
            addToast({
                title: "Role Updated",
                description: `User role has been changed to ${newRole}.`,
                color: "success",
                timeout: 5000,
            });

            mutate(); // 刷新用户列表
        } catch (error) {
            // 添加错误吐司提示
            addToast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to update user role',
                color: "danger",
                timeout: 8000,
            });

        }
    };

    // 用户删除
    const handleDeleteUser = (userId: string) => {
        // 检查是否尝试删除自己
        if (userId === session?.user?.id) {
            addToast({
                title: "Action Not Allowed",
                description: "You cannot delete your own account.",
                color: "warning",
                timeout: 5000,
            });

            return;
        }

        // 获取用户角色信息
        const targetUser = userList.find(user => user.id === userId);

        // 检查权限: 普通管理员不能删除超级管理员或其他管理员
        if (targetUser &&
            session?.user?.role === UserRole.ADMIN &&
            (targetUser.role === UserRole.SUPER_ADMIN || targetUser.role === UserRole.ADMIN)) {
            addToast({
                title: "Permission Denied",
                description: "You don't have permission to delete this user.",
                color: "danger",
                timeout: 5000,
            });

            return;
        }

        setConfirmDelete(userId);
    };

    const confirmUserDelete = async () => {
        if (!confirmDelete) return;
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/users/${confirmDelete}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || '删除用户失败');

                // 添加删除失败吐司提示
                addToast({
                    title: "Error",
                    description: data.error || 'Failed to delete user',
                    color: "danger",
                    timeout: 8000,
                });

                return;
            }

            // 添加删除成功吐司提示
            addToast({
                title: "User Deleted",
                description: "The user has been successfully deleted.",
                color: "success",
                timeout: 5000,
            });

            setConfirmDelete(null);
            mutate(); // 刷新用户列表
        } catch {
            setErrorMessage('删除用户失败，请检查网络连接');

            // 添加错误吐司提示
            addToast({
                title: "Error",
                description: 'Failed to delete user. Please check your network connection.',
                color: "danger",
                timeout: 8000,
            });
        }
    };

    // 根据搜索和筛选条件过滤用户
    const filteredUsers = userList.filter((user: UserItem) => {
        const matchesSearch = searchTerm === '' ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === '' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    // 在渲染移动设备列表时使用
    const checkCanUpdateRole = (user: UserItem) => {
        if (user.id === session?.user?.id) return false;

        // 只有超级管理员可以修改任何用户角色
        // 普通管理员只能修改普通用户角色
        return isSuperAdmin(session?.user?.role as UserRole) ||
            (session?.user?.role === UserRole.ADMIN && user.role === UserRole.USER);
    };

    const checkCanDelete = (user: UserItem) => {
        if (user.id === session?.user?.id) return false;

        // 超级管理员可以删除任何用户
        // 普通管理员只能删除普通用户
        return isSuperAdmin(session?.user?.role as UserRole) ||
            (session?.user?.role === UserRole.ADMIN && user.role === UserRole.USER);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-full mb-4" />
                        <div className="h-64 bg-gray-200 rounded w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-6 max-w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 text-red-600">
                    加载用户数据失败，请稍后重试。
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
                <div className="text-sm text-gray-500">
                    {userList.length} registered {userList.length === 1 ? 'user' : 'users'}
                </div>
            </div>

            {/* 筛选组件 */}
            <UserFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
            />

            {/* 用户列表 - 大屏幕表格版本 */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 sm:px-6 py-4 text-center text-gray-500">
                                        No users found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers?.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                                                    {user.image ? (
                                                        <Image
                                                            src={user.image}
                                                            alt={`${user.name}'s avatar`}
                                                            width={40}
                                                            height={40}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        user.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="ml-2 sm:ml-4">
                                                    <div className="flex items-center text-xs sm:text-sm font-medium text-gray-900">
                                                        {user.name}
                                                        {user.provider === 'google' && (
                                                            <FaGoogle className="ml-1 sm:ml-2 text-red-500" title="Google account" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-1.5 sm:px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                                                    user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {user.role === UserRole.SUPER_ADMIN ? 'Super Admin' :
                                                    user.role === UserRole.ADMIN ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-1.5 sm:px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {user.status === 'active' ? 'Active' :
                                                    user.status === 'inactive' ? 'Inactive' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {user.provider === 'google' ? (
                                                    <span className="flex items-center px-1.5 sm:px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-700">
                                                        <FaGoogle className="mr-1" />
                                                        Google
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 sm:px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        {user.provider || 'Password'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                            <UserActions
                                                user={user}
                                                currentUserRole={session?.user?.role as UserRole}
                                                currentUserId={session?.user?.id}
                                                onUpdateRole={handleUpdateRole}
                                                onDeleteUser={handleDeleteUser}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 用户列表 - 移动设备卡片版本 */}
            <div className="md:hidden space-y-4">
                {filteredUsers?.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
                        No users found matching your criteria
                    </div>
                ) : (
                    filteredUsers?.map((user) => (
                        <div key={user.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center mb-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={`${user.name}'s avatar`}
                                            width={40}
                                            height={40}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center text-sm font-medium text-gray-900">
                                        {user.name}
                                        {user.provider === 'google' && (
                                            <FaGoogle className="ml-2 text-red-500" title="Google account" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                </div>
                                <span className={`ml-auto px-2 py-1 text-xs leading-5 font-semibold rounded-full 
                                    ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                                        user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'}`}>
                                    {user.status === 'active' ? 'Active' :
                                        user.status === 'inactive' ? 'Inactive' : 'Banned'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Role:</span>
                                    <span className={`ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                                            user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'}`}>
                                        {user.role === UserRole.SUPER_ADMIN ? 'Super Admin' :
                                            user.role === UserRole.ADMIN ? 'Admin' : 'User'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Provider:</span>
                                    <span className="ml-2">
                                        {user.provider === 'google' ? (
                                            <span className=" items-center inline-flex px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-700">
                                                <FaGoogle className="mr-1" />
                                                Google
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {user.provider || 'Password'}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Registered:</span>
                                    <span className="ml-2 text-xs">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 border-t pt-3 mt-2">
                                <Link
                                    href={`/dashboard/users/${user.id}`}
                                    className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 border border-blue-200 rounded-md"
                                >
                                    View
                                </Link>
                                {checkCanUpdateRole(user) && (
                                    <button
                                        onClick={() => {
                                            const newRole = user.role === UserRole.USER
                                                ? UserRole.ADMIN
                                                : UserRole.USER;

                                            handleUpdateRole(user.id, newRole);
                                        }}
                                        className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 border border-blue-200 rounded-md"
                                    >
                                        Change Role
                                    </button>
                                )}
                                {checkCanDelete(user) && (
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="text-red-600 hover:text-red-900 text-sm px-3 py-1 border border-red-200 rounded-md"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 删除确认弹窗 */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete User</h3>

                        {errorMessage && (
                            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded">
                                {errorMessage}
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            This action cannot be undone. Are you sure you want to delete this user?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 w-full sm:w-auto"
                                onClick={() => {
                                    setConfirmDelete(null);
                                    setErrorMessage(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 w-full sm:w-auto"
                                onClick={confirmUserDelete}
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardUsers; 