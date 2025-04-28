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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <header className="mb-12 text-center">
                    <Link href="/blog/tags" className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4 hover:bg-blue-100 transition-colors">
                        All Tags
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Tag: {tag.name}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Browse articles with &ldquo;{tag.name}&rdquo; tag
                    </p>
                </header>

                {posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No posts with this tag</h3>
                        <p className="text-gray-500">Please check other tags or come back later</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((page) => {
                            // 确保优先使用featuredImage字段作为封面图片
                            const imageUrl = page.featuredImage || page.seoData?.ogImage;

                            return (
                                <article key={page._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
                                    <Link href={`/blog/${page.slug}`} className="block aspect-[12/7] relative overflow-hidden">
                                        {imageUrl ? (
                                            <SafeImage
                                                src={imageUrl}
                                                alt={page.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                                                    className="hover:text-blue-600 transition-colors"
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

                <div className="mt-16 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Back to All Posts
                    </Link>
                </div>
            </div>
        </div>
    );
} 