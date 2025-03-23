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
import { Input , Link } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import NextLink from "next/link";
import { useState, useEffect } from "react";

import { SearchIcon } from "@/components/icons";
import { ThemeSwitch } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";

// 动画变体
const navbarVariants = {
  initial: { height: 80 },
  scrolled: { height: 64 }
};

const searchIconVariants = {
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

export const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 监听滚动
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
        className={`bg-background/80 dark:bg-default-100/80 backdrop-blur-lg border-b border-divider/50 dark:border-divider/30 transition-all duration-300 ${isScrolled ? "shadow-md" : ""
          }`}
      >
        <NavbarContent className="flex gap-4 flex-1" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
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
          {/* 桌面端导航菜单 */}
          <NavbarItem className="hidden sm:flex gap-4">
            {siteConfig.navItems.map((item, index) => (
              <NextLink
                key={`${item.href}-${index}`}
                href={item.href}
                className="text-default-600 font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </NextLink>
            ))}
          </NavbarItem>
          <NavbarItem className="flex-1">
            <div className="w-full flex justify-start">
              <motion.div
                initial={false}
                animate={{
                  width: isSearchFocused
                    ? "clamp(200px, 50vw, 400px)"
                    : "clamp(120px, 20vw, 200px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                }}
                className="relative"
              >
                <Input
                  aria-label="搜索商品"
                  classNames={{
                    inputWrapper: "bg-content1 dark:bg-content1/70",
                    input: "text-sm dark:text-white/90 truncate",
                    base: "w-full max-w-full"
                  }}
                  placeholder={isSearchFocused ? "搜索心仪的商品..." : "搜索心仪的..."}
                  startContent={
                    <motion.div
                      variants={searchIconVariants}
                      animate={isSearchFocused ? "animate" : "initial"}
                      transition={{ duration: 0.5 }}
                    >
                      <SearchIcon className="text-base text-default-400 pointer-events-none shrink-0" />
                    </motion.div>
                  }
                  type="search"
                  size="sm"
                  variant="bordered"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </motion.div>
            </div>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
          <NavbarItem className="flex gap-2">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="sm:hidden">
            <motion.div
              whileTap={{ scale: 0.9 }}
            >
              <NavbarMenuToggle
                className="w-10 h-10 p-2 -mr-2 text-default-500 bg-default-100/50 dark:bg-default-100/20 hover:bg-default-200/70 dark:hover:bg-default-100/40 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </motion.div>
          </NavbarItem>
        </NavbarContent>

        <AnimatePresence>
          {isMenuOpen && (
            <NavbarMenu className="pt-6 pb-6 gap-4 shadow-lg dark:shadow-dark">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-4 mt-2 flex flex-col gap-4"
              >
                {siteConfig.navMenuItems.map((item, index) => (
                  <motion.div
                    key={`${item}-${index}`}
                    custom={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <NavbarMenuItem>
                      <Link
                        className="w-full px-4 py-3 text-lg hover:bg-default-100 dark:hover:bg-default-50 rounded-lg transition-colors relative overflow-hidden"
                        color={
                          index === 2
                            ? "primary"
                            : index === siteConfig.navMenuItems.length - 1
                              ? "danger"
                              : "foreground"
                        }
                        href="#"
                        size="lg"
                      >
                        <motion.div
                          className="absolute inset-0 bg-current"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 0.1 }}
                          transition={{ duration: 0.3 }}
                        />
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
