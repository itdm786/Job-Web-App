import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(
  min?: string | number | null,
  max?: string | number | null,
  currency: string | null | undefined = "USD"
): string {
  if (!currency) currency = "USD";
  const minNum = min ? Number(min) : null;
  const maxNum = max ? Number(max) : null;
  if (!minNum && !maxNum) return "Competitive";

  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "₨",
    AED: "د.إ",
    SAR: "﷼",
    CAD: "CA$",
    AUD: "A$",
    NZD: "NZ$",
    INR: "₹",
    SGD: "S$",
    BDT: "৳",
    LKR: "Rs",
    NPR: "₨",
    CNY: "¥",
    JPY: "¥",
    KRW: "₩",
    TWD: "NT$",
    HKD: "HK$",
    MYR: "RM",
    IDR: "Rp",
    THB: "฿",
    VND: "₫",
    PHP: "₱",
    MMK: "K",
    KHR: "៛",
    TRY: "₺",
    KZT: "₸",
    QAR: "﷼",
    KWD: "د.ك",
    BHD: ".د.ب",
    OMR: "﷼",
    JOD: "JD",
    EGP: "£",
    CHF: "CHF",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    RON: "lei",
    BGN: "лв",
    RSD: "din",
    UAH: "₴",
    RUB: "₽",
    ZAR: "R",
    NGN: "₦",
    KES: "KSh",
    MAD: "DH",
    MXN: "MX$",
    ISK: "kr",
  };
  const sym = symbols[currency] || `${currency} `;

  const format = (n: number) => {
    if (n >= 1000000) return `${sym}${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${sym}${(n / 1000).toFixed(0)}K`;
    return `${sym}${n.toLocaleString()}`;
  };

  if (minNum && maxNum) return `${format(minNum)} – ${format(maxNum)}`;
  if (minNum) return `From ${format(minNum)}`;
  if (maxNum) return `Up to ${format(maxNum)}`;
  return "Competitive";
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Recently";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }
  if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diff / 31536000);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "...";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
