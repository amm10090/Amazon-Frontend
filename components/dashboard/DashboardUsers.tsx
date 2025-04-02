'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

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
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">搜索用户</label>
                    <input
                        type="text"
                        id="search"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="搜索名称或邮箱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">角色筛选</label>
                    <select
                        id="role-filter"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">全部角色</option>
                        <option value={UserRole.USER}>普通用户</option>
                        <option value={UserRole.ADMIN}>管理员</option>
                        <option value={UserRole.SUPER_ADMIN}>超级管理员</option>
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
                        重置筛选
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UserActionsProps {
    user: UserItem;
    currentUserRole: UserRole;
    onUpdateRole: (userId: string, newRole: UserRole) => void;
    onDeleteUser: (userId: string) => void;
}

// 用户操作组件
const UserActions: React.FC<UserActionsProps> = ({
    user,
    currentUserRole,
    onUpdateRole,
    onDeleteUser
}) => {
    const canModifyRole = isSuperAdmin(currentUserRole as UserRole);
    const canDeleteUser = isSuperAdmin(currentUserRole as UserRole) ||
        (currentUserRole === UserRole.ADMIN && user.role === UserRole.USER);

    // 防止修改自己的角色或删除自己
    const { data: session } = useSession();
    const isSelf = session?.user?.id === user.id;

    return (
        <div className="flex space-x-2">
            {canModifyRole && !isSelf && (
                <select
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={user.role}
                    onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                >
                    <option value={UserRole.USER}>普通用户</option>
                    <option value={UserRole.ADMIN}>管理员</option>
                    <option value={UserRole.SUPER_ADMIN}>超级管理员</option>
                </select>
            )}

            <Link
                href={`/dashboard/users/${user.id}`}
                className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
                查看
            </Link>

            {canDeleteUser && !isSelf && (
                <button
                    className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    onClick={() => onDeleteUser(user.id)}
                >
                    删除
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

    // 模拟用户角色更新
    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        try {
            await fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });
            mutate(); // 刷新用户列表
        } catch {
            alert('更新用户角色失败');
        }
    };

    // 模拟用户删除
    const handleDeleteUser = (userId: string) => {
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

                return;
            }

            setConfirmDelete(null);
            mutate(); // 刷新用户列表
        } catch {
            setErrorMessage('删除用户失败，请检查网络连接');
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
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
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 text-red-600">
                    加载用户数据失败，请稍后重试。
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
                <div className="text-sm text-gray-500">
                    共 {userList.length} 个注册用户
                </div>
            </div>

            {/* 筛选组件 */}
            <UserFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
            />

            {/* 用户列表 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        没有找到匹配的用户
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers?.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' :
                                                    user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {user.role === UserRole.SUPER_ADMIN ? '超级管理员' :
                                                    user.role === UserRole.ADMIN ? '管理员' : '普通用户'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                正常
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <UserActions
                                                user={user}
                                                currentUserRole={session?.user?.role as UserRole}
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

            {/* 删除确认弹窗 */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除用户</h3>

                        {errorMessage && (
                            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded">
                                {errorMessage}
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            删除操作不可恢复，确定要删除此用户吗？
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                onClick={() => {
                                    setConfirmDelete(null);
                                    setErrorMessage(null);
                                }}
                            >
                                取消
                            </button>
                            <button
                                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                                onClick={confirmUserDelete}
                            >
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardUsers; 