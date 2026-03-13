# Step 5-02: 레이트 리밋

## Status: DONE

## Description
인메모리 IP 기반 API 요청 제한

## Tasks
- [x] `checkRateLimit()` — 키별 타임스탬프 추적, 윈도우 기반 제한
- [x] `/api/estimate`: 3회/분
- [x] `/api/estimate/section`: 10회/분
- [x] 초과 시 retryAfter(초) 정보 반환
- [x] 윈도우 밖 오래된 타임스탬프 자동 정리

## Files
- `lib/rateLimit.ts`
- `app/api/estimate/route.ts` (레이트 리밋 적용)
- `app/api/estimate/section/route.ts` (레이트 리밋 적용)

## Estimate
~30분
