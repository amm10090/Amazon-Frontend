"use client";

import {
  Navbar as HeroUINavbar,
  NavbarMenuToggle,
  NavbarBrand,
} from "@heroui/navbar";
import { Input, Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import AuthStatus from "@/components/auth/AuthStatus";
import { MobileSearch, MobileSearchButton } from "@/components/mobile";
import { MobileMenu } from "@/components/mobile/MobileMenu";
import { siteConfig } from "@/config/site";
import { useProductSearch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

// Animation variants
const navbarVariants = {
  initial: { height: "auto" },
  scrolled: { height: "64px" }
};

const _searchIconVariants = {
  initial: { rotate: 0 },
  animate: { rotate: 360 }
};

const _menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
  hover: { scale: 1.05 }
};

// 搜索下拉菜单动画
const searchDropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
};

// 添加自定义样式来隐藏搜索框的清除按钮
const searchInputStyles = `
  /* 隐藏搜索框的清除按钮 */
  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    display: none;
  }
  input[type="search"]::-ms-clear {
    display: none;
  }
`;

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [_isSearchFocused, _setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTabletSearchOpen, setIsTabletSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 限制预览搜索结果的数量
  const previewLimit = 5;

  // 使用Hook搜索产品
  const { data: searchResults, isLoading } = useProductSearch({
    keyword: searchKeyword,
    page: 1,
    page_size: previewLimit,
    sort_by: "relevance"
  });

  // 使用useEffect确保组件已挂载并延迟启用动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 初始检查

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 监听点击事件，当点击搜索框外部时关闭预览
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 处理搜索输入变化
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;

    setSearchKeyword(keyword);
    setShowSearchPreview(keyword.length > 0);
  };

  // 处理搜索表单提交
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (searchKeyword.trim()) {
      setShowSearchPreview(false);
      // 导航到搜索结果页面，带上搜索参数
      router.push(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  // 处理搜索预览项点击
  const handlePreviewItemClick = (productId: string | undefined) => {
    if (!productId) return;
    setShowSearchPreview(false);
    router.push(`/product/${productId}`);
  };

  // 优化触发搜索框显示/隐藏的函数
  const toggleSearch = () => {
    // 判断是移动端还是平板端
    const isTablet = window.matchMedia('(min-width: 768px) and (max-width: 1279px)').matches;

    if (isTablet) {
      setIsTabletSearchOpen(!isTabletSearchOpen);
    } else {
      setIsSearchOpen(!isSearchOpen);
    }

    // 自动聚焦搜索框
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // 检查导航项是否为当前页面
  const isCurrentPage = (href: string) => {
    // 主页特殊处理
    if (href === "/" && pathname === "/") {
      return true;
    }

    // 其他页面判断路径是否以href开头并且是完整的路径部分
    // 例如：/products 应该只匹配 /products 和 /products/，而不匹配 /products/123
    if (href !== "/") {
      return pathname === href || pathname === `${href}/`;
    }

    return false;
  };

  // 添加关闭所有面板的函数
  const closeAllPanels = () => {
    setIsSearchOpen(false);
    setIsTabletSearchOpen(false);
    setIsMenuOpen(false);
  };

  // 处理导航点击
  const handleNavigation = () => {
    closeAllPanels();
  };

  return (
    <motion.div
      initial={false}
      animate={shouldAnimate && isScrolled ? "scrolled" : "initial"}
      variants={navbarVariants}
      transition={{ duration: 0.3 }}
      className="w-full relative z-[9990]"
      style={{ height: "auto" }}
    >
      {/* 添加全局样式 */}
      <style jsx global>{searchInputStyles}</style>

      <HeroUINavbar
        maxWidth="full"
        className={`bg-background/80 backdrop-blur-lg border-b  transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}
        position="sticky"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* 外层容器 */}
        <div className="w-full flex justify-center">
          {/* 内容限宽容器 */}
          <div className="w-full max-w-[1500px] relative z-[9991]">
            {/* 导航栏主体 */}
            <div className="flex items-center justify-between w-full h-16  lg:px-8">
              {/* Logo and Search Bar Content - Left Side */}
              <div className="flex items-center gap-4 flex-1 lg:max-w-[800px]">
                {/* Mobile Menu */}
                <div className="flex items-center gap-2 xl:hidden">
                  <NavbarMenuToggle
                    icon={<Menu size={20} />}
                    className="w-8 h-8 p-1.5 text-white bg-gradient-to-r from-[#1B5479] to-[#287EB7] hover:opacity-90 rounded-lg lg:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  />
                </div>

                {/* 移动端居中 Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 lg:hidden">
                  <NavbarBrand as="li" className="flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <NextLink className="flex justify-start items-center gap-1" href="/">
                        <motion.span
                          className="font-bold text-lg md:text-xl bg-linear-to-r from-[#81D8F7] via-[#62B6D9] to-[#81D8F7] bg-clip-text text-transparent whitespace-nowrap bg-[length:200%_100%]"
                          animate={{
                            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          OOHUNT
                        </motion.span>
                      </NextLink>
                    </motion.div>
                  </NavbarBrand>
                </div>

                <div className="hidden lg:flex items-center gap-2 lg:gap-3">
                  {/* 桌面端 Logo */}
                  <NavbarBrand as="li" className="flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <NextLink className="flex justify-start items-center gap-1" href="/">
                        <motion.span
                          className="font-bold text-lg md:text-xl bg-linear-to-r from-[#81D8F7] via-[#62B6D9] to-[#81D8F7] bg-clip-text text-transparent whitespace-nowrap bg-[length:200%_100%]"
                          animate={{
                            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          OOHUNT
                        </motion.span>
                      </NextLink>
                    </motion.div>
                  </NavbarBrand>

                  {/* Desktop Search Bar */}
                  <div className="hidden lg:block flex-1 max-w-[500px] min-w-[300px]" ref={searchContainerRef}>
                    <form onSubmit={handleSearchSubmit} className="w-full relative group">
                      <Input
                        ref={searchInputRef}
                        aria-label="Search"
                        classNames={{
                          base: "w-full",
                          inputWrapper: "bg-white shadow-sm border border-gray-200 hover:border-gray-300 rounded-full h-10 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200",
                          input: "text-sm text-gray-900 border-0 outline-none focus:outline-none focus:ring-0 pr-[90px] h-full bg-transparent",
                          innerWrapper: "bg-transparent",
                          mainWrapper: "bg-transparent"
                        }}
                        placeholder="Search deals..."
                        size="sm"
                        type="search"
                        value={searchKeyword}
                        onChange={handleSearchInputChange}
                        onFocus={() => setShowSearchPreview(searchKeyword.length > 0)}
                        endContent={
                          <Button
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full h-8 px-4 text-sm transition-colors duration-200 flex items-center justify-center min-w-[80px]"
                            size="sm"
                            type="submit"
                          >
                            Hunt
                          </Button>
                        }
                      />
                    </form>

                    {/* Desktop Search Preview */}
                    <AnimatePresence>
                      {showSearchPreview && searchKeyword.length > 0 && (
                        <motion.div
                          variants={searchDropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute z-[9995] w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
                        >
                          {isLoading ? (
                            <div className="p-2 sm:p-3 text-left text-gray-500 text-xs sm:text-sm">
                              Searching...
                            </div>
                          ) : !searchResults?.items?.length ? (
                            <div className="p-2 sm:p-3 text-left text-gray-500 text-xs sm:text-sm">
                              No matching products found
                            </div>
                          ) : (
                            <>
                              <div className="p-1 sm:p-2">
                                {searchResults.items.slice(0, previewLimit).map((product) => (
                                  <div
                                    key={product.asin || `product-${Math.random()}`}
                                    className="flex items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                                    onClick={() => handlePreviewItemClick(product.asin)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handlePreviewItemClick(product.asin);
                                      }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View details for ${product.title}`}
                                  >
                                    {product.main_image && (
                                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 mr-2 relative">
                                        <Image
                                          src={product.main_image}
                                          alt={product.title}
                                          fill
                                          sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, 48px"
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                        {product.title}
                                      </p>
                                      <div className="flex items-center mt-0.5">
                                        {product.offers && product.offers[0] && (
                                          <span className="text-xs sm:text-sm font-bold text-green-600">
                                            {formatPrice(product.offers[0].price)}
                                          </span>
                                        )}
                                        {product.offers && product.offers[0]?.savings_percentage && (
                                          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-red-50 text-red-600 px-1 sm:px-1.5 py-0.5 rounded-full">
                                            {product.offers[0].savings_percentage}% OFF
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div
                                className="p-2 sm:p-3 bg-gray-50 text-left hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                                onClick={() => handleSearchSubmit()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSearchSubmit();
                                  }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label="View all search results"
                              >
                                <span className="text-xs sm:text-sm font-medium text-blue-600 text-left">
                                  View all {searchResults?.total || 0} results
                                </span>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Navigation Menu Content - Right Side */}
              <div className="hidden lg:flex items-center gap-6">
                {/* Desktop Navigation */}
                <nav className="flex items-center gap-4">
                  {siteConfig.navItems
                    .filter(item => !isCurrentPage(item.href))
                    .map((item) => (
                      <NextLink
                        key={item.href}
                        href={item.href}
                        className="text-gray-700 text-sm font-medium hover:text-primary transition-colors whitespace-nowrap px-2"
                      >
                        {item.label}
                      </NextLink>
                    ))}
                </nav>

                {/* Auth Status - Desktop */}
                <div className="flex-shrink-0">
                  <AuthStatus />
                </div>
              </div>

              {/* Mobile Search Button - Right Side */}
              <div className="flex items-center lg:hidden">
                <MobileSearchButton toggleSearch={toggleSearch} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isMenuOpen={isMenuOpen}
          isCurrentPage={isCurrentPage}
          handleNavigation={handleNavigation}
        />
      </HeroUINavbar>

      {/* Mobile Search */}
      <MobileSearch
        isSearchOpen={isSearchOpen}
        isTabletSearchOpen={isTabletSearchOpen}
        searchKeyword={searchKeyword}
        searchInputRef={searchInputRef}
        handleSearchSubmit={handleSearchSubmit}
        handleSearchInputChange={handleSearchInputChange}
        showSearchPreview={showSearchPreview}
        setShowSearchPreview={setShowSearchPreview}
        searchResults={searchResults}
        isLoading={isLoading}
        previewLimit={previewLimit}
        handlePreviewItemClick={handlePreviewItemClick}
      />
    </motion.div>
  );
};