import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SafeImage } from '@/components/common/SafeImage';
import type { ContentTag, ContentPage as PageData } from '@/types/cms';

// 获取特定标签的信息
async function getTagData(slug: string): Promise<ContentTag | null> {
    try {
        // 使用服务器端直接API调用代替客户端API库
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';


        const res = await fetch(`${apiBaseUrl}/api/cms/tags/slug/${slug}`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            if (res.status === 404) {

                return null;
            }

            return null;
        }

        const json = await res.json();


        if (json.status && json.data) {
            return json.data;
        }

        return null;
    } catch {

        return null;
    }
}

// 获取特定标签下的所有文章
async function getTagPosts(tagId: string): Promise<PageData[]> {
    try {
        // 使用服务器端直接API调用代替客户端API库
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';


        const res = await fetch(`${apiBaseUrl}/api/cms/pages?tag=${tagId}&status=published&sortBy=publishedAt&sortOrder=desc&limit=50`, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {

            return [];
        }

        const json = await res.json();


        if (json.status && json.data?.pages) {
            // 确保返回的数据结构与 PageData 兼容
            return json.data.pages.map((page: Record<string, unknown>) => ({
                ...page,
                // 如果API没有直接返回 categories/tags 字段，可能需要处理
                // 使用 unknown[] 代替 any[]
                categories: (page.categories as unknown[]) || [],
                tags: (page.tags as unknown[]) || []
            })) as PageData[];
        }

        return [];
    } catch {

        return [];
    }
}

// 生成页面元数据
export async function generateMetadata(
    { params }: { params: { tag: string } }
): Promise<Metadata> {
    // 确保先await参数
    const resolvedParams = await params;
    const tag = await getTagData(resolvedParams.tag);

    if (!tag) {
        return {
            title: 'Tag Not Found'
        };
    }

    return {
        title: `${tag.name} - Blog Tag`,
        description: `Browse all articles with the ${tag.name} tag`,
    };
}

// 添加日期格式化函数 (与 /blog/page.tsx 相同)
function formatDate(dateString: string): string {
    if (!dateString) return ''; // 添加保护，防止无效日期

    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// 标签文章列表页面组件
export default async function TagPage({ params }: { params: { tag: string } }) {
    // 确保先await参数
    const resolvedParams = await params;
    const tag = await getTagData(resolvedParams.tag);

    if (!tag) {
        notFound();
    }

    const posts = await getTagPosts(tag._id || '');

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Tag: {tag.name}</h1>
                <p className="text-lg text-gray-600">
                    Articles tagged with &ldquo;{tag.name}&rdquo;
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-gray-500">No posts found with this tag.</p>
                </div>
            ) : (
                // 使用与 /blog/page.tsx 相同的网格布局和间距
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((page) => {
                        // 确保优先使用featuredImage字段作为封面图片
                        const imageUrl = page.featuredImage || page.seoData?.ogImage;

                        // 使用与 /blog/page.tsx 相同的卡片结构和样式
                        return (
                            <article key={page._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                                <Link href={`/blog/${page.slug}`} className="block aspect-video relative overflow-hidden">
                                    {imageUrl ? (
                                        <SafeImage
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
                                        {page.author && (
                                            <div className="flex items-center mr-4">
                                                <UserIcon className="h-4 w-4 mr-1" />
                                                <span>{page.author}</span>
                                            </div>
                                        )}
                                        {(page.publishedAt || page.updatedAt) && (
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                <span>{formatDate((page.publishedAt || page.updatedAt).toString())}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <div className="mt-8">
                <Link href="/blog" className="text-blue-600 hover:underline">
                    &larr; Back to all posts
                </Link>
            </div>
        </main>
    );
} 