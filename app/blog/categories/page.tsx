import type { Metadata } from 'next';
import Link from 'next/link';

import type { ContentCategory } from '@/types/cms';

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
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Categories</h1>
                <p className="text-lg text-gray-600">Browse articles by category</p>
            </header>

            {categories.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-600">No categories available</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-4 justify-center">
                    {categories.map((category) => (
                        <Link
                            href={`/blog/categories/${category.slug}`}
                            key={category._id}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            {category.name}
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