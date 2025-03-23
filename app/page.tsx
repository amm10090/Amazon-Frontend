import { CategoryNavigation } from "@/components/ui/CategoryNavigation";
import { HeroSection } from "@/components/ui/HeroSection";
import { FeaturedDeals } from "@/components/ui/FeaturedDeals";
import { RecommendationCarousel } from "@/components/ui/RecommendationCarousel";

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
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-text-light">Recommended for you</span>
          </div>
        </div>

        {/* 个性化推荐轮播 */}
        <RecommendationCarousel title="You may also like" />

        {/* 品牌推荐区域 */}
        <div className="mt-4 p-6 bg-gradient-to-r from-secondary-light/10 to-tiffany/5 rounded-xl">
          <h2 className="text-2xl font-bold mb-6 text-primary text-center">Hot brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
            {["Apple", "Samsung", "Sony", "Nike", "Adidas", "Amazon"].map((brand) => (
              <div
                key={brand}
                className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <p className="text-lg font-medium text-text">{brand}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 底部广告条 */}
        <div className="mt-4 p-6 bg-gradient-primary rounded-xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">Download our APP for more deals!</h3>
          <p className="mb-4">Get the latest deals first-hand, don't miss any money-saving opportunity</p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 bg-white text-primary rounded-full font-medium hover:bg-white/90 transition-colors">
              App Store
            </button>
            <button className="px-6 py-2 bg-white text-primary rounded-full font-medium hover:bg-white/90 transition-colors">
              Google Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
