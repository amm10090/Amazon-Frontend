import type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  description?: string;
  features?: string[];
  rating?: number;
  reviews?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface Deal extends Product {
  endTime: string;
  remainingQuantity: number;
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ComponentProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  category: string;
  description?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  url?: string;
  cj_url?: string;
  isPrime?: boolean;
  isFreeShipping?: boolean;
  isAmazonFulfilled?: boolean;
  availability?: string;
  couponValue?: number;
  couponType?: string | null;
  apiProvider?: string;
}
