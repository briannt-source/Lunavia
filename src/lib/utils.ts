import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "VND"): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatVND(amount: number): string {
  return formatCurrency(amount, "VND");
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function formatDateTime(date: Date | string, formatStr?: string): string {
  return format(new Date(date), formatStr || "dd/MM/yyyy HH:mm");
}

export function formatDateLong(date: Date | string): string {
  return format(new Date(date), "dd MMMM yyyy", { locale: require("date-fns/locale/vi") });
}
