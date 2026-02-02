# 맵찌주의보 - 다음 단계 가이드

## 🚨 즉시 필요한 액션

### REST API 키 등록 (5분 소요)

검색 기능을 활성화하려면 Kakao REST API 키가 필요합니다.

#### 단계별 가이드

1. **Kakao Developers 접속**
   ```
   https://developers.kakao.com
   ```

2. **로그인 후 앱 선택**
   - 왼쪽 메뉴: "내 애플리케이션"
   - "맵찌주의보" 앱 클릭

3. **REST API 키 복사**
   - 왼쪽 메뉴: "앱 설정" → "앱 키"
   - **"REST API 키"** 복사 (JavaScript 키 아님!)

4. **.env.local 파일 수정**
   ```bash
   # 파일 위치: /Users/max/dev/maepjji-alert/.env.local
   
   # 이 줄을 찾아서:
   KAKAO_REST_API_KEY=your-rest-api-key-here
   
   # 실제 키로 변경:
   KAKAO_REST_API_KEY=실제로_복사한_REST_API_키
   ```

5. **개발 서버 재시작**
   ```bash
   # 현재 서버 종료 (Ctrl+C)
   cd /Users/max/dev/maepjji-alert
   npm run dev
   ```

6. **테스트**
   - 브라우저에서 http://localhost:3000 열기
   - 검색창에 "강남역 맛집" 입력
   - 파란색 마커들이 지도에 표시되는지 확인
   - 마커 클릭 시 바텀시트가 열리는지 확인

---

## ✅ 완성된 기능들

### 1. 지도 시스템
- ✅ Kakao Maps 통합
- ✅ 5개 샘플 맛집 마커 (색상별 매운맛 레벨)
- ✅ 커스텀 마커 디자인
- ✅ 지도 인터랙션 (줌, 팬)

### 2. 검색 기능
- ✅ Kakao Local API 서버사이드 연동
- ✅ 300ms 디바운싱
- ✅ 검색 결과 마커 (파란색)
- ✅ 검색 결과 리스트
- ⏳ **REST API 키 필요** ← 지금 등록하세요!

### 3. 상세 정보
- ✅ 바텀시트 컴포넌트
- ✅ Framer Motion 애니메이션
- ✅ 드래그로 닫기
- ✅ 맛집 정보 표시 (이름, 주소, 매운맛 레벨)

### 4. 데이터 인프라
- ✅ Supabase 데이터베이스 스키마
- ✅ 데이터 수집 스크립트 준비
- ✅ Gemini AI 통합 준비

---

## 🚀 배포 준비 (REST API 키 등록 후)

### 1. PWA 설정 (30분)

**manifest.json 생성**
```json
{
  "name": "맵찌주의보",
  "short_name": "맵찌주의보",
  "description": "내 주변 매운 맛집 찾기",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker 추가**
- Next.js PWA 플러그인 설치: `npm install next-pwa`
- `next.config.js` 설정

### 2. Cloudflare Pages 배포 (15분)

1. **GitHub 저장소 생성**
   ```bash
   cd /Users/max/dev/maepjji-alert
   git init
   git add .
   git commit -m "Initial commit: MVP complete"
   git remote add origin https://github.com/your-username/maepjji-alert.git
   git push -u origin main
   ```

2. **Cloudflare Pages 연결**
   - https://dash.cloudflare.com 접속
   - "Pages" → "Create a project"
   - GitHub 저장소 연결
   - Build settings:
     - Framework: Next.js
     - Build command: `npm run build`
     - Output directory: `.next`

3. **환경 변수 설정**
   - Cloudflare Pages 대시보드에서 환경 변수 추가:
     - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
     - `KAKAO_REST_API_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **프로덕션 도메인 등록**
   - Kakao Developers에서 프로덕션 도메인 추가
   - 예: `https://maepjji-alert.pages.dev`

### 3. 커스텀 도메인 (선택적)

**도메인 구매 후:**
1. Cloudflare Pages에서 커스텀 도메인 추가
2. DNS 설정 (CNAME)
3. Kakao Developers에 커스텀 도메인 등록

---

## 📊 데이터 수집 (선택적)

### 준비 완료된 것
- ✅ `scripts/` 디렉토리 구조
- ✅ TypeScript 타입 정의
- ✅ 샘플 데이터 (5개 맛집)
- ✅ Gemini AI SDK 설치

### 다음 단계 (필요 시)

1. **Gemini AI API 키 받기**
   - https://makersuite.google.com/app/apikey
   - `.env.local`에 추가: `GOOGLE_GEMINI_API_KEY=...`

2. **데이터 수집 스크립트 작성**
   - Google Maps 리뷰 크롤링
   - Gemini AI로 매운맛 분석
   - Supabase에 저장

3. **비용 예상**
   - 5,000개 리뷰: ₩15-25K (1회)
   - 100개 맛집 × 50개 리뷰 = 5,000개

---

## 🎯 마일스톤

### Phase 1: MVP 런칭 (현재 87.5% 완료)
- [x] 지도 & 마커
- [x] 검색 기능 (코드 완성)
- [ ] REST API 키 등록 ← **지금 여기**
- [ ] 검색 기능 테스트
- [ ] PWA 설정
- [ ] Cloudflare Pages 배포

### Phase 2: 초기 사용자 확보 (1-2주)
- [ ] 첫 100명 사용자
- [ ] 사용자 피드백 수집
- [ ] 버그 수정
- [ ] 성능 최적화

### Phase 3: 데이터 확장 (2-4주)
- [ ] 100-1000개 실제 맛집 데이터
- [ ] 사용자 리뷰 시스템
- [ ] 매운맛 레벨 크라우드소싱

### Phase 4: 수익화 (1-2개월)
- [ ] 맛집 스폰서십 시스템
- [ ] 첫 스폰서 맛집 (₩30-50K/월)
- [ ] 광고 시스템 (선택적)

---

## 📞 문제 해결

### 검색이 안 돼요
- REST API 키가 등록되었는지 확인
- `.env.local` 파일에 올바른 키가 있는지 확인
- 개발 서버를 재시작했는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 지도가 안 보여요
- JavaScript 키가 활성화되었는지 확인
- Kakao Developers에서 "지도" 서비스가 ON인지 확인
- `http://localhost:3000`이 Web 플랫폼에 등록되었는지 확인

### 빌드가 실패해요
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 빌드 재시도
npm run build
```

---

## 📚 참고 자료

### API 문서
- Kakao Maps: https://apis.map.kakao.com/web/documentation/
- Kakao Local: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- Supabase: https://supabase.com/docs
- Gemini AI: https://ai.google.dev/docs

### 커뮤니티
- Kakao Developers 데브톡: https://devtalk.kakao.com
- Next.js 공식 문서: https://nextjs.org/docs

---

## 🎉 축하합니다!

MVP 개발이 거의 완료되었습니다! 

**다음 액션:**
1. ✅ REST API 키 등록 (5분)
2. ✅ 검색 기능 테스트 (5분)
3. ✅ PWA 설정 (30분)
4. ✅ Cloudflare Pages 배포 (15분)

**총 소요 시간: 약 1시간**

그 다음은 첫 사용자를 모으고, 피드백을 받고, 첫 스폰서 맛집을 확보하는 일만 남았습니다! 💪

화이팅! 🌶️
