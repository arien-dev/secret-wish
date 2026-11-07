import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = "EUR"): string {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function getOccasionLabel(occasion: string): string {
  switch (occasion) {
    case "BIRTHDAY":
      return "Geburtstag";
    case "CHRISTMAS":
      return "Weihnachten";
    case "BABY":
      return "Geburt & Baby";
    case "WEDDING":
      return "Hochzeit";
    case "MOVING":
      return "Umzug & Einzug";
    default:
      return "Wunschliste";
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "MUST_HAVE":
      return "Herzblut / Highlight";
    case "HIGH":
      return "Hohe Priorität";
    case "MEDIUM":
      return "Mittlere Priorität";
    case "LOW":
      return "Wäre nett";
    default:
      return "Standard";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "MUST_HAVE":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    case "HIGH":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700";
    case "MEDIUM":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-700";
    case "LOW":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}
