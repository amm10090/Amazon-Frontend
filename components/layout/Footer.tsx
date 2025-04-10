import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-background border-t border-text/10 pt-12 pb-6">
            <div className="container mx-auto px-6">
                {/* Main content area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Us */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-primary">About Us</h3>
                        <div>
                            <Link href="/about" className="hover:text-primary transition-colors duration-200">
                                About Oohunt
                            </Link>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Oohunt helps you find the best deals on products from Amazon and other retailers. We connect shoppers with the best prices and most trusted products.
                            </p>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-primary">Legal</h3>
                        <ul className="space-y-2">
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
                        </ul>
                    </div>

                    {/* Support & Connect */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-primary">Support</h3>
                        <ul className="space-y-2 mb-6">
                            <li>
                                <Link href="/legal/email-subscription-terms" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Email Subscription Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>

                        <h3 className="text-lg font-bold mb-4 text-primary">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                Twitter
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                Facebook
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>

                {/* Divider */}
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