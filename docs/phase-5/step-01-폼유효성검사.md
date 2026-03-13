# Step 5-01: 폼 유효성 검사

## Status: DONE

## Description
클라이언트 + 서버 양쪽 입력값 유효성 검사

## Tasks
- [x] `validateForm()` — 필드별 규칙 (필수, maxLength, 날짜 형식)
- [x] `hasErrors()` 헬퍼 함수
- [x] 클라이언트: 인라인 에러 메시지 + 글자 수 카운터
- [x] 서버: API 라우트에서 동일 검증 적용
- [x] 한국어 에러 메시지

## Files
- `lib/validate.ts`
- `app/page.tsx` (인라인 에러 UI)
- `app/api/estimate/route.ts` (서버 검증)

## Estimate
~45분
