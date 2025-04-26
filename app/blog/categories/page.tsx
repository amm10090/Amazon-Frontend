import type { Metadata } from 'next';
import Link from 'next/link';

import TaxonomyGrid from '@/components/blog/TaxonomyGrid';
import type { ContentCategory } from '@/types/cms';
// import CategoryCloud from '@/components/blog/CategoryCloud';

// Fetch all categories data
async function getCategories(): Promise<ContentCategory[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    // Fetch a large number to get all categories, adjust if needed
    const url = `${apiBaseUrl}/api/cms/categories?limit=500`;

    try {
        const res = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!res.ok) {
            return [];
        }

        const json = await res.json();

        if (json.status && json.data?.categories) {
            return json.data.categories;
        }

        return [];
    } catch {
        return [];
    }
}

// Generate page metadata
export const metadata: Metadata = {
    title: 'Blog Categories - Oohunt',
    description: 'Browse blog posts by category'
};

// Categories list page component
export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <main className="flex flex-col min-h-screen">
            <div className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Categories</h1>
                    <p className="text-lg text-gray-600">Browse articles by category</p>
                </header>

                <div className="w-full">
                    <TaxonomyGrid items={categories} basePath="/blog/categories" itemType="category" />
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