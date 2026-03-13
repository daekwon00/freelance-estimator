# Step 2-01: AI 에이전트 구현

## Status: DONE

## Description
5개 전문 분석 에이전트 구현 (각각 독립적 시스템 프롬프트 + Claude API 호출)

## Tasks
- [x] `scopeAgent.ts` — 핵심 기능, 범위 경계, 예상 화면/API 분석
- [x] `techAgent.ts` — 추천 기술 스택, 근거, 대안 제시
- [x] `timeAgent.ts` — 기능별 공수 분해 (표 형식), 20% 버퍼 총합
- [x] `riskAgent.ts` — 기술/일정/요구사항 리스크, 완화 전략
- [x] `priceAgent.ts` — 한국 시장 시세, 최소/표준/최대 가격대
- [x] 공통 패턴: buildInputText → Claude API → 마크다운 텍스트 반환

## Files
- `lib/agents/scopeAgent.ts`
- `lib/agents/techAgent.ts`
- `lib/agents/timeAgent.ts`
- `lib/agents/riskAgent.ts`
- `lib/agents/priceAgent.ts`

## Estimate
~1.5시간
