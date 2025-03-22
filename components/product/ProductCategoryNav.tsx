import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategoryStats } from '@/lib/hooks';
import axios from 'axios';

type ProductCategoryNavProps = {
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
};

export function ProductCategoryNav({
    selectedCategory,
    onCategorySelect
}: ProductCategoryNavProps) {
    const [showAll, setShowAll] = useState(false);
    const { data, isLoading, isError } = useCategoryStats({
        sort_by: 'count',
        sort_order: 'desc',
        page_size: 50
    });

    const [directData, setDirectData] = useState<any>(null);
    const [directLoading, setDirectLoading] = useState(false);

    // If SWR fetch fails, use axios directly
    useEffect(() => {
        const fetchDirectlyIfNeeded = async () => {
            if ((isError || (!data && !isLoading)) && !directData && !directLoading) {
                try {
                    console.log('Attempting to fetch category stats directly');
                    setDirectLoading(true);

                    const response = await axios.get('/api/categories/stats', {
                        params: {
                            sort_by: 'count',
                            sort_order: 'desc',
                            page: 1,
                            page_size: 50
                        }
                    });
                    console.log('Directly fetched category data:', response.data);
                    setDirectData(response.data);
                } catch (err) {
                    console.error('Failed to fetch category data directly:', err);
                } finally {
                    setDirectLoading(false);
                }
            }
        };

        fetchDirectlyIfNeeded();
    }, [isError, data, isLoading, directData]);

    // Get category data, prioritize SWR data, if not available use directly fetched data
    const categoryData = data || (directData?.data);
    const productGroups = categoryData?.product_groups || {};

    // Get category list and sort by product count
    const categories = Object.entries(productGroups)
        .map(([name, count]) => ({
            name,
            count: Number(count)
        }))
        .sort((a, b) => b.count - a.count);

    // Number of categories to display
    const visibleCategories = showAll ? categories : categories.slice(0, 8);

    // Handle click on "All" button
    const handleAllClick = () => {
        onCategorySelect('');
    };

    // Handle click on category button
    const handleCategorySelect = (category: string) => {
        onCategorySelect(category);
    };

    // Toggle show more/less
    const toggleShowAll = () => {
        setShowAll(!showAll);
    };

    if (isLoading || directLoading) {
        return (
            <div className="py-4 flex justify-center">
                <div className="animate-pulse flex space-x-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="flex flex-wrap items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === ''
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                        }`}
                    onClick={handleAllClick}
                >
                    All
                </motion.button>

                <AnimatePresence>
                    {visibleCategories.map((category) => (
                        <motion.button
                            key={category.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.name
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => handleCategorySelect(category.name)}
                        >
                            {category.name}
                            <span className="ml-1 text-xs opacity-70">({category.count})</span>
                        </motion.button>
                    ))}
                </AnimatePresence>

                {categories.length > 8 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 text-sm font-medium text-primary hover:underline"
                        onClick={toggleShowAll}
                    >
                        {showAll ? 'Show less' : 'Show more'}
                    </motion.button>
                )}
            </div>
        </div>
    );
} 