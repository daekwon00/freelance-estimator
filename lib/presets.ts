export interface Preset {
  name: string;
  title: string;
  description: string;
  deadline: string;
  budget: string;
}

export const PRESETS: Preset[] = [
  {
    name: "쇼핑몰",
    title: "온라인 쇼핑몰",
    description:
      "상품 등록/관리, 장바구니, 결제(PG 연동), 주문/배송 관리, 회원가입/로그인, 상품 검색/필터링, 리뷰 시스템",
    deadline: "",
    budget: "",
  },
  {
    name: "기업 홈페이지",
    title: "기업 홈페이지",
    description:
      "회사 소개, 서비스/제품 소개, 뉴스/공지사항, 문의 폼, 오시는 길, 반응형 디자인, 관리자 페이지(콘텐츠 수정)",
    deadline: "",
    budget: "",
  },
  {
    name: "SaaS 플랫폼",
    title: "SaaS 플랫폼",
    description:
      "사용자 인증(소셜 로그인), 대시보드, 구독/결제 시스템, 팀/권한 관리, API 제공, 사용량 모니터링, 멀티테넌시",
    deadline: "",
    budget: "",
  },
  {
    name: "모바일 앱",
    title: "모바일 앱 (React Native)",
    description:
      "회원가입/로그인(소셜), 메인 피드, 푸시 알림, 채팅/메시징, 프로필 관리, 설정, iOS/Android 동시 지원",
    deadline: "",
    budget: "",
  },
];
