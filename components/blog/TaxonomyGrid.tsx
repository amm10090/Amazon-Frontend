'use client';
import { Card, CardHeader, CardBody, Link as HeroLink } from '@heroui/react'; // 导入 HeroUI 组件
import React from 'react';

import type { ContentCategory, ContentTag } from '@/types/cms';

// 定义一个包含 postCount 的联合类型
type TaxonomyItem = (ContentCategory | ContentTag) & { postCount?: number }; // postCount 现在是可选的

interface TaxonomyGridProps {
    items: TaxonomyItem[];
    basePath: '/blog/categories' | '/blog/tags'; // 用于生成链接
    itemType: 'category' | 'tag'; // 区分类型用于显示
}

const TaxonomyGrid: React.FC<TaxonomyGridProps> = ({ items, basePath, itemType }) => {
    // 如果没有项目，显示提示信息
    if (!items || items.length === 0) {
        return <p className="text-center text-gray-500">No {itemType}s available.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <HeroLink key={item._id} href={`${basePath}/${item.slug}`} className="block h-full">
                    {/* 
                        isPressable 会将 Card 渲染为 button，可能导致嵌套问题
                        isHoverable 提供了悬停效果
                    */}
                    <Card className="h-full transition-shadow hover:shadow-md" isHoverable>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h2>
                        </CardHeader>
                        <CardBody>
                            <p className="text-sm text-gray-600">
                                {item.postCount !== undefined ? `${item.postCount} ${item.postCount === 1 ? 'post' : 'posts'}` : '0 posts'}
                            </p>
                        </CardBody>
                    </Card>
                </HeroLink>
            ))}
        </div>
    );
};

export default TaxonomyGrid; 