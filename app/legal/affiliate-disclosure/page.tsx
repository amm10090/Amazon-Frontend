export const metadata = {
    title: 'Affiliate Disclosure - Oohunt',
    description: 'Information about our affiliate relationships',
};

export default function AffiliateDisclosurePage() {
    return (
        <>
            <h1 className="text-4xl font-bold mb-6">Affiliate Disclosure</h1>
            <p className="text-gray-500 mb-8">Last Updated: April 4, 2025</p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Disclosure Statement</h2>
                <p>
                    This website, <a href="https://oohunt.com" className="text-blue-600 hover:underline">Oohunt</a>, is owned and operated by Oohunt. We want to be completely transparent with our visitors regarding our relationship with other brands, products, and services that are featured on our website.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Our Affiliate Relationships</h2>
                <p>
                    Oohunt works with various brands, retailers, and affiliate networks. We participate in affiliate marketing programs, which means we may earn commissions from qualifying purchases made through our links to retailer sites.
                </p>
                <p className="mt-4">
                    When you click on links to various merchants on this site and make a purchase, this can result in our earning a commission. Affiliate programs and affiliations include, but are not limited to, the following:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Amazon Associates Program</li>
                    <li>ShareASale</li>
                    <li>Commission Junction</li>
                    <li>Awin</li>
                    <li>Impact Radius</li>
                    <li>Other direct brand affiliate programs</li>
                </ul>
                <p className="mt-4">
                    The affiliate commissions we receive help support the operation of this website and allow us to continue providing valuable content and product recommendations to our visitors.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                    <li>We recommend products, services, or brands on our website</li>
                    <li>You click on an affiliate link to the merchant&apos;s website</li>
                    <li>You make a purchase from the merchant</li>
                    <li>We receive a commission from the merchant at no additional cost to you</li>
                </ol>
                <p className="mt-4">
                    It&apos;s important to understand that when you click on our affiliate links and make purchases, you will not pay more for products or services. The price you pay remains the same whether you use our affiliate links or go directly to the merchant&apos;s website.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Our Commitment to You</h2>
                <p>
                    Despite our affiliate relationships, we are committed to providing honest, unbiased information and recommendations. Our primary goal is to help our visitors make informed purchasing decisions.
                </p>
                <p className="mt-4">
                    We only recommend products and services that we believe will provide value to our audience. Our opinions and reviews are based on our genuine assessment of the products and are not influenced by our affiliate partnerships.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Identification of Affiliate Links</h2>
                <p>
                    To help you identify when we use affiliate links, we will make reasonable efforts to mark such links or provide disclosures near product recommendations. However, you should assume that any links to products or services on our site may be affiliate links that generate commission.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Questions About Our Affiliate Relationships</h2>
                <p>
                    If you have any questions about our affiliate relationships or how we make money through affiliate programs, please contact us at:
                </p>
                <p className="mt-2">
                    Email: <a href="/legal/contact" className="text-blue-600 hover:underline">admin@oohunt.com</a><br />
                    Website: <a href="https://oohunt.com" className="text-blue-600 hover:underline">https://oohunt.com</a>
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">FTC Compliance Statement</h2>
                <p>
                    This disclosure complies with the Federal Trade Commission&apos;s guidelines concerning the use of affiliate programs and endorsements. For more information on the FTC guidelines, please visit the <a href="https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers" className="text-blue-600 hover:underline">Federal Trade Commission&apos;s website</a>.
                </p>
            </section>

            <p className="text-center text-gray-500 mt-10">
                Thank you for supporting Oohunt through your use of our affiliate links. We appreciate your trust and continued readership.
            </p>
        </>
    );
} 