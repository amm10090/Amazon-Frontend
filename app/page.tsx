import { CategoryNavigation } from "@/components/ui/CategoryNavigation";
import { FeaturedDeals } from "@/components/ui/FeaturedDeals";
import { HeroSection } from "@/components/ui/HeroSection";
import { NewsletterSubscribe } from "@/components/ui/NewsletterSubscribe";


export default function Home() {
  return (
    <div className="max-w-[1400px] mx-auto overflow-hidden">
      <div className="relative flex">
        {/* 左侧分类导航 */}
        <div className="hidden lg:block w-[240px] fixed top-[110px] h-auto max-h-[calc(100vh-110px)] overflow-auto bg-white dark:bg-gray-900 pb-4 shadow-sm border-r border-gray-100 dark:border-gray-800">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
            <CategoryNavigation />
          </div>
        </div>

        {/* 右侧主内容区域 */}
        <main className="flex-1 lg:ml-[240px] min-h-screen w-full overflow-hidden">
          <div className="px-4 lg:px-6 py-6 space-y-8 overflow-hidden">
            {/* 顶部英雄区域 */}
            <HeroSection />

            {/* 限时特惠区域 */}
            <FeaturedDeals />

            {/* 分隔线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                  Recommended for you
                </span>
              </div>
            </div>

            {/* 邮箱订阅组件 */}
            <NewsletterSubscribe />
          </div>
        </main>
      </div>
    </div>
  );
}
