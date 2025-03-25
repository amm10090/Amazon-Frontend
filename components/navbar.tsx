"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Input, Link, Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { siteConfig } from "@/config/site";
import { useProductSearch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils";

// Animation variants
const navbarVariants = {
  initial: { height: 80 },
  scrolled: { height: 64 }
};

const _searchIconVariants = {
  initial: { rotate: 0 },
  animate: { rotate: 360 }
};

const menuItemVariants = {
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

export const Navbar = () => {
  const router = useRouter();
  const [_isSearchFocused, _setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 限制预览搜索结果的数量
  const previewLimit = 5;

  // 使用Hook搜索产品
  const { data: searchResults, isLoading } = useProductSearch({
    keyword: searchKeyword,
    page: 1,
    page_size: previewLimit,
    sort_by: "relevance"
  });

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

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial="initial"
      animate={isScrolled ? "scrolled" : "initial"}
      variants={navbarVariants}
      transition={{ duration: 0.3 }}
    >
      <HeroUINavbar
        maxWidth="xl"
        position="sticky"
        className={`bg-background/80 backdrop-blur-lg border-b border-divider/50 transition-all duration-300 ${isScrolled ? "shadow-md" : ""
          }`}
      >
        {/* Logo and Search Bar Content - Left Side */}
        <NavbarContent className="flex flex-1 items-center gap-4" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit mr-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <NextLink className="flex justify-start items-center gap-1" href="/">
                <motion.span
                  className="font-bold text-xl bg-linear-to-r from-[#81D8F7] via-[#62B6D9] to-[#81D8F7] bg-clip-text text-transparent whitespace-nowrap bg-[length:200%_100%]"
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

          {/* Search Bar */}
          <div className="relative max-w-xl w-full" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit}>
              <Input
                ref={searchInputRef}
                aria-label="Search"
                classNames={{
                  base: "w-full",
                  inputWrapper: "bg-white shadow-md border-none rounded-full px-6 py-2.5 focus:outline-none focus:border-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none",
                  input: "text-sm focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
                }}
                placeholder="Search for deals, brands, or products..."
                size="md"
                type="search"
                value={searchKeyword}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSearchPreview(searchKeyword.length > 0)}
              />
              <Button
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#F39C12] hover:bg-[#E67E22] text-white font-medium rounded-full px-6 py-2 opacity-100 hover:opacity-100"
                size="sm"
                type="submit"
              >
                Search
              </Button>
            </form>

            {/* 搜索预览下拉菜单 */}
            <AnimatePresence>
              {showSearchPreview && searchKeyword.length > 0 && (
                <motion.div
                  variants={searchDropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : !searchResults?.items?.length ? (
                    <div className="p-4 text-center text-gray-500">
                      No matching products found
                    </div>
                  ) : (
                    <>
                      <div className="p-2">
                        {searchResults.items.slice(0, previewLimit).map((product) => (
                          <div
                            key={product.asin || `product-${Math.random()}`}
                            className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
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
                              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 mr-3 relative">
                                <Image
                                  src={product.main_image}
                                  alt={product.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.title}
                              </p>
                              <div className="flex items-center mt-1">
                                {product.offers && product.offers[0] && (
                                  <span className="text-sm font-bold text-green-600">
                                    {formatPrice(product.offers[0].price)}
                                  </span>
                                )}
                                {product.offers && product.offers[0]?.savings_percentage && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                    {product.offers[0].savings_percentage}% OFF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className="p-3 bg-gray-50 text-center hover:bg-gray-100 cursor-pointer border-t"
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
                        <span className="text-sm font-medium text-blue-600">
                          View all {searchResults.total} results
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
        <NavbarContent className="flex" justify="end">
          {/* Desktop navigation menu */}
          <NavbarItem className="hidden sm:flex gap-4">
            {siteConfig.navItems.map((item) => (
              <NextLink
                key={item.href}
                href={item.href}
                className="text-default-600 font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </NextLink>
            ))}
          </NavbarItem>
          <NavbarItem className="sm:hidden ml-2">
            <motion.div
              whileTap={{ scale: 0.9 }}
            >
              <NavbarMenuToggle
                className="w-10 h-10 p-2 -mr-2 text-default-500 bg-default-100/50 hover:bg-default-200/70 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </motion.div>
          </NavbarItem>
        </NavbarContent>

        <AnimatePresence>
          {isMenuOpen && (
            <NavbarMenu className="pt-6 pb-6 gap-4 shadow-lg">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-4 mt-2 flex flex-col gap-4"
              >
                {siteConfig.navMenuItems.map((item, index) => (
                  <motion.div
                    key={item.label || `menu-item-${item.href}`}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <NavbarMenuItem>
                      <Link
                        className="w-full px-4 py-3 text-lg hover:bg-default-100 rounded-lg transition-colors relative overflow-hidden"
                        href={item.href}
                        size="lg"
                      >
                        {item.label}
                      </Link>
                    </NavbarMenuItem>
                  </motion.div>
                ))}
              </motion.div>
            </NavbarMenu>
          )}
        </AnimatePresence>
      </HeroUINavbar>
    </motion.div>
  );
};
