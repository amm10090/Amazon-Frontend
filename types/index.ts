import { SVGProps } from "react";

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
