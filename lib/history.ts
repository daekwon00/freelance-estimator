import { EstimateHistoryItem } from "@/types/estimate";

const STORAGE_KEY = "freelance-estimator-history";
const MAX_ITEMS = 50;

export function getHistory(): EstimateHistoryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as EstimateHistoryItem[];
  } catch {
    return [];
  }
}

export function addHistory(item: Omit<EstimateHistoryItem, "id" | "createdAt">): void {
  const history = getHistory();
  const newItem: EstimateHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  history.unshift(newItem);
  if (history.length > MAX_ITEMS) {
    history.length = MAX_ITEMS;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function deleteHistory(id: string): void {
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
