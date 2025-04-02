"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Input, Link, Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import AuthStatus from "@/components/auth/AuthStatus";
import { siteConfig } from "@/config/site";
import { useProductSearch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

// Animation variants
const navbarVariants = {
  initial: { height: "auto" },
  scrolled: { height: 64 }
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

// 平板搜索框动画
const tabletSearchVariants = {
  hidden: { opacity: 0, width: 0, x: 20 },
  visible: { opacity: 1, width: "100%", x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, width: 0, x: 20, transition: { duration: 0.2 } }
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
  const [isMounted, setIsMounted] = useState(false);

  // 限制预览搜索结果的数量
  const previewLimit = 5;

  // 使用Hook搜索产品
  const { data: searchResults, isLoading } = useProductSearch({
    keyword: searchKeyword,
    page: 1,
    page_size: previewLimit,
    sort_by: "relevance"
  });

  // 使用useEffect确保组件已挂载
  useEffect(() => {
    setIsMounted(true);
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
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280;

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

  return (
    <motion.div
      initial={false}
      animate={isMounted && isScrolled ? "scrolled" : "initial"}
      variants={navbarVariants}
      transition={{ duration: 0.3 }}
      className="w-full relative z-[100]"
    >
      {/* 添加全局样式 */}
      <style jsx global>{searchInputStyles}</style>

      <HeroUINavbar
        maxWidth="full"
        className={`bg-background/80 backdrop-blur-lg border-b border-divider/50 transition-all duration-300 ${isScrolled ? "shadow-md" : ""
          }`}
        position="sticky"
      >
        <div className="max-w-[1400px] mx-auto px-0 flex items-center justify-between w-full relative z-[110]">
          {/* Logo and Search Bar Content - Left Side */}
          <NavbarContent className="flex flex-1 items-center gap-0 md:gap-1 lg:gap-2 px-0 pl-4" justify="start">
            {/* Logo - Always visible */}
            <NavbarBrand as="li" className="gap-0 max-w-fit mr-1 md:mr-2 lg:mr-3 flex-shrink-0">
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
            <div className="hidden xl:block relative w-full xl:max-w-[350px] 2xl:max-w-[450px]" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="w-full">
                <Input
                  ref={searchInputRef}
                  aria-label="Search"
                  classNames={{
                    base: "w-full",
                    inputWrapper: "bg-white/90 shadow-sm border border-gray-200 rounded-full xl:h-9 2xl:h-10 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                    input: "text-xs xl:text-sm focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 xl:pr-16 2xl:pr-20 search-input h-full"
                  }}
                  placeholder="Search deals..."
                  size="sm"
                  type="search"
                  value={searchKeyword}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchPreview(searchKeyword.length > 0)}
                />
                <Button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full xl:h-7 2xl:h-8 xl:px-3 2xl:px-4 xl:text-xs 2xl:text-sm transition-colors duration-200 flex items-center justify-center"
                  size="sm"
                  type="submit"
                >
                  Hunt
                </Button>
              </form>

              {/* Desktop Search Preview */}
              <AnimatePresence>
                {showSearchPreview && searchKeyword.length > 0 && (
                  <motion.div
                    variants={searchDropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute z-[9999] w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
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
                              className="flex items-center p-1.5 sm:p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
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
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 mr-2 relative">
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
                                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-red-100 text-red-600 px-1 sm:px-1.5 py-0.5 rounded-full">
                                      {product.offers[0].savings_percentage}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="p-2 sm:p-3 bg-gray-50 text-left hover:bg-gray-100 cursor-pointer border-t"
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
          </NavbarContent>

          {/* Navigation Menu Content - Right Side */}
          <NavbarContent className="flex items-center gap-0 md:gap-0.5 px-0 " justify="end">
            {/* Desktop Navigation */}
            <NavbarItem className="hidden xl:flex items-center xl:gap-1 2xl:gap-2 flex-shrink-0 ml-2 xl:ml-4">
              {siteConfig.navItems
                // 只显示不是当前页面的导航项
                .filter(item => !isCurrentPage(item.href))
                .map((item) => (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className="text-black xl:text-sm font-medium hover:text-primary transition-colors whitespace-nowrap px-2 xl:px-3"
                  >
                    {item.label}
                  </NextLink>
                ))}
            </NavbarItem>

            {/* Auth Status - Desktop */}
            <div className="hidden xl:block flex-shrink-0 xl:ml-0 2xl:ml-1 xl:min-w-[80px] 2xl:min-w-[100px]">
              <AuthStatus />
            </div>

            {/* 平板搜索框组件 - 重新放置在这里，位于右侧内容中 */}
            <AnimatePresence>
              {isTabletSearchOpen && (
                <motion.div
                  className="hidden md:block xl:hidden relative mr-2"
                  variants={tabletSearchVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ maxWidth: "320px", minWidth: "280px" }}
                >
                  <form onSubmit={handleSearchSubmit} className="w-full max-w-[1400px]">
                    <Input
                      ref={searchInputRef}
                      aria-label="Search"
                      classNames={{
                        base: "w-full",
                        inputWrapper: "bg-white/90 shadow-sm border border-gray-200 rounded-full h-11 px-3 md:px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                        input: "text-sm focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 pr-24 search-input h-full"
                      }}
                      placeholder="Search deals..."
                      size="sm"
                      type="search"
                      value={searchKeyword}
                      onChange={handleSearchInputChange}
                      onFocus={() => setShowSearchPreview(searchKeyword.length > 0)}
                    />
                    <Button
                      className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full h-9 px-5 text-sm transition-colors duration-200 flex items-center justify-center"
                      size="sm"
                      type="submit"
                    >
                      Search
                    </Button>
                  </form>

                  {/* 平板搜索预览 */}
                  <AnimatePresence>
                    {showSearchPreview && searchKeyword.length > 0 && (
                      <motion.div
                        variants={searchDropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute z-[9999] w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
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
                                  className="flex items-center p-1.5 sm:p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
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
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 mr-2 relative">
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
                                        <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-red-100 text-red-600 px-1 sm:px-1.5 py-0.5 rounded-full">
                                          {product.offers[0].savings_percentage}% OFF
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div
                              className="p-2 sm:p-3 bg-gray-50 text-left hover:bg-gray-100 cursor-pointer border-t"
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* 平板搜索按钮，改进位置和样式 */}
            {!isTabletSearchOpen && (
              <NavbarItem className="hidden md:flex xl:hidden">
                <Button
                  className="min-w-unit-8 w-8 h-8 bg-transparent hover:bg-default-100 text-default-500"
                  isIconOnly
                  variant="light"
                  onPress={toggleSearch}
                >
                  <Search size={20} />
                </Button>
              </NavbarItem>
            )}

            {/* 平板搜索关闭按钮 */}
            {isTabletSearchOpen && (
              <NavbarItem className="hidden md:flex xl:hidden">
                <Button
                  className="min-w-unit-8 w-8 h-8 bg-transparent hover:bg-default-100 text-default-500"
                  isIconOnly
                  variant="light"
                  onPress={toggleSearch}
                >
                  <span className="text-xl font-bold">&times;</span>
                </Button>
              </NavbarItem>
            )}

            {/* Mobile & Tablet Menu Button */}
            <NavbarItem className="md:flex xl:hidden">
              <NavbarMenuToggle
                icon={<Menu size={20} />}
                className="w-8 h-8 p-1.5 text-default-500 bg-default-100/50 hover:bg-default-200/70 rounded-lg"
              />
            </NavbarItem>

            {/* Mobile Search Button */}
            <NavbarItem className="md:hidden">
              <Button
                className="min-w-unit-8 w-8 h-8 bg-transparent hover:bg-default-100 text-default-500"
                isIconOnly
                variant="light"
                onPress={toggleSearch}
              >
                <Search size={20} />
              </Button>
            </NavbarItem>
          </NavbarContent>

          {/* Mobile Search Overlay */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-x-0 top-full mt-2 px-0 pb-4 bg-white shadow-lg md:hidden z-50"
              >
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[1400px] mx-auto px-4">
                  <Input
                    ref={searchInputRef}
                    aria-label="Search"
                    classNames={{
                      base: "w-full",
                      inputWrapper: "bg-white/90 shadow-sm border border-gray-200 rounded-full h-11 px-3 md:px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                      input: "text-sm pr-12 focus:outline-none focus:ring-0 focus-visible:outline-none search-input h-full"
                    }}
                    placeholder="Search deals..."
                    size="sm"
                    type="search"
                    value={searchKeyword}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSearchPreview(searchKeyword.length > 0)}
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                    <Button
                      className="bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full w-8 h-8 min-w-unit-8 p-0 flex items-center justify-center"
                      size="sm"
                      type="submit"
                      isIconOnly
                    >
                      <Search size={16} />
                    </Button>
                  </div>
                </form>

                {/* Mobile Search Preview */}
                <AnimatePresence>
                  {showSearchPreview && searchKeyword.length > 0 && (
                    <motion.div
                      variants={searchDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-2 bg-white rounded-lg border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto absolute left-4 right-4 z-[9999] shadow-md"
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
                                className="flex items-center p-1.5 sm:p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
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
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 mr-2 relative">
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
                                      <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-red-100 text-red-600 px-1 sm:px-1.5 py-0.5 rounded-full">
                                        {product.offers[0].savings_percentage}% OFF
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div
                            className="p-2 sm:p-3 bg-gray-50 text-left hover:bg-gray-100 cursor-pointer border-t"
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <NavbarMenu className="pt-4 pb-4 bg-background/95 backdrop-blur-lg text-left z-[120]">
            <div className="px-4 flex flex-col max-w-[1400px] ml-0">
              <h3 className="text-gray-500 text-sm font-medium mb-2 mt-1 text-left">Menu</h3>

              <div className="flex flex-col space-y-1 mb-4">
                {siteConfig.navMenuItems
                  .filter(item => !isCurrentPage(item.href))
                  .map((item, _index) => (
                    <Link
                      key={item.label || `menu-item-${item.href}`}
                      className="w-full px-3 py-2.5 text-base text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
              </div>

              {/* Mobile Auth Status */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-gray-500 text-sm font-medium mb-2 mt-1 text-left">Account</h3>
                <div className="flex w-full">
                  <AuthStatus isMobileMenu={true} />
                </div>
              </div>
            </div>
          </NavbarMenu>
        </div>
      </HeroUINavbar>

      {/* 在页面顶部，导航栏下方添加全屏搜索框 */}
      <div className="w-full px-0 py-3 bg-white shadow-sm xl:hidden md:hidden" style={{ display: isSearchOpen ? 'block' : 'none' }}>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[1400px] mx-auto px-4">
          <Input
            ref={searchInputRef}
            aria-label="Search"
            classNames={{
              base: "w-full",
              inputWrapper: "bg-white/90 shadow-sm border border-gray-200 rounded-full h-11 px-3 md:px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
              input: "text-sm pr-12 focus:outline-none focus:ring-0 focus-visible:outline-none search-input h-full"
            }}
            placeholder="Search deals..."
            size="sm"
            type="search"
            value={searchKeyword}
            onChange={handleSearchInputChange}
            onFocus={() => setShowSearchPreview(searchKeyword.length > 0)}
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <Button
              className="bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full w-8 h-8 min-w-unit-8 p-0 flex items-center justify-center"
              size="sm"
              type="submit"
              isIconOnly
            >
              <Search size={16} />
            </Button>
          </div>
        </form>

        {/* 移动端搜索预览 */}
        <AnimatePresence>
          {showSearchPreview && searchKeyword.length > 0 && (
            <motion.div
              variants={searchDropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-2 bg-white rounded-lg border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto absolute left-4 right-4 z-[130] shadow-md"
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
                        className="flex items-center p-1.5 sm:p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
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
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 mr-2 relative">
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
                              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-red-100 text-red-600 px-1 sm:px-1.5 py-0.5 rounded-full">
                                {product.offers[0].savings_percentage}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="p-2 sm:p-3 bg-gray-50 text-left hover:bg-gray-100 cursor-pointer border-t"
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
    </motion.div>
  );
};