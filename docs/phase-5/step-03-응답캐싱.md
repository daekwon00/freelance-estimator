# Step 5-03: 응답 캐싱

## Status: DONE

## Description
동일 입력 재요청 시 캐시된 응답 즉시 반환

## Tasks
- [x] `getCacheKey()` — SHA-256 해시 + 입력 정규화
- [x] `getCache()` — TTL 1시간, 만료 시 자동 삭제
- [x] `setCache()` — 최대 100개, LRU 유사 퇴거 정책
- [x] API 라우트에서 캐시 체크 → 히트 시 에이전트 완료 시뮬레이션 후 즉시 스트리밍

## Files
- `lib/cache.ts`
- `app/api/estimate/route.ts` (캐시 통합)

## Estimate
~30분
