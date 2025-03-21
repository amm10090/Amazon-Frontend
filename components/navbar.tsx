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
import { Button } from "@heroui/react";
import { Input } from "@heroui/react";
import { Link } from "@heroui/react";
import NextLink from "next/link";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";

export const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-background/80 dark:bg-default-100/80 backdrop-blur-lg border-b border-divider/50 dark:border-divider/30"
    >
      <NavbarContent className="flex gap-4 flex-1" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <span className="font-bold text-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] dark:from-[#FF8E8E] dark:to-[#FFA5A5] bg-clip-text text-transparent whitespace-nowrap">
              AmazonDeals
            </span>
          </NextLink>
        </NavbarBrand>
        <NavbarItem className="flex-1">
          <div className="w-full flex justify-start">
            <div
              className={`transition-all duration-300 ease-in-out ${isSearchFocused
                ? 'w-[calc(100vw-180px)] sm:w-[250px] md:w-[350px]'
                : 'w-[120px] sm:w-[180px] md:w-[250px]'
                }`}
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
                  <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
                }
                type="search"
                size="sm"
                variant="bordered"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <NavbarItem className="flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="sm:hidden">
          <Button
            className="w-10 h-10 -mr-2"
            isIconOnly
            variant="light"
            aria-label="open menu"
          >
            <NavbarMenuToggle />
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="pt-6 pb-6 gap-4 shadow-lg dark:shadow-dark">
        <div className="mx-4 mt-2 flex flex-col gap-4">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className="w-full px-4 py-3 text-lg hover:bg-default-100 dark:hover:bg-default-50 rounded-lg transition-colors"
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
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
