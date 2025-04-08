import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-background border-t border-text/10 pt-12 pb-6">
            <div className="container mx-auto px-6">
                {/* 主要内容区域 */}
                <div className="flex flex-col md:flex-row justify-between gap-10">
                    {/* About Us */}
                    <div className="md:w-1/3">
                        <h3 className="text-lg font-bold mb-6 text-primary">About Us</h3>
                        <div className="pr-8">
                            <Link href="/about" className="hover:text-primary transition-colors duration-200">
                                About Oohunt
                            </Link>
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Oohunt helps you find the best deals on products from Amazon and other retailers. We connect shoppers with the best prices and most trusted products.
                            </p>
                        </div>
                    </div>

                    {/* Legal - 右对齐布局 */}
                    <div className="md:w-1/3">
                        <h3 className="text-lg font-bold mb-6 text-primary">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/legal/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Terms of Use
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/cookies" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Cookies Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/disclaimer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Disclaimer
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/affiliate-disclosure" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Affiliate Disclosure
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/email-subscription-terms" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Email Subscription Terms
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 分隔线 */}
                <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

                {/* Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} Oohunt. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">
                        <Link href="/" className="hover:text-primary transition-colors duration-200">
                            Oohunt
                        </Link> - Finding the best deals for you
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 