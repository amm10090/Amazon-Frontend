"use client";

import Link from 'next/link';

export interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="breadcrumb flex items-center flex-wrap text-sm my-4">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={item.href} className="flex items-center">
                        {index > 0 && (
                            <span className="mx-2 text-gray-400">›</span>
                        )}

                        {isLast ? (
                            <span className="text-gray-600 dark:text-gray-300">
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
} 