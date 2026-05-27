import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency = "EUR", locale = "de-DE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
