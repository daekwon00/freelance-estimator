# PRD: Freelance Estimator

## 개요

프리랜서/개발팀을 위한 AI 기반 프로젝트 견적 산출 도구. 프로젝트 정보를 입력하면 5개의 전문 AI 에이전트가 병렬로 분석하여 종합 견적서를 자동 생성한다.

## 목표

1. **견적 자동화**: 수작업 견적 산출 시간을 분 단위로 단축
2. **다각도 분석**: 범위, 기술, 일정, 리스크, 가격을 독립 에이전트로 분석하여 편향 방지
3. **실시간 피드백**: SSE 스트리밍으로 견적 생성 과정을 실시간 시각화
4. **재사용성**: 히스토리 저장, 프리셋 템플릿, 섹션별 재생성으로 반복 활용

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| AI | Anthropic SDK (`claude-sonnet-4-6`) |
| Markdown | `react-markdown` |
| Test | Vitest |
| Package Manager | pnpm |

## 기능 요구사항

### F1. 프로젝트 입력 폼
- 프로젝트명 (필수, 최대 100자)
- 프로젝트 설명 (필수, 최대 5,000자)
- 희망 납기일 (선택, YYYY-MM-DD)
- 예산 범위 (선택, 최대 50자)
- 클라이언트 + 서버 양쪽 유효성 검사, 인라인 에러 표시

### F2. 멀티 에이전트 분석 (Conductor 패턴)
- **Scope Agent**: 핵심 기능, 범위 경계, 예상 화면/API 수
- **Tech Agent**: 추천 기술 스택, 근거, 대안
- **Time Agent**: 기능별 공수 분해 (표 형식), 20% 버퍼 포함 총합
- **Risk Agent**: 기술/일정/요구사항 리스크, 완화 전략
- **Price Agent**: 한국 시장 시세 (70-100만원/일 시니어 기준), 최소/표준/최대 가격대
- 5개 에이전트 Promise.all 병렬 실행 → Conductor가 종합 마크다운으로 합성

### F3. SSE 스트리밍
- 프로토콜: `agent_complete` → `synthesis_start` → `synthesis_delta` → `done` | `error`
- 에이전트 완료 시 실시간 진행률 업데이트
- 합성 단계에서 텍스트 증분 스트리밍

### F4. 진행 상황 표시 (ProgressPanel)
- 0-100% 진행률 바
- 에이전트별 완료 체크리스트 (✓/○)
- 현재 단계 표시: "에이전트 분석 중" / "견적서 작성 중"

### F5. 견적 결과 (EstimateResult)
- 마크다운 렌더링 (react-markdown + typography 플러그인)
- H2 헤더 기반 섹션 파싱
- 섹션별 재생성 버튼 (호버 시 표시)
- .md 파일 다운로드 (프로젝트명 포함 파일명)
- PDF 인쇄 (브라우저 print 기반, 무의존성)

### F6. 템플릿 프리셋
- 4종: 쇼핑몰, 기업 홈페이지, SaaS 플랫폼, 모바일 앱
- 원클릭으로 폼 자동 채움

### F7. 히스토리 관리
- localStorage 기반 (최대 50개, LIFO)
- 저장/불러오기/개별 삭제/전체 삭제
- 접이식 패널 UI

### F8. 섹션 재생성
- 특정 에이전트만 재실행
- H2 + 키워드 매칭으로 해당 섹션만 교체
- 나머지 견적 내용 보존

## 비기능 요구사항

### NF1. 레이트 리밋
- 인메모리 IP 기반
- `/api/estimate`: 3회/분
- `/api/estimate/section`: 10회/분

### NF2. 응답 캐싱
- SHA-256 해시 키
- 인메모리 저장, TTL 1시간, 최대 100개
- 동일 입력 시 캐시 히트 → 즉시 응답

### NF3. 다크 모드
- Tailwind `dark:` 프리픽스 기반
- 시스템 설정 연동

### NF4. 에러 핸들링
- API 에러 → SSE error 이벤트
- 폼 유효성 에러 → 인라인 표시
- 레이트 리밋 초과 → retryAfter 정보 제공

### NF5. 테스트
- Vitest 4 스위트, 31개 테스트
- 커버리지: validate, rateLimit, cache, history

## 아키텍처

```
User Input (page.tsx)
    ↓
Form Validation (validate.ts)
    ↓
POST /api/estimate (rate limit → cache check)
    ↓
runConductorStream (conductor.ts)
    ├── scopeAgent  ─┐
    ├── techAgent   ─┤
    ├── timeAgent   ─┼── Promise.all (병렬)
    ├── riskAgent   ─┤
    └── priceAgent  ─┘
         ↓
    Synthesis (Claude) → Full Markdown
         ↓
    Cache → SSE Stream → EstimateResult
```

## 파일 구조

```
app/
├── page.tsx                    # 메인 페이지 (폼 + 결과)
├── layout.tsx                  # 루트 레이아웃
├── globals.css                 # 전역 스타일
└── api/
    └── estimate/
        ├── route.ts            # SSE 스트리밍 API
        └── section/route.ts    # 섹션 재생성 API

components/
├── EstimateResult.tsx          # 결과 렌더링/내보내기/재생성
├── ProgressPanel.tsx           # 실시간 진행 상황
└── HistoryPanel.tsx            # 히스토리 관리

lib/
├── client.ts                   # Anthropic 클라이언트 + 모델 상수
├── conductor.ts                # 오케스트레이터 (run/stream/regenerate)
├── validate.ts                 # 폼 유효성 검사
├── rateLimit.ts                # IP 기반 레이트 리밋
├── cache.ts                    # 응답 캐싱
├── history.ts                  # localStorage 히스토리
├── presets.ts                  # 템플릿 프리셋
└── agents/
    ├── scopeAgent.ts
    ├── techAgent.ts
    ├── timeAgent.ts
    ├── riskAgent.ts
    └── priceAgent.ts

types/
└── estimate.ts                 # 타입 정의

__tests__/
├── validate.test.ts
├── rateLimit.test.ts
├── cache.test.ts
└── history.test.ts
```
