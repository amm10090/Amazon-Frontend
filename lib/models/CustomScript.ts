import type { ObjectId } from "mongodb";

/**
 * 自定义脚本位置枚举
 */
export enum ScriptLocation {
    HEAD = 'head',           // 在<head>标签内
    BODY_START = 'body_start', // 在<body>标签开始后
    BODY_END = 'body_end'     // 在</body>标签前
}

/**
 * 自定义脚本数据模型
 */
export interface CustomScript {
    _id?: ObjectId;
    name: string;            // 脚本名称，方便识别
    content: string;         // 脚本代码内容
    location: ScriptLocation; // 脚本位置
    enabled: boolean;        // 是否启用
    createdAt: Date;         // 创建时间
    updatedAt: Date;         // 更新时间
}

/**
 * 自定义脚本列表响应类型
 */
export interface CustomScriptsResponse {
    items: CustomScript[];
    total: number;
}

/**
 * 创建/更新自定义脚本请求类型
 */
export interface CustomScriptRequest {
    _id?: string;            // 脚本ID，更新时需要
    name: string;            // 脚本名称
    content: string;         // 脚本内容
    location: ScriptLocation; // 脚本位置
    enabled: boolean;        // 是否启用
} 