# Progress

## Phase 1: 초기 설정 & 코어 아키텍처
- [x] step-01: 프로젝트 초기 설정
- [x] step-02: 타입 정의
- [x] step-03: AI 클라이언트 설정

## Phase 2: AI 에이전트 구현
- [x] step-01: 5개 전문 에이전트 구현 (scope, tech, time, risk, price)
- [x] step-02: Conductor 오케스트레이터 (Promise.all 병렬 + 합성)
- [x] step-03: API 라우트 (POST /api/estimate)

## Phase 3: SSE 스트리밍 & UI
- [x] step-01: SSE 스트리밍 (runConductorStream + 이벤트 프로토콜)
- [x] step-02: ProgressPanel (진행률 바 + 에이전트 체크리스트)
- [x] step-03: EstimateResult (마크다운 렌더링 + 내보내기)
- [x] step-04: HistoryPanel (localStorage 히스토리 관리)
- [x] step-05: 메인 페이지 통합 (상태 관리 + 다크 모드)

## Phase 4: 고급 기능
- [x] step-01: 템플릿 프리셋 (4종)
- [x] step-02: PDF 내보내기 (print 기반)
- [x] step-03: 섹션 재생성 (단일 에이전트 재실행)

## Phase 5: 품질 보증
- [x] step-01: 폼 유효성 검사 (클라이언트 + 서버)
- [x] step-02: 레이트 리밋 (IP 기반, 인메모리)
- [x] step-03: 응답 캐싱 (SHA-256, TTL 1시간)
- [x] step-04: 테스트 스위트 (Vitest, 4 스위트 31개 테스트)

## Phase 6: 향후 개선사항
- [ ] step-01: E2E 테스트 (Playwright)
- [ ] step-02: 인증 및 사용자 관리
- [ ] step-03: DB 영속화 (localStorage → DB)
- [ ] step-04: 배포 파이프라인 (Vercel + GitHub Actions)
- [ ] step-05: i18n 다국어 지원
- [ ] step-06: 견적 비교 기능
