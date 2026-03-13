# Step 4-03: 섹션 재생성

## Status: DONE

## Description
견적서의 특정 섹션만 재생성하는 기능

## Tasks
- [x] `regenerateSection()` 함수 — 단일 에이전트 재실행 + 합성
- [x] `POST /api/estimate/section` 엔드포인트
- [x] H2 헤더 파싱 + SECTION_KEYWORDS 키워드 매칭
- [x] 섹션별 호버 재생성 버튼 UI
- [x] 재생성 중 로딩 스켈레톤 표시
- [x] 나머지 견적 내용 보존

## Files
- `lib/conductor.ts` (regenerateSection 추가)
- `app/api/estimate/section/route.ts`
- `components/EstimateResult.tsx` (재생성 UI)

## Estimate
~1시간
