
import Link from "next/link";

import { title } from "@/components/primitives";

export default function AboutPage() {
  const features = [
    {
      id: 1,
      icon: "search",
      title: "Discover Products on Sale",
      description: "We continuously identify products with active discounts across major retailers, focusing on finding genuine deals worth your attention.",
      gradient: "from-[#F39C12] to-[#F1C40F]"
    },
    {
      id: 2,
      icon: "check",
      title: "Verify Discounts in Real-Time",
      description: "Before presenting any deal, our technology confirms it's current and accurate, rechecking prices at regular intervals.",
      gradient: "from-[#16A085] to-[#1ABC9C]"
    },
    {
      id: 3,
      icon: "list",
      title: "Organize Deals by Categories",
      description: "We categorize discounts to help you quickly find exactly what you're looking for.",
      gradient: "from-[#1A5276] to-[#2980B9]"
    },
    {
      id: 4,
      icon: "bell",
      title: "Price Drop Alerts",
      description: "When products you're interested in go on sale, we can notify you immediately.",
      gradient: "from-[#8E44AD] to-[#9B59B6]"
    }
  ];

  const technologies = [
    {
      id: 1,
      title: "Real-Time Data Collection",
      description: "Our advanced monitoring system continuously tracks pricing information from various online retailers to gather accurate, up-to-date data."
    },
    {
      id: 2,
      title: "Smart Deal Verification",
      description: "Our backend systems continuously verify deals, ensuring what you see is what you get."
    },
    {
      id: 3,
      title: "Scalable Infrastructure",
      description: "Our robust database and infrastructure allow us to process thousands of products simultaneously, with plans to expand to more e-commerce platforms."
    }
  ];

  const commitments = [
    {
      id: 1,
      title: "Transparency",
      description: "We clearly show original prices alongside discounted prices so you can see the true value."
    },
    {
      id: 2,
      title: "Relevance",
      description: "We focus on quality deals rather than overwhelming you with every minor discount."
    },
    {
      id: 3,
      title: "Simplicity",
      description: "Our user-friendly interface makes finding deals straightforward and enjoyable."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA]">
      {/* Header Section */}
      <div className="relative text-center py-16">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl" />
        </div>
        <h1 className={`${title()} text-[#2C3E50] mb-6 relative z-10`}>About Oohunt</h1>
        <p className="text-xl text-[#1A5276] max-w-2xl mx-auto leading-relaxed relative z-10">
          Uncovering the Best Deals Online - Your one-stop shopping experience
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-10">
        {/* Story Section */}
        <div className="bg-white p-10 rounded-3xl shadow-lg mb-12 border border-[#E5E7E9] hover:shadow-xl transition-shadow">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Our Story</h2>
          <p className="text-[#1A5276] mb-6 leading-relaxed">
            At Oohunt, we&apos;re passionate about transforming the way you shop online. In today&apos;s vast digital marketplace with countless e-commerce platforms, finding genuine deals has become increasingly challenging. That&apos;s why we created Oohunt—your trusted companion for discovering the best discounts and sales across the web.
          </p>
          <p className="text-[#1A5276] mb-6 leading-relaxed">
            Oohunt was born from a simple observation: online shoppers were spending too much time hunting for the best prices. Our founders, frustrated by constantly missing flash sales and limited-time offers, envisioned a solution that would make smart shopping effortless.
          </p>
          <p className="text-[#1A5276] leading-relaxed">
            What started as a simple deal-finding tool has evolved into a comprehensive platform that connects savvy shoppers with real-time discounts from multiple online retailers. We&apos;ve built sophisticated technology that continuously monitors product prices and availability, ensuring you never miss an opportunity to save.
          </p>
        </div>

        {/* Mission & Vision */}
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

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-8 text-center">How Oohunt Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="group bg-white p-8 rounded-3xl text-center shadow-lg border border-[#E5E7E9] transition-all hover:shadow-xl">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:rotate-6`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {feature.icon === "search" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    )}
                    {feature.icon === "check" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    )}
                    {feature.icon === "list" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    )}
                    {feature.icon === "bell" && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    )}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{feature.title}</h3>
                <p className="text-[#1A5276] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-8">Our Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {technologies.map((tech) => (
              <div key={tech.id} className="bg-white p-8 rounded-3xl shadow-lg border border-[#E5E7E9] hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">{tech.title}</h3>
                <p className="text-[#1A5276] leading-relaxed">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Section */}
        <div className="mb-16 bg-white p-10 rounded-3xl shadow-lg border border-[#E5E7E9]">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-8">Our Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commitments.map((commitment) => (
              <div key={commitment.id} className="p-6 border-l-4 border-[#F39C12]">
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{commitment.title}</h3>
                <p className="text-[#1A5276] leading-relaxed">{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Future Section */}
        <div className="mb-16 bg-white p-10 rounded-3xl shadow-lg text-center border border-[#E5E7E9]">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Looking Forward</h2>
          <p className="text-[#1A5276] leading-relaxed max-w-3xl mx-auto">
            We&apos;re continuously expanding our reach across the e-commerce landscape. Our vision is to become your one-stop destination for all online shopping deals, saving you both time and money on every purchase.
          </p>
        </div>

        {/* Contact/CTA Section */}
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center border border-[#E5E7E9]">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Join the Oohunt Community</h2>
          <p className="text-[#1A5276] mb-8 leading-relaxed">
            Become part of the growing community of smart shoppers who rely on Oohunt to enhance their online shopping experience.
          </p>
          <Link
            href="/contact-us"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#F39C12] to-[#E67E22] hover:from-[#E67E22] hover:to-[#D35400] text-white font-medium rounded-full transition-all hover:shadow-lg transform hover:-translate-y-1"
          >
            Contact Support
          </Link>
          <p className="mt-6 text-[#1A5276] italic">Oohunt – Shop smarter, not harder.</p>
        </div>
      </div>
    </div>
  );
}
