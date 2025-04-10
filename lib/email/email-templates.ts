import clientPromise from '@/lib/mongodb';

import {
    EMAIL_TEMPLATE_TYPES,
    type EmailTemplateType,
    type TemplateVariables,
    type EmailTemplate
} from './email-template-types';

// 重新导出
export { EMAIL_TEMPLATE_TYPES };
export type { EmailTemplateType, TemplateVariables, EmailTemplate };

/**
 * 根据模板ID获取邮件模板
 * @param templateId 模板ID
 * @returns 邮件模板数据
 */
export async function getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('email_templates');

        const template = await collection.findOne({ templateId });

        if (!template) {
            return null;
        }

        return {
            id: template._id.toString(),
            templateId: template.templateId,
            name: template.name,
            subject: template.subject,
            fromName: template.fromName,
            fromEmail: template.fromEmail,
            htmlContent: template.htmlContent,
            type: template.type || EMAIL_TEMPLATE_TYPES.SUBSCRIPTION_CONFIRMATION,
            isActive: template.isActive !== undefined ? template.isActive : true,
            updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt,
            createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt
        };
    } catch {

        return null;
    }
}

/**
 * 根据模板类型获取邮件模板
 * @param type 模板类型
 * @returns 邮件模板数据
 */
export async function getEmailTemplateByType(type: EmailTemplateType): Promise<EmailTemplate | null> {
    try {
        const client = await clientPromise;
        const dbName = process.env.MONGODB_DB || 'oohunt';
        const db = client.db(dbName);
        const collection = db.collection('email_templates');

        // 查询指定类型且处于激活状态的模板
        const template = await collection.findOne({ type, isActive: true });

        if (!template) {
            return null;
        }

        return {
            id: template._id.toString(),
            templateId: template.templateId,
            name: template.name,
            subject: template.subject,
            fromName: template.fromName,
            fromEmail: template.fromEmail,
            htmlContent: template.htmlContent,
            type: template.type,
            isActive: template.isActive,
            updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt,
            createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt
        };
    } catch {
        return null;
    }
}

/**
 * 使用变量替换模板内容
 * @param content 模板内容
 * @param variables 变量对象
 * @returns 替换后的内容
 */
export function compileTemplate(content: string, variables: TemplateVariables): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = variables[key.trim()];

        // 如果变量是日期对象，格式化为字符串
        if (value instanceof Date) {
            return value.toLocaleDateString();
        }

        // 如果变量存在，返回其值；否则保持原样
        return value !== undefined ? String(value) : match;
    });
}

/**
 * 获取并编译邮件模板
 * @param templateIdOrType 模板ID或类型
 * @param variables 模板变量
 * @param isType 是否按类型查询
 * @returns 处理后的模板数据
 */
export async function getCompiledEmailTemplate(
    templateIdOrType: string,
    variables: TemplateVariables,
    isType: boolean = false
): Promise<{
    success: boolean;
    subject?: string;
    html?: string;
    from?: string;
    error?: string;
}> {
    try {
        let template: EmailTemplate | null;

        if (isType) {
            // 按类型查询模板
            template = await getEmailTemplateByType(templateIdOrType as EmailTemplateType);
        } else {
            // 按ID查询模板（保持向后兼容）
            template = await getEmailTemplate(templateIdOrType);
        }

        if (!template) {
            return {
                success: false,
                error: `template ${templateIdOrType} not found or not activated`
            };
        }

        // 如果模板被禁用，返回错误
        if (!template.isActive) {
            return {
                success: false,
                error: `template ${templateIdOrType} is disabled`
            };
        }

        const compiledSubject = compileTemplate(template.subject, variables);
        const compiledHtml = compileTemplate(template.htmlContent, variables);
        const from = `${template.fromName} <${template.fromEmail}>`;

        return {
            success: true,
            subject: compiledSubject,
            html: compiledHtml,
            from
        };
    } catch {

        return {
            success: false,
        };
    }
} 