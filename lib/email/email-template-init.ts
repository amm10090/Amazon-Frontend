import clientPromise from '../mongodb';

import { DEFAULT_TEMPLATES } from './email-template-defaults';
import type { EmailTemplateType } from './email-template-types';

/**
 * 初始化默认邮件模板
 * 检查数据库中是否已存在各类型模板，不存在则创建默认模板
 */
export async function initializeEmailTemplates(): Promise<{
    success: boolean;
    created: number;
    error?: string;
}> {
    try {
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('email_templates');

        // 统计新创建的模板数量
        let createdCount = 0;

        // 检查并创建每种类型的模板
        for (const template of DEFAULT_TEMPLATES) {
            // 检查该类型的模板是否已存在
            const existingTemplate = await collection.findOne({ type: template.type });

            if (!existingTemplate) {
                // 添加创建时间和更新时间
                const now = new Date();
                const templateData = {
                    ...template,
                    createdAt: now,
                    updatedAt: now,
                };

                // 向数据库插入默认模板
                await collection.insertOne(templateData);
                createdCount++;
            }
        }

        return {
            success: true,
            created: createdCount,
        };
    } catch (error) {

        return {
            success: false,
            created: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * 获取指定类型的模板，如果不存在则创建默认模板
 * 主要用于确保关键邮件功能不会因为模板缺失而失败
 */
export async function ensureTemplateExists(type: EmailTemplateType): Promise<boolean> {
    try {
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('email_templates');

        // 检查该类型的模板是否已存在
        const existingTemplate = await collection.findOne({ type });

        if (!existingTemplate) {
            // 获取该类型的默认模板配置
            const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.type === type);

            if (defaultTemplate) {
                // 添加创建时间和更新时间
                const now = new Date();
                const templateData = {
                    ...defaultTemplate,
                    createdAt: now,
                    updatedAt: now,
                };

                // 向数据库插入默认模板
                await collection.insertOne(templateData);

                return true;
            } else {

                return false;
            }
        }

        return true;
    } catch {

        return false;
    }
} 