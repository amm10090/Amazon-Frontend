import { title } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className={`${title()} text-[#2C3E50] mb-4`}>About OOHUNT</h1>
        <p className="text-xl text-[#1A5276] max-w-2xl mx-auto">
          Track the best deals, promotions, and coupons from Amazon, Walmart, Target, and more - Your one-stop shopping experience
        </p>
      </div>

      {/* About Us */}
      <div className="bg-[#F5F7FA] p-8 rounded-2xl shadow-md mb-10 border border-[#E5E7E9]">
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Our Story</h2>
        <p className="text-[#1A5276] mb-4">
          OOHUNT was born from a passion for simplifying the online shopping experience. With hundreds of e-commerce platforms and endless products, finding genuine deals has become increasingly challenging. We created OOHUNT to provide consumers with a one-stop platform to easily find the best deals in the market.
        </p>
        <p className="text-[#1A5276]">
          Our technology continuously scans products from major retailers, updating prices and offers in real-time to ensure you never miss a deal.
        </p>
      </div>

      {/* Our Mission */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-1 bg-[#AED6F1] p-6 rounded-2xl shadow-md border border-[#E5E7E9] transition-transform hover:scale-105">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-3">Our Mission</h2>
          <p className="text-[#1A5276]">
            To help consumers make informed decisions while shopping online, saving both time and money. We are committed to providing transparent, accurate price comparisons and deal information.
          </p>
        </div>
        <div className="flex-1 bg-[#F5F7FA] p-6 rounded-2xl shadow-md border border-[#E5E7E9] transition-transform hover:scale-105">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-3">Our Vision</h2>
          <p className="text-[#1A5276]">
            To become the most trusted source for deals and offers in online shopping, enabling every consumer to purchase their desired products at the best possible prices.
          </p>
        </div>
      </div>

      {/* Our Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">OOHUNT Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F5F7FA] p-6 rounded-2xl text-center shadow-md border border-[#E5E7E9] transition-all hover:shadow-lg">
            <div className="w-16 h-16 bg-[#F39C12] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Real-time Price Tracking</h3>
            <p className="text-[#1A5276]">Stay updated with the latest price changes and promotions to catch limited-time offers</p>
          </div>

          <div className="bg-[#F5F7FA] p-6 rounded-2xl text-center shadow-md border border-[#E5E7E9] transition-all hover:shadow-lg">
            <div className="w-16 h-16 bg-[#16A085] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Multi-Platform Comparison</h3>
            <p className="text-[#1A5276]">Compare prices across multiple platforms with a single search to find the best deals</p>
          </div>

          <div className="bg-[#F5F7FA] p-6 rounded-2xl text-center shadow-md border border-[#E5E7E9] transition-all hover:shadow-lg">
            <div className="w-16 h-16 bg-[#1A5276] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Price Drop Alerts</h3>
            <p className="text-[#1A5276]">Set price alerts and be the first to know when products you&apos;re watching go on sale</p>
          </div>
        </div>
      </div>

      {/* Contact Us */}
      <div className="bg-[#F5F7FA] p-8 rounded-2xl shadow-md text-center mb-10 border border-[#E5E7E9]">
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Questions? Contact Us</h2>
        <p className="text-[#1A5276] mb-6">
          Our team is ready to help you with any questions or support you need
        </p>
        <button className="px-6 py-3 bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}
