import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string into a readable label. */
export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Map a 0-100 score to a qualitative band. */
export function scoreBand(score: number): {
  label: string;
  tone: "success" | "warning" | "destructive";
} {
  if (score >= 75) return { label: "Healthy", tone: "success" };
  if (score >= 50) return { label: "Needs work", tone: "warning" };
  return { label: "At risk", tone: "destructive" };
}

/** Initials for an avatar fallback. */
export function initials(name?: string | null): string {
  if (!name) return "PA";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
