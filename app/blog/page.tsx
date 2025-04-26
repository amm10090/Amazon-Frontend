import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// Fetch all posts data
async function getPages(): Promise<PageData[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${apiBaseUrl}/api/cms/content`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            return [];
        }

        const json = await res.json();

        // 添加这行来在服务器终端打印数据

        if (json.status && json.data) {
            return json.data as PageData[];
        } else {
            return [];
        }
    } catch {
        return [];
    }
}

// Define post data type
interface PageData {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    categories: string[];
    tags: string[];
    seoData?: {
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
        ogImage?: string;
    };
    featuredImage?: string;
}

// Generate page metadata
export const metadata: Metadata = {
    title: 'Blog Posts - Oohunt',
    description: 'Browse our blog posts for the latest product information and shopping guides'
};

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Page component
export default async function BlogList() {
    const pages = await getPages();



    return (
        <div className="bg-gradient-to-b from-gray-50 to-white">
            <main className="container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the latest trends, product reviews, and shopping guides
                    </p>
                </header>

                {pages.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-600">No posts available</p>
                        <p className="text-gray-500 mt-2">Please check back later</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pages.map((page) => {
                            // 确保优先使用featuredImage字段作为封面图片
                            const imageUrl = page.featuredImage || page.seoData?.ogImage;

                            return (
                                <article key={page._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                                    <Link href={`/blog/${page.slug}`} className="block aspect-video relative overflow-hidden">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={page.title}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="aspect-video bg-gray-200 relative overflow-hidden flex items-center justify-center h-full w-full">
                                                <span className="text-gray-400">Oohunt</span>
                                            </div>
                                        )}
                                    </Link>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex-grow">
                                            <h2 className="text-xl font-semibold mb-3 text-gray-900 line-clamp-2">
                                                <Link
                                                    href={`/blog/${page.slug}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {page.title}
                                                </Link>
                                            </h2>
                                            {page.excerpt && (
                                                <p className="text-gray-600 mb-4 line-clamp-3">{page.excerpt}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 pt-4 mt-2 border-t border-gray-100">
                                            <div className="flex items-center mr-4">
                                                <UserIcon className="h-4 w-4 mr-1" />
                                                <span>{page.author}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                <span>{formatDate(page.publishedAt || page.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
} 