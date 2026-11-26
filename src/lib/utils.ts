import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number): string {
  return idrFormatter.format(amount);
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
