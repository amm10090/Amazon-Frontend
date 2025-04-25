import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// 获取所有文章数据
async function getPages(): Promise<PageData[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${apiBaseUrl}/api/cms/content`, { cache: 'no-store' });

        if (!res.ok) {
            return [];
        }

        const json = await res.json();

        if (json.status && json.data) {
            return json.data as PageData[];
        } else {
            return [];
        }
    } catch {
        return [];
    }
}

// 定义文章数据类型
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
}

// 生成页面元数据
export const metadata: Metadata = {
    title: 'Blog Posts - Oohunt',
    description: 'Browse our blog posts for the latest product information and shopping guides'
};

// 页面组件
export default async function BlogList() {
    const pages = await getPages();

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                    <article key={page._id} className="bg-white rounded-lg shadow overflow-hidden">
                        {page.seoData?.ogImage && (
                            <div className="aspect-video relative">
                                <Image
                                    src={page.seoData.ogImage}
                                    alt={page.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        )}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2">
                                <Link href={`/blog/${page.slug}`} className="hover:text-primary">
                                    {page.title}
                                </Link>
                            </h2>
                            {page.excerpt && (
                                <p className="text-gray-600 mb-4">{page.excerpt}</p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Author: {page.author}</span>
                                <span>
                                    {new Date(page.publishedAt || page.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
} 