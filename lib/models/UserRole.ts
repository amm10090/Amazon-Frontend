/**
 * 用户角色枚举
 */
export enum UserRole {
    USER = 'user',           // 普通用户
    ADMIN = 'admin',         // 管理员
    SUPER_ADMIN = 'super_admin'  // 超级管理员
}

/**
 * 角色权限映射
 */
export const RolePermissions = {
    [UserRole.USER]: {
        canAccessDashboard: false,
        canManageProducts: false,
        canManageUsers: false,
        canFilterAPI: false,
        canExportData: false,
    },
    [UserRole.ADMIN]: {
        canAccessDashboard: true,
        canManageProducts: true,
        canManageUsers: false,
        canFilterAPI: true,
        canExportData: true,
    },
    [UserRole.SUPER_ADMIN]: {
        canAccessDashboard: true,
        canManageProducts: true,
        canManageUsers: true,
        canFilterAPI: true,
        canExportData: true,
    }
} as const;

/**
 * 用户角色接口
 */
export interface UserRoleData {
    userId: string;
    role: UserRole;
    updatedAt: Date;
}

/**
 * 检查用户是否具有特定权限
 */
export function hasPermission(role: UserRole, permission: keyof typeof RolePermissions[UserRole.USER]): boolean {
    return RolePermissions[role][permission];
}

/**
 * 获取角色的所有权限
 */
export function getRolePermissions(role: UserRole) {
    return RolePermissions[role];
}

/**
 * 检查是否为管理员角色
 */
export function isAdminRole(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

/**
 * 检查是否为超级管理员
 */
export function isSuperAdmin(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN;
}

/**
 * 预定义的管理员账户列表
 */
export const ADMIN_ACCOUNTS = [
    't2715481617@gmail.com',
    'a.aadil26@gmail.com',
    'oohuntofficial@gmail.com'
] as const;

/**
 * 预定义的超级管理员账户列表
 */
export const SUPER_ADMIN_ACCOUNTS = [
    't2715481617@gmail.com',
    'a.aadil26@gmail.com',
    'oohuntofficial@gmail.com'
] as const;

/**
 * 检查邮箱是否为预定义的管理员账户
 */
export function isAdminAccount(email: string): boolean {
    // 转换为小写后比较，确保大小写不敏感
    const normalizedEmail = email.toLowerCase();

    return ADMIN_ACCOUNTS.some(admin => admin.toLowerCase() === normalizedEmail);
}

/**
 * 检查邮箱是否为预定义的超级管理员账户
 */
export function isSuperAdminAccount(email: string): boolean {
    // 转换为小写后比较，确保大小写不敏感
    const normalizedEmail = email.toLowerCase();

    return SUPER_ADMIN_ACCOUNTS.some(admin => admin.toLowerCase() === normalizedEmail);
} 