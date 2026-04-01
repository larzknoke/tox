import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return "0,00 €";

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("de-DE");
}

export function getGenderLabel(gender) {
  switch (gender) {
    case "männlich":
      return "Männlich";
    case "weiblich":
      return "Weiblich";
    case "divers":
      return "Divers";
    default:
      return "-";
  }
}

export function formatQuarter(quarter, year) {
  return `Q${quarter} ${year}`;
}
