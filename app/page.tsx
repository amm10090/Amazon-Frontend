"use client";

import { motion } from 'framer-motion';
import { useProducts, useDeals, useCategoryStats, useProductStats } from '@/lib/hooks';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useFilterStore } from '@/store';

export default function Home() {
  const { category, setCategory } = useFilterStore();
  const { data: products, isLoading: productsLoading, isError: productsError } = useProducts({
    product_type: 'all',
    page: 1,
    limit: 20,
    category: category || undefined,
    sort: 'created',
    order: 'desc',
  });
  const { data: deals, isLoading: dealsLoading, isError: dealsError } = useDeals();
  const { data: categoryStats, isLoading: categoryLoading } = useCategoryStats();
  const { data: stats, isLoading: statsLoading } = useProductStats();

  // 从browse_nodes中提取分类列表
  const categories = categoryStats?.browse_nodes ?
    Object.entries(categoryStats.browse_nodes).map(([id, data]: [string, any]) => ({
      id,
      name: data.name || id,
      count: data.count || 0
    })) : [];

  if (productsError || dealsError) {
    return <ErrorMessage message="加载数据时出错" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 英雄区域 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary text-transparent bg-clip-text">
          发现亚马逊最佳优惠
        </h1>
        <p className="text-xl text-text-light mb-8">
          每日更新，为您精选全球优质商品
        </p>

        {/* 统计信息 */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.total_products}</div>
              <div className="text-sm text-text-light">商品总数</div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.discount_products}</div>
              <div className="text-sm text-text-light">折扣商品</div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{Math.round(stats.avg_discount)}%</div>
              <div className="text-sm text-text-light">平均折扣</div>
            </div>
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">${stats.avg_price.toFixed(2)}</div>
              <div className="text-sm text-text-light">平均价格</div>
            </div>
          </div>
        )}
      </motion.section>

      {/* 限时特惠 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">🔥 限时特惠</h2>
        {dealsLoading ? (
          <LoadingSpinner size="lg" className="my-8" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals?.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 分类导航 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">🏷️ 商品分类</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setCategory(null)}
            className={`px-4 py-2 rounded-full transition-colors ${!category
              ? 'bg-primary text-white'
              : 'bg-primary/10 hover:bg-primary/20'
              }`}
          >
            全部
          </button>
          {!categoryLoading && categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-colors ${category === cat.id
                ? 'bg-primary text-white'
                : 'bg-primary/10 hover:bg-primary/20'
                }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
          {categoryLoading && <LoadingSpinner size="sm" />}
        </div>
      </section>

      {/* 商品列表 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">✨ 精选商品</h2>
        {productsLoading ? (
          <LoadingSpinner size="lg" className="my-8" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
