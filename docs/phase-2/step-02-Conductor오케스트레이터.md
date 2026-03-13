# Step 2-02: Conductor 오케스트레이터

## Status: DONE

## Description
Conductor 패턴 구현 — 5개 에이전트 병렬 실행 + 합성

## Tasks
- [x] `buildInputText()` — ProjectInput을 프롬프트 텍스트로 변환
- [x] `buildSynthesisPrompt()` — 에이전트 결과를 합성 프롬프트로 조합
- [x] `runConductor()` — Promise.all 병렬 실행 + 합성 호출 → EstimateOutput 반환
- [x] agentRunners 맵 (AgentName → 실행 함수)

## Files
- `lib/conductor.ts`

## Estimate
~1시간
