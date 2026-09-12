import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const twCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1500;

export function cn(...inputs: ClassValue[]): string {
  const raw = clsx(inputs);
  if (!raw) return "";

  // Fast path: if there is no space, it is a single class token where no conflict can exist
  if (!raw.includes(" ")) {
    return raw;
  }

  const cached = twCache.get(raw);
  if (cached !== undefined) {
    return cached;
  }

  const merged = twMerge(raw);

  if (twCache.size >= MAX_CACHE_SIZE) {
    const firstKey = twCache.keys().next().value;
    if (firstKey !== undefined) {
      twCache.delete(firstKey);
    }
  }
  twCache.set(raw, merged);

  return merged;
}
