import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-background border-t border-text/10">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* 关于我们 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">关于我们</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="nav-link">
                                    关于AmazonDeals
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="nav-link">
                                    联系我们
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="nav-link">
                                    隐私政策
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 帮助中心 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">帮助中心</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/faq" className="nav-link">
                                    常见问题
                                </Link>
                            </li>
                            <li>
                                <Link href="/guide" className="nav-link">
                                    使用指南
                                </Link>
                            </li>
                            <li>
                                <Link href="/feedback" className="nav-link">
                                    意见反馈
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 商品分类 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">商品分类</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/category/electronics" className="nav-link">
                                    电子产品
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/fashion" className="nav-link">
                                    时尚服饰
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/home" className="nav-link">
                                    家居生活
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 关注我们 */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">关注我们</h3>
                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                aria-label="微信"
                            >
                                <span className="text-xl">📱</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                aria-label="微博"
                            >
                                <span className="text-xl">💬</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                                aria-label="抖音"
                            >
                                <span className="text-xl">🎵</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 版权信息 */}
                <div className="mt-8 pt-8 border-t border-text/10 text-center text-sm text-text-light">
                    <p>© 2024 AmazonDeals. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 