import { CategoryNavigation } from "@/components/ui/CategoryNavigation";
import { FeaturedDeals } from "@/components/ui/FeaturedDeals";
import { HeroSection } from "@/components/ui/HeroSection";
import { NewsletterSubscribe } from "@/components/ui/NewsletterSubscribe";


export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* 左侧分类导航 - 在大屏上占2列 */}
      <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 lg:border-r lg:border-r-gray-200/50 dark:lg:border-r-gray-700/50">
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm lg:rounded-lg lg:p-3">
          <div className="mb-3 lg:border-b lg:border-gray-200 dark:lg:border-gray-700 pb-2">
            <h2 className="text-xl font-bold text-center lg:text-left bg-clip-text text-transparent bg-gradient-to-r from-[#2c3e50] to-[#95a5a6]">
              Categories
            </h2>
          </div>
          <CategoryNavigation />
        </div>
      </div>

      {/* 右侧主内容区域 - 在大屏上占8列 */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        {/* 顶部英雄区域 */}
        <HeroSection />

        {/* 限时特惠区域 */}
        <FeaturedDeals />

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-text-light">Recommended for you</span>
          </div>
        </div>




        {/* 邮箱订阅组件 */}
        <NewsletterSubscribe />
      </div>
    </div>
  );
}
