import type { Metadata } from 'next';
import Link from 'next/link';

import type { ContentTag } from '@/types/cms';

// Fetch all tags data
async function getTags(): Promise<ContentTag[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    // Fetch a large number to get all tags, adjust if needed
    const url = `${apiBaseUrl}/api/cms/tags?limit=500`;

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {

            return [];
        }

        const json = await res.json();


        if (json.status && json.data?.tags) {
            return json.data.tags;
        }

        return [];
    } catch {

        return [];
    }
}

// Generate page metadata
export const metadata: Metadata = {
    title: 'Blog Tags - Oohunt',
    description: 'Browse blog posts by tag'
};

// Tags list page component
export default async function TagsPage() {
    const tags = await getTags();

    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Tags</h1>
                <p className="text-lg text-gray-600">Browse articles by tag</p>
            </header>

            {tags.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-600">No tags available</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                    {tags.map((tag) => (
                        <Link
                            href={`/blog/tags/${tag.slug}`}
                            key={tag._id}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            {tag.name}
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-16 text-center">
                <Link href="/blog" className="text-blue-600 hover:underline">
                    &larr; Back to all posts
                </Link>
            </div>
        </main>
    );
} 