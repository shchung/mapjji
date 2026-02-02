# 배포 진행 상황

**날짜:** 2026-02-02 16:24

---

## ✅ 완료된 작업

### 1. Vercel CLI 설치
```bash
npm install -g vercel
```
✅ 설치 완료

### 2. Vercel 배포
```bash
vercel
```
✅ 배포 성공
- 프로젝트: `maepjji-alert`
- URL: `https://maepjji-alert-xxx.vercel.app` (배포 시 받은 URL 확인)

### 3. 문서 작성
- ✅ DEPLOYMENT.md
- ✅ ENVIRONMENT_VARS.md
- ✅ KAKAO_SETUP.md
- ✅ QUICK_DEPLOY.md
- ✅ README.md 업데이트
- ✅ .env.local.example
- ✅ .vercelignore

---

## ⏳ 남은 작업

### 1. 환경 변수 설정 (필수!)

**Vercel Dashboard:** https://vercel.com/dashboard

1. `maepjji-alert` 프로젝트 클릭
2. **Settings** → **Environment Variables**
3. 아래 변수들 추가:

#### 변수 1
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://hqouaiupjrlqlnnkifkg.supabase.co
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 변수 2
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3VhaXVwanJscWxubmtpZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzU0NjIsImV4cCI6MjA1NDA1MTQ2Mn0.sb_publishable_sJayYg79ARGGW84ejPmeQw_vQuQNINp
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 변수 3
```
Name: NEXT_PUBLIC_KAKAO_MAP_API_KEY
Value: e505a419b0cb4b4323a9d5ed58464aa8
Environment: ✓ Production ✓ Preview ✓ Development
```

#### 변수 4 (선택 - 검색 기능용)
```
Name: KAKAO_REST_API_KEY
Value: (Kakao Developers에서 복사 필요)
Environment: ✓ Production ✓ Preview ✓ Development

받는 방법:
1. https://developers.kakao.com
2. 로그인 → 내 애플리케이션 → 앱 선택
3. "앱 설정" → "앱 키"
4. "REST API 키" 복사
```

4. **Deployments** 탭 → 최신 배포 → **...** → **Redeploy**

---

### 2. Kakao 도메인 등록

**Kakao Developers:** https://developers.kakao.com

1. 로그인
2. 내 애플리케이션 → 앱 선택
3. **앱 설정** → **플랫폼**
4. **Web 플랫폼 등록** (또는 수정)
5. 도메인 추가:
   ```
   https://maepjji-alert-xxx.vercel.app
   ```
   (Vercel에서 받은 정확한 URL)
6. 저장

---

## 📋 재시작 후 체크리스트

터미널 재시작 후:

### CLI로 환경 변수 설정하기

```bash
cd /Users/max/dev/maepjji-alert

# 1번 변수
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 값 입력: https://hqouaiupjrlqlnnkifkg.supabase.co
# 환경: 스페이스바로 3개 선택 → 엔터

# 2번 변수
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 값 입력: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3VhaXVwanJscWxubmtpZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzU0NjIsImV4cCI6MjA1NDA1MTQ2Mn0.sb_publishable_sJayYg79ARGGW84ejPmeQw_vQuQNINp

# 3번 변수
vercel env add NEXT_PUBLIC_KAKAO_MAP_API_KEY
# 값 입력: e505a419b0cb4b4323a9d5ed58464aa8

# 4번 변수 (선택)
vercel env add KAKAO_REST_API_KEY
# 값 입력: (Kakao REST API 키)

# 재배포
vercel --prod
```

### 또는 Dashboard 사용

1. https://vercel.com/dashboard
2. 위의 "환경 변수 설정" 섹션 참고

---

## 🔍 현재 상태 확인

### Vercel 배포 상태
```bash
vercel ls
```

### 환경 변수 상태
```bash
vercel env ls
```

### 프로젝트 URL
```bash
vercel inspect
```

---

## 📚 참고 문서

- **빠른 가이드:** QUICK_DEPLOY.md
- **상세 가이드:** DEPLOYMENT.md
- **환경 변수:** ENVIRONMENT_VARS.md
- **Kakao 설정:** KAKAO_SETUP.md

---

## 🎯 최종 목표

- [ ] 환경 변수 4개 추가
- [ ] Vercel Redeploy
- [ ] Kakao 도메인 등록
- [ ] 배포된 사이트 테스트
  - [ ] 지도 표시
  - [ ] 샘플 마커 5개
  - [ ] 검색 기능

---

**완료 후:** 전 세계 어디서나 접속 가능! 🎉
