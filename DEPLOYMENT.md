# 맵찌주의보 - Vercel 배포 가이드

## 1단계: Vercel 배포 (5분)

### 배포 실행
```bash
cd /Users/max/dev/maepjji-alert
vercel
```

### 질문 답변
```
? Set up and deploy "~/dev/maepjji-alert"? [Y/n] 
→ Y (엔터)

? Which scope do you want to deploy to?
→ 본인 계정 선택 (엔터)

? Link to existing project? [y/N]
→ N (엔터)

? What's your project's name? (maepjji-alert)
→ 엔터 (기본값 사용)

? In which directory is your code located? ./
→ 엔터

? Want to override the settings? [y/N]
→ N (엔터)
```

### 배포 완료
```
✅ Production: https://maepjji-alert-xxx.vercel.app
```

**이 URL을 복사해두세요!**

---

## 2단계: 환경 변수 설정 (5분)

### 방법 1: Vercel Dashboard (추천)

1. **Vercel Dashboard 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **프로젝트 선택**
   - `maepjji-alert` 클릭

3. **Settings → Environment Variables**
   - 왼쪽 메뉴에서 "Settings" 클릭
   - "Environment Variables" 탭 클릭

4. **환경 변수 추가**
   
   각 변수를 하나씩 추가:

   **NEXT_PUBLIC_SUPABASE_URL**
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://hqouaiupjrlqlnnkifkg.supabase.co
   Environment: Production, Preview, Development (모두 체크)
   ```

   **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3VhaXVwanJscWxubmtpZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzU0NjIsImV4cCI6MjA1NDA1MTQ2Mn0.sb_publishable_sJayYg79ARGGW84ejPmeQw_vQuQNINp
   Environment: Production, Preview, Development (모두 체크)
   ```

   **NEXT_PUBLIC_KAKAO_MAP_API_KEY**
   ```
   Name: NEXT_PUBLIC_KAKAO_MAP_API_KEY
   Value: e505a419b0cb4b4323a9d5ed58464aa8
   Environment: Production, Preview, Development (모두 체크)
   ```

   **KAKAO_REST_API_KEY**
   ```
   Name: KAKAO_REST_API_KEY
   Value: (Kakao Developers에서 복사한 REST API 키)
   Environment: Production, Preview, Development (모두 체크)
   ```

5. **Save 버튼 클릭**

6. **재배포 (필수!)**
   - Deployments 탭으로 이동
   - 최신 배포 오른쪽 "..." 클릭
   - "Redeploy" 클릭
   - 1-2분 대기

### 방법 2: CLI로 설정

```bash
# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 값 입력: https://hqouaiupjrlqlnnkifkg.supabase.co
# 환경 선택: Production, Preview, Development (스페이스바로 선택)

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 값 입력: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kakao
vercel env add NEXT_PUBLIC_KAKAO_MAP_API_KEY
# 값 입력: e505a419b0cb4b4323a9d5ed58464aa8

vercel env add KAKAO_REST_API_KEY
# 값 입력: (REST API 키)

# 재배포
vercel --prod
```

---

## 3단계: Kakao Developers 도메인 등록 (3분)

### REST API 키 확인 및 복사

1. **Kakao Developers 접속**
   ```
   https://developers.kakao.com
   ```

2. **앱 선택**
   - 로그인
   - "내 애플리케이션" 클릭
   - "맵찌주의보" (또는 본인 앱) 클릭

3. **REST API 키 복사**
   - 왼쪽 메뉴: "앱 설정" → "앱 키"
   - **"REST API 키"** 복사
   - → Vercel 환경 변수 `KAKAO_REST_API_KEY`에 사용

### 웹 플랫폼 도메인 추가

4. **플랫폼 설정**
   - 왼쪽 메뉴: "앱 설정" → "플랫폼"
   - "Web 플랫폼 등록" (또는 수정) 클릭

5. **도메인 추가**
   ```
   기존 (로컬):
   http://localhost:3000
   
   추가할 도메인 (프로덕션):
   https://maepjji-alert-xxx.vercel.app
   ```
   
   **중요:**
   - `https://` 포함
   - 끝에 `/` 없이
   - Vercel에서 받은 정확한 URL 입력

6. **저장**

### 서비스 활성화 확인

7. **제품 설정 → Kakao 로그인**
   - "활성화 설정" ON 확인
   - Redirect URI는 필요 없음 (로그인 안 씀)

8. **제품 설정 → 지도**
   - 자동으로 활성화되어 있어야 함

---

## 4단계: 배포 확인 (2분)

### 테스트

1. **브라우저에서 접속**
   ```
   https://maepjji-alert-xxx.vercel.app
   ```

2. **지도 표시 확인**
   - ✅ Kakao 지도가 보임
   - ✅ 5개 샘플 마커 표시됨 (🌶️)

3. **검색 기능 테스트**
   - 검색 아이콘 클릭
   - "강남역 맛집" 입력
   - ✅ 파란색 마커들이 나타남
   - ✅ 검색 결과 리스트 표시됨

4. **마커 클릭 테스트**
   - 마커 클릭
   - ✅ 바텀시트 열림
   - ✅ 맛집 정보 표시됨

### 문제 해결

#### 지도가 안 보여요
```
→ Kakao Developers 플랫폼 설정 확인
→ 정확한 Vercel URL이 등록되었는지 확인
→ https:// 프로토콜 확인
```

#### 검색이 안 돼요
```
→ Vercel 환경 변수 확인
→ KAKAO_REST_API_KEY가 올바른지 확인
→ Vercel에서 재배포했는지 확인
```

#### 환경 변수 확인 방법
```bash
# Vercel Dashboard
Settings → Environment Variables

# 또는 CLI
vercel env ls
```

---

## 5단계: 프로덕션 준비 (선택)

### 성능 최적화

✅ 이미 적용됨:
- Next.js 자동 이미지 최적화
- 서버사이드 렌더링
- 코드 스플리팅
- Vercel CDN

### 모니터링

**Vercel Analytics 활성화 (무료):**
1. Vercel Dashboard → 프로젝트
2. Analytics 탭
3. "Enable Web Analytics" 클릭

**기능:**
- 페이지뷰 통계
- 성능 메트릭
- 사용자 위치

### 도메인 커스터마이징 (선택)

**현재 URL:**
```
https://maepjji-alert-xxx.vercel.app
```

**커스텀 도메인 원하면:**
1. 도메인 구매 (가비아, Cloudflare 등)
2. Vercel Dashboard → Settings → Domains
3. "Add" 클릭
4. 도메인 입력 (예: maepjji.com)
5. DNS 설정 (자동 안내됨)

---

## 배포 완료 체크리스트

- [ ] Vercel 배포 성공
- [ ] 환경 변수 4개 모두 설정
- [ ] Vercel에서 재배포 완료
- [ ] Kakao REST API 키 복사
- [ ] Kakao Developers에 프로덕션 URL 등록
- [ ] 지도 표시 확인
- [ ] 검색 기능 작동 확인
- [ ] 마커 클릭 테스트 완료

---

## 다음 단계

### 사용자 확보
1. **친구들한테 공유**
   ```
   "매운 맛집 찾는 앱 만들었어!
   https://maepjji-alert-xxx.vercel.app"
   ```

2. **피드백 수집**
   - 어떤 기능이 필요한가?
   - 어떤 맛집을 추가해야 하나?
   - UI/UX 개선점?

3. **데이터 확장**
   - 실제 맛집 데이터 추가
   - 매운맛 레벨 정보 수집

### 수익화 준비
1. 첫 100명 사용자 확보
2. 맛집 스폰서십 시스템 개발
3. 첫 스폰서 맛집 유치 (₩30-50K/월)

---

## 문제 발생 시

### Vercel 배포 실패
```bash
# 로그 확인
vercel logs

# 로컬에서 빌드 테스트
npm run build
```

### 환경 변수 문제
```bash
# 환경 변수 확인
vercel env ls

# 환경 변수 삭제
vercel env rm VARIABLE_NAME

# 다시 추가
vercel env add VARIABLE_NAME
```

### Kakao API 오류
1. Kakao Developers에서 앱 상태 확인
2. JavaScript 키 (지도용) vs REST API 키 (검색용) 구분
3. 도메인이 정확히 등록되었는지 확인

---

## 비용 요약

**현재 (무료):**
- Vercel Hobby: ₩0
- Supabase Free: ₩0
- Kakao API: ₩0
- **총: ₩0/월**

**확장 시 (사용자 1,000명/일):**
- Vercel Hobby: ₩0 (대역폭 100GB 이내)
- Supabase Free: ₩0 (DB 500MB 이내)
- Kakao API: ₩0 (월 30만 건까지 무료)
- **총: ₩0/월**

**수익화 후 (필요 시):**
- Vercel Pro: $20/월 (대역폭 초과 시)
- Supabase Pro: $25/월 (DB 확장 시)
- 커스텀 도메인: ₩15,000/년
- **총: ~₩60,000/월 + ₩15,000/년**

---

**축하합니다! 🎉**

맵찌주의보가 이제 전 세계 어디서나 접속 가능합니다!

URL을 친구들과 공유하고 피드백을 받아보세요! 🌶️
