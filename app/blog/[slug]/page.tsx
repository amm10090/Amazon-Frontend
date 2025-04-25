import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import ContentRenderer from '@/components/cms/ContentRenderer';

// 获取文章数据
async function getPageData(slug: string): Promise<PageData | null> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

    try {
        const res = await fetch(`${apiBaseUrl}/api/cms/content/${slug}`, { cache: 'no-store' });

        if (!res.ok) {
            if (res.status === 404) {
                return null;
            }

            return null;
        }

        const json = await res.json();

        if (json.status && json.data) {
            return json.data as PageData;
        } else {
            return null;
        }
    } catch {
        return null;
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
    products?: unknown[];
}

// 生成页面元数据
export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const page = await getPageData(resolvedParams.slug);

    if (!page) {
        return {
            title: 'Post Not Found'
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: page.seoData?.metaTitle || page.title,
        description: page.seoData?.metaDescription || page.excerpt,
        alternates: {
            canonical: page.seoData?.canonicalUrl || `/blog/${resolvedParams.slug}`,
        },
        openGraph: {
            title: page.seoData?.metaTitle || page.title,
            description: page.seoData?.metaDescription || page.excerpt || '',
            url: `/blog/${resolvedParams.slug}`,
            images: page.seoData?.ogImage ? [page.seoData.ogImage, ...previousImages] : previousImages,
        },
    };
}

// 页面组件
export default async function BlogPost({ params }: { params: { slug: string } }) {
    const resolvedParams = await params;
    const pageData: PageData | null = await getPageData(resolvedParams.slug);

    if (!pageData) {
        notFound();
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <article className="prose lg:prose-xl max-w-none bg-white p-6 rounded shadow">
                <h1 className="mb-4">{pageData.title}</h1>

                <ContentRenderer content={pageData.content} />

                {pageData.products && pageData.products.length > 0 && (
                    <div className="mt-8 pt-4 border-t">
                        <h2 className="text-xl font-semibold mb-4">Related Products</h2>
                        <p className="text-gray-500">(Product rendering logic to be implemented)</p>
                    </div>
                )}

                <div className="mt-8 text-sm text-gray-500 pt-4 border-t">
                    <span>Author: {pageData.author}</span> |
                    <span> Last Updated: {new Date(pageData.updatedAt).toLocaleDateString()}</span>
                </div>
            </article>
        </main>
    );
} 