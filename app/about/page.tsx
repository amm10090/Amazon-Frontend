import { title } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] flex justify-center">
      <div className="w-full max-w-7xl px-4 py-8 md:py-10">
        {/* Title Section */}
        <div className="relative text-center mb-16">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl" />
          </div>
          <h1 className={`${title()} text-[#2C3E50] mb-6 relative z-10`}>About OOHUNT</h1>
          <p className="text-xl text-[#1A5276] max-w-2xl mx-auto leading-relaxed relative z-10">
            Track the best deals, promotions, and coupons from Amazon, Walmart, Target, and more - Your one-stop shopping experience
          </p>
        </div>

        {/* About Us */}
        <div className="bg-white p-10 rounded-3xl shadow-lg mb-12 border border-[#E5E7E9] hover:shadow-xl transition-shadow">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Our Story</h2>
          <p className="text-[#1A5276] mb-6 leading-relaxed">
            OOHUNT was born from a passion for simplifying the online shopping experience. With hundreds of e-commerce platforms and endless products, finding genuine deals has become increasingly challenging. We created OOHUNT to provide consumers with a one-stop platform to easily find the best deals in the market.
          </p>
          <p className="text-[#1A5276] leading-relaxed">
            Our technology continuously scans products from major retailers, updating prices and offers in real-time to ensure you never miss a deal.
          </p>
        </div>

        {/* Our Mission & Vision */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1 bg-white p-8 rounded-3xl shadow-lg border border-[#E5E7E9] transform transition-all hover:scale-102 hover:shadow-xl">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Our Mission</h2>
            <p className="text-[#1A5276] leading-relaxed">
              To help consumers make informed decisions while shopping online, saving both time and money. We are committed to providing transparent, accurate price comparisons and deal information.
            </p>
          </div>
          <div className="flex-1 bg-white p-8 rounded-3xl shadow-lg border border-[#E5E7E9] transform transition-all hover:scale-102 hover:shadow-xl">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Our Vision</h2>
            <p className="text-[#1A5276] leading-relaxed">
              To become the most trusted source for deals and offers in online shopping, enabling every consumer to purchase their desired products at the best possible prices.
            </p>
          </div>
        </div>

        {/* Our Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-8 text-center">OOHUNT Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-3xl text-center shadow-lg border border-[#E5E7E9] transition-all hover:shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-[#F39C12] to-[#F1C40F] rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Real-time Price Tracking</h3>
              <p className="text-[#1A5276] leading-relaxed">Stay updated with the latest price changes and promotions to catch limited-time offers</p>
            </div>

            <div className="group bg-white p-8 rounded-3xl text-center shadow-lg border border-[#E5E7E9] transition-all hover:shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-[#16A085] to-[#1ABC9C] rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Multi-Platform Comparison</h3>
              <p className="text-[#1A5276] leading-relaxed">Compare prices across multiple platforms with a single search to find the best deals</p>
            </div>

            <div className="group bg-white p-8 rounded-3xl text-center shadow-lg border border-[#E5E7E9] transition-all hover:shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-[#1A5276] to-[#2980B9] rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:rotate-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Price Drop Alerts</h3>
              <p className="text-[#1A5276] leading-relaxed">Set price alerts and be the first to know when products you&apos;re watching go on sale</p>
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center mb-10 border border-[#E5E7E9]">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Questions? Contact Us</h2>
          <p className="text-[#1A5276] mb-8 leading-relaxed">
            Our team is ready to help you with any questions or support you need
          </p>
          <a
            href="mailto:oohuntofficial@gmail.com"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#F39C12] to-[#E67E22] hover:from-[#E67E22] hover:to-[#D35400] text-white font-medium rounded-full transition-all hover:shadow-lg transform hover:-translate-y-1"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
