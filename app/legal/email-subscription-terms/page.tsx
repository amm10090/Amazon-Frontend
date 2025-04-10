import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Email Subscription Terms - Oohunt",
    description: "Email subscription terms and conditions for Oohunt users.",
};

export default function EmailSubscriptionTerms() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="prose dark:prose-invert max-w-none">
                <h1 className="text-3xl font-bold mb-8">Email Subscription Terms</h1>

                <div className="text-sm text-gray-500 mb-8">Last Updated: April 4, 2025</div>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                    <p className="mb-4">
                        These Email Subscription Terms (&quot;Terms&quot;) govern your subscription to email communications from{" "}
                        <a href="https://oohunt.com" className="text-primary hover:underline">
                            Oohunt
                        </a>{" "}
                        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By providing your email address and subscribing to our communications,
                        you acknowledge that you have read, understood, and agree to be bound by these Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Types of Email Communications</h2>
                    <p className="mb-4">
                        By subscribing to our email list, you may receive various types of communications from us, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li className="mb-2">Promotional emails featuring deals, discounts, and special offers on affiliate products</li>
                        <li className="mb-2">Product recommendations tailored to your interests and browsing history</li>
                        <li className="mb-2">Newsletter communications with industry news, product reviews, and comparisons</li>
                        <li className="mb-2">Website updates about new content, features, or services on our platform</li>
                        <li className="mb-2">Seasonal promotions during holidays, special events, or sales periods</li>
                        <li className="mb-2">Survey requests for feedback to improve our services</li>
                        <li className="mb-2">Affiliate product alerts when new products become available or prices change</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Frequency of Communications</h2>
                    <p className="mb-4">
                        We aim to send communications at a reasonable frequency to provide value without overwhelming your inbox.
                        Typically, this may include:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li className="mb-2">Regular newsletters (weekly or bi-weekly)</li>
                        <li className="mb-2">Promotional emails when notable deals become available</li>
                        <li className="mb-2">Special announcements for major sales events or website updates</li>
                    </ul>
                    <p>You can adjust your preferences or opt out of specific communication types at any time.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                    <p className="mb-4">
                        If you have questions or concerns about our Email Subscription Terms or practices, please contact us at:
                    </p>
                    <p className="mb-2">
                        Email:{" "}
                        <a href="/legal/contact" className="text-primary hover:underline">
                            admin@oohunt.com
                        </a>
                    </p>
                    <p>
                        Website:{" "}
                        <a href="https://oohunt.com" className="text-primary hover:underline">
                            https://oohunt.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
} 