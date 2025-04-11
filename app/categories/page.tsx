import type { Metadata } from 'next';

import CategoriesClientContent from './CategoriesContent';

export const metadata: Metadata = {
    title: 'Oohunt-Categories',
    description: 'Browse all categories available on Oohunt'
};

export default function CategoriesPage() {
    return <CategoriesClientContent />;
} 