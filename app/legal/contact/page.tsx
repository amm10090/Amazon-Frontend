import type { Metadata } from "next";
import { FaFacebook, FaInstagram, FaPinterest, FaTwitter, FaYoutube } from "react-icons/fa";

export const metadata: Metadata = {
    title: "Contact Us - Oohunt",
    description: "Contact the Oohunt team, we look forward to hearing from you",
};

export default function ContactPage() {
    const socialLinks = [
        {
            name: 'Facebook',
            icon: FaFacebook,
            url: '#',
            color: 'bg-blue-600'
        },
        {
            name: 'Instagram',
            icon: FaInstagram,
            url: '#',
            color: 'bg-[#C13584]' // Instagram brand color
        },
        {
            name: 'Pinterest',
            icon: FaPinterest,
            url: '#',
            color: 'bg-[#E60023]' // Pinterest brand color
        },
        {
            name: 'Twitter',
            icon: FaTwitter,
            url: '#',
            color: 'bg-[#1DA1F2]' // Twitter brand color
        },
        {
            name: 'YouTube',
            icon: FaYoutube,
            url: '#',
            color: 'bg-[#FF0000]' // YouTube brand color
        }
    ];

    const faqs = [
        {
            question: "How does Oohunt find the best deals?",
            answer: "Our technology continuously monitors prices across major retailers, identifying discounts and verifying them in real-time to ensure you get accurate information."
        },
        {
            question: "Is Oohunt free to use?",
            answer: "Yes, Oohunt is completely free for all users. We help you find the best deals without any subscription fees or hidden costs."
        },
        {
            question: "How often are deals updated?",
            answer: "Our system updates prices and deals in real-time, ensuring you always have access to the most current information available."
        },
        {
            question: "Can I suggest a product to be tracked?",
            answer: "Absolutely! Feel free to email us with product suggestions, and we&apos;ll consider adding them to our tracking system."
        }
    ];

    return (
        <>
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-gray-500 mb-8">Get in touch with the Oohunt team</p>

            <section className="mb-8">
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>

                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Email Us</h3>
                        <p className="mb-2">
                            For any questions, suggestions, or feedback, please email us at:
                        </p>
                        <a
                            href="mailto:@oohunt.admincom"
                            className="text-xl text-blue-600 font-medium hover:underline"
                        >
                            admin@oohunt.com
                        </a>
                        <p className="mt-3 text-gray-600">
                            We typically respond to all inquiries within 2-3 business days.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-xl font-semibold mb-4">Send Us A Message</h3>
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="What is this regarding?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Please type your message here..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="mb-8 bg-gray-100 rounded-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Connect With Us</h2>
                    <p className="max-w-2xl mx-auto">
                        Follow us on social media to stay updated with the latest deals and promotions
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
                    {socialLinks.map((social) => {
                        const IconComponent = social.icon;

                        return (
                            <a
                                key={social.name}
                                href={social.url}
                                className={`${social.color} text-white w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Follow us on ${social.name}`}
                            >
                                <IconComponent size={20} />
                            </a>
                        );
                    })}
                </div>

                <div className="text-center mt-4 text-gray-600">
                    <p>Click on any of the icons above to visit our social media profiles</p>
                </div>
            </section>

            <section className="mb-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-semibold mb-6">About Oohunt</h2>
                    <p className="mb-4">
                        Oohunt helps consumers make informed decisions while shopping online, saving both time and money.
                        We are committed to providing transparent, accurate price comparisons and deal information.
                    </p>
                    <p>
                        Our platform continuously tracks prices and promotions from major retailers, alerting you when products
                        you&apos;re interested in go on sale, ensuring you never miss the best deals available.
                    </p>
                </div>
            </section>

            <section className="mb-8 bg-gray-100 rounded-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                    <p>
                        Find quick answers to common questions about Oohunt
                    </p>
                </div>

                <div>
                    {faqs.map((faq) => (
                        <div
                            key={faq.question}
                            className="bg-white rounded-lg shadow-md p-6 mb-4"
                        >
                            <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                            <p className="text-gray-700">{faq.answer}</p>
                        </div>
                    ))}

                    <div className="text-center mt-6">
                        <p>
                            Still have questions? <a href="mailto:admin@oohunt.com" className="text-blue-600 hover:underline">Email us</a> and we&apos;ll get back to you within 2-3 business days.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
} 