"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, useDeals, useCategoryStats, useProductStats } from '@/lib/hooks';
import ProductCard from '@/components/product/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useFilterStore } from '@/store';
import ApiDebugger from '@/components/debug/ApiDebugger';
import { useEffect, useState } from 'react';
import { adaptProductData } from '@/lib/utils';

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { category, setCategory } = useFilterStore();
  const [isDebugMode, setIsDebugMode] = useState(false);

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

  // 开启调试模式的键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+D 组合键开启/关闭调试模式
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        setIsDebugMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 从browse_nodes中提取分类列表
  const categories = categoryStats?.browse_nodes ?
    Object.entries(categoryStats.browse_nodes)
      .filter(([_, data]) => data.count && data.count > 0)
      .map(([id, data]) => ({
        id,
        name: data.name || id,
        count: data.count || 0
      }))
      .sort((a, b) => b.count - a.count) : [];

  console.log("分类数据:", categoryStats);
  console.log("商品数据:", products);

  if (productsError || dealsError) {
    return <ErrorMessage message="加载数据时出错" />;
  }

  return (
    <div className="min-h-screen">
      {/* 调试面板 */}
      {isDebugMode && (
        <div className="fixed top-20 right-4 z-50 w-96 max-w-full">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-2">API 调试面板</h2>
            <p className="text-xs text-gray-500 mb-4">按 Ctrl+Alt+D 关闭</p>
            <ApiDebugger data={categoryStats} title="分类统计数据" initialExpanded={true} />
            <ApiDebugger data={products} title="商品数据" />
            <ApiDebugger data={stats} title="统计数据" />
          </div>
        </div>
      )}

      {/* 英雄区域 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden py-20 px-4 mb-16 bg-gradient-primary text-white"
      >
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            transition: { duration: 3, repeat: Infinity }
          }}
          className="container mx-auto text-center relative z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            发现亚马逊最佳优惠
          </h1>
          <p className="text-xl opacity-90 mb-8">
            每日更新，为您精选全球优质商品
          </p>

          {/* 统计信息卡片 */}
          {!statsLoading && stats && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl"
              >
                <div className="text-3xl font-bold">{stats.total_products}</div>
                <div className="text-sm opacity-80">商品总数</div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl"
              >
                <div className="text-3xl font-bold">{stats.discount_products}</div>
                <div className="text-sm opacity-80">折扣商品</div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl"
              >
                <div className="text-3xl font-bold">{Math.round(stats.avg_discount)}%</div>
                <div className="text-sm opacity-80">平均折扣</div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl"
              >
                <div className="text-3xl font-bold">${stats.avg_price.toFixed(2)}</div>
                <div className="text-sm opacity-80">平均价格</div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-accent rounded-full filter blur-3xl"></div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4">
        {/* 限时特惠 */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="section-title"
          >
            🔥 限时特惠
          </motion.h2>

          {dealsLoading ? (
            <LoadingSpinner size="lg" className="my-8" />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {deals?.slice(0, 4).map((product: any) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={adaptProductData(product)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* 分类导航 */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="section-title"
          >
            🏷️ 商品分类
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              variants={itemVariants}
              onClick={() => setCategory(null)}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${!category
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-background hover:bg-primary/10'
                }`}
            >
              全部
            </motion.button>
            {!categoryLoading && categories.map((cat) => (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                onClick={() => setCategory(cat.id)}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${category === cat.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-background hover:bg-primary/10'
                  }`}
              >
                {cat.name} ({cat.count})
              </motion.button>
            ))}
            {categoryLoading && <LoadingSpinner size="sm" />}
          </motion.div>
        </section>

        {/* 商品列表 */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="section-title"
          >
            ✨ 精选商品
          </motion.h2>

          {productsLoading ? (
            <LoadingSpinner size="lg" className="my-8" />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="wait">
                {products?.map((product: any) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layout
                  >
                    <ProductCard product={adaptProductData(product)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
