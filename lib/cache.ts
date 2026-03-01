import { createHash } from "crypto";

interface CacheEntry {
  markdown: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 60 * 60 * 1000; // 1시간
const MAX_ENTRIES = 100;

export function getCacheKey(input: {
  title: string;
  description: string;
  deadline?: string;
  budget?: string;
}): string {
  const raw = JSON.stringify({
    title: input.title,
    description: input.description,
    deadline: input.deadline ?? "",
    budget: input.budget ?? "",
  });
  return createHash("sha256").update(raw).digest("hex");
}

export function getCache(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.markdown;
}

export function setCache(key: string, markdown: string): void {
  // 오래된 항목 정리
  if (cache.size >= MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.timestamp > TTL) cache.delete(k);
    }
    // 여전히 초과면 가장 오래된 항목 삭제
    if (cache.size >= MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
  }

  cache.set(key, { markdown, timestamp: Date.now() });
}
