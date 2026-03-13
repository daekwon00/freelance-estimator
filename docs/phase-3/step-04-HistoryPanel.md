# Step 3-04: HistoryPanel 및 히스토리 관리

## Status: DONE

## Description
localStorage 기반 견적 히스토리 저장/관리

## Tasks
- [x] `lib/history.ts` — getHistory, addHistory, deleteHistory, clearHistory
- [x] UUID 생성, LIFO 순서, 최대 50개 제한
- [x] SSR 안전 (window undefined 체크)
- [x] HistoryPanel 컴포넌트 — 접이식 아코디언 UI
- [x] 불러오기/개별 삭제/전체 삭제 (확인 대화상자)
- [x] refreshKey로 외부 트리거 새로고침

## Files
- `lib/history.ts`
- `components/HistoryPanel.tsx`

## Estimate
~1시간
