"use client";

import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useSocialLinks } from '@/lib/hooks';

const Footer = () => {
    const { data: socialLinks } = useSocialLinks();

    // Social media icons configuration
    const socialIcons = {
        twitter: Twitter,
        facebook: Facebook,
        instagram: Instagram,
        youtube: Youtube,
        linkedin: Linkedin,
        pinterest: (props: React.SVGProps<SVGSVGElement>) => (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                {...props}
            >
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12Z" />
            </svg>
        ),
    };

    return (
        <footer className="bg-background border-t border-text/10 pt-12 pb-6">
            <div className="container mx-auto px-6">
                {/* Main content area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Us */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-primary">About Us</h3>
                        <div>
                            <Link href="/about-us" className="hover:text-primary transition-colors duration-200 inline-flex items-center gap-1">
                                <Image
                                    src="/logo.svg"
                                    alt="Oohunt Logo"
                                    width={120}
                                    height={32}
                                    className="object-contain inline-block"
                                />
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
                                <Link href="/terms-of-use" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Terms of Use
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies-policy" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Cookies Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/disclaimer" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Disclaimer
                                </Link>
                            </li>
                            <li>
                                <Link href="/affiliate-disclosure" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
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
                                <Link href="/email-subscription-terms" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Email Subscription Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact-us" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>

                        <h3 className="text-lg font-bold mb-4 text-primary">Connect</h3>
                        <div className="flex space-x-4">
                            {Object.entries(socialLinks || {}).map(([platform, url]) => {
                                if (!url || !socialIcons[platform as keyof typeof socialIcons]) return null;

                                const Icon = socialIcons[platform as keyof typeof socialIcons];

                                return (
                                    <a
                                        key={platform}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200"
                                        aria-label={`Follow us on ${platform}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-800 my-8" />

                {/* Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} Oohunt. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">
                        <Link href="/" className="hover:text-primary transition-colors duration-200 inline-flex items-center">
                            Oohunt
                        </Link> - Finding the best deals for you
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 