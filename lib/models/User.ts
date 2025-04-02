import type { ObjectId } from "mongodb";

import type { UserRole } from "./UserRole";

/**
 * 用户模型接口
 */
export interface User {
    _id?: ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 用户注册请求接口
 */
export interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
}

/**
 * 用户响应接口（不包含敏感信息）
 */
export interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string;
}

/**
 * 将用户数据转换为安全的响应格式
 */
export function toUserResponse(user: User): UserResponse {
    return {
        id: user._id?.toString() || '',
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
    };
} 