import type { Metadata } from 'next';

import FavoritesPage from './FavoritesContent';

export const metadata: Metadata = {
    title: 'Oohunt-Favorites',
    description: 'View and manage your favorite products'
};

export default function FavoritesPageWrapper() {
    return <FavoritesPage />;
} 