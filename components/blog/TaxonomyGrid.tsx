'use client';
import Link from 'next/link';
import React from 'react';

import type { ContentCategory, ContentTag } from '@/types/cms';

// Define a union type including postCount
type TaxonomyItem = (ContentCategory | ContentTag) & { postCount?: number }; // postCount is optional

interface TaxonomyGridProps {
    items: TaxonomyItem[];
    basePath: '/blog/categories' | '/blog/tags'; // for generating links
    itemType: 'category' | 'tag'; // to distinguish the type for display
}

const TaxonomyGrid: React.FC<TaxonomyGridProps> = ({ items, basePath, itemType }) => {
    // If no items, show a message
    if (!items || items.length === 0) {
        return <p className="text-center text-gray-500 py-8">No {itemType}s available</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
                <Link
                    key={item._id}
                    href={`${basePath}/${item.slug}`}
                    className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-gray-100"
                >
                    <span className="w-12 h-12 mb-3 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 text-lg transition-colors">
                        {itemType === 'category' ? '#' : '•'}
                    </span>
                    <h2 className="text-md font-medium text-gray-800 group-hover:text-blue-600 text-center truncate max-w-full transition-colors">{item.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {item.postCount !== undefined ? `${item.postCount} ${item.postCount === 1 ? 'post' : 'posts'}` : 'No posts'}
                    </p>
                </Link>
            ))}
        </div>
    );
};

export default TaxonomyGrid; 