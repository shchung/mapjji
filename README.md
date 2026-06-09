# 맵찌도 (mapjji) 🌶️

내 주변 매운 맛집을 찾아주는 웹 애플리케이션

## 주요 기능

- 🗺️ **Kakao Maps 통합** - 인터랙티브 지도로 맛집 위치 확인
- 🔍 **실시간 검색** - 300ms 디바운싱으로 빠른 검색
- 🌶️ **매운맛 레벨 표시** - 5단계 매운맛 시각화
- 📱 **반응형 디자인** - 모바일/데스크톱 최적화
- ⚡ **PWA 지원 준비** - 앱처럼 사용 가능

## 기술 스택

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Maps:** Kakao Maps API
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Deployment:** Vercel

## 빠른 시작

### 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일 수정 (Kakao, Supabase 키 입력)

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 프로덕션 배포

**빠른 배포 (5분):**
```bash
vercel
```

자세한 가이드: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

## 문서

- 📦 **[빠른 배포 가이드](./QUICK_DEPLOY.md)** - 5분 안에 배포하기
- 🚀 **[상세 배포 가이드](./DEPLOYMENT.md)** - 단계별 배포 설명
- 🔑 **[환경 변수 설정](./ENVIRONMENT_VARS.md)** - Vercel 환경 변수 가이드
- 🗺️ **[Kakao 설정](./KAKAO_SETUP.md)** - Kakao Developers 설정
- 📋 **[다음 단계](./NEXT_STEPS.md)** - MVP 이후 로드맵

## 프로젝트 구조

```
mapjji/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── search/        # Kakao Local 검색 API
│   ├── page.tsx           # 메인 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── map/              # Kakao Map 관련
│   └── ui/               # UI 컴포넌트 (BottomSheet 등)
├── lib/                   # 유틸리티
│   ├── supabase/         # Supabase 클라이언트
│   └── types/            # TypeScript 타입
└── scripts/              # 데이터 수집 스크립트

```

## 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-javascript-key
KAKAO_REST_API_KEY=your-kakao-rest-api-key
```

자세한 설정: [ENVIRONMENT_VARS.md](./ENVIRONMENT_VARS.md)

## 데이터베이스 스키마

Supabase PostgreSQL:
- `restaurants` - 식당 정보, 매운맛 레벨
- `menus` - 메뉴 정보, 가격
- `user_profiles` - 사용자 프로필, 매운맛 내성도
- `reviews` - 사용자 리뷰

스키마: [lib/supabase/schema.sql](./lib/supabase/schema.sql)

## 라이선스

MIT

## 개발자

맵찌도 팀
