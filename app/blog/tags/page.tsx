import type { Metadata } from 'next';
import Link from 'next/link';

import TaxonomyGrid from '@/components/blog/TaxonomyGrid';
import type { ContentTag } from '@/types/cms';
// import TagCloud from '@/components/blog/TagCloud';

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
        <main className="flex flex-col min-h-screen">
            <div className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Tags</h1>
                    <p className="text-lg text-gray-600">Browse articles by tag</p>
                </header>

                <div className="w-full">
                    <TaxonomyGrid items={tags} basePath="/blog/tags" itemType="tag" />
                </div>

                <div className="mt-16 text-center">
                    <Link href="/blog" className="text-blue-600 hover:underline">
                        &larr; Back to all posts
                    </Link>
                </div>
            </div>
        </main>
    );
} 