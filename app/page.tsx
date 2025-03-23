import { HeroSection } from "@/components/ui/HeroSection";
import { CategoryNavigation } from "@/components/ui/CategoryNavigation";
import { FeaturedDeals } from "@/components/ui/FeaturedDeals";
import { RecommendationCarousel } from "@/components/ui/RecommendationCarousel";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* 顶部英雄区域 */}
      <HeroSection />

      {/* 分类导航 */}
      <CategoryNavigation />

      {/* 限时特惠区域 */}
      <FeaturedDeals />

      {/* 分隔线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-text-light">为你推荐</span>
        </div>
      </div>

      {/* 个性化推荐轮播 */}
      <RecommendationCarousel title="猜你喜欢" />

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
        <h3 className="text-xl font-bold mb-2">下载我们的APP，获取更多优惠!</h3>
        <p className="mb-4">第一手获取最新优惠信息，不错过任何省钱机会</p>
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
  );
}
