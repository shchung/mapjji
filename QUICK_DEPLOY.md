# 빠른 배포 가이드 (5분)

## 1. Vercel 배포

```bash
cd /Users/max/dev/maepjji-alert
vercel
```

**질문에 Y 또는 엔터만 누르면 됨**

배포 완료 후 URL 받음:
```
✅ https://maepjji-alert-xxx.vercel.app
```

---

## 2. 환경 변수 설정

**Vercel Dashboard:** https://vercel.com/dashboard

1. 프로젝트 클릭 (`maepjji-alert`)
2. **Settings → Environment Variables**
3. 아래 4개 추가:

```
NEXT_PUBLIC_SUPABASE_URL
→ https://hqouaiupjrlqlnnkifkg.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
→ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3VhaXVwanJscWxubmtpZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzU0NjIsImV4cCI6MjA1NDA1MTQ2Mn0.sb_publishable_sJayYg79ARGGW84ejPmeQw_vQuQNINp

NEXT_PUBLIC_KAKAO_MAP_API_KEY
→ e505a419b0cb4b4323a9d5ed58464aa8

KAKAO_REST_API_KEY
→ (Kakao Developers에서 복사)
```

4. **Deployments → Redeploy** (재배포 필수!)

---

## 3. Kakao REST API 키 복사

**Kakao Developers:** https://developers.kakao.com

1. 로그인
2. 내 애플리케이션 → 앱 선택
3. **앱 설정 → 앱 키**
4. **"REST API 키"** 복사
5. → Vercel 환경 변수에 붙여넣기

---

## 4. Kakao 도메인 등록

**Kakao Developers** → 같은 앱에서:

1. **앱 설정 → 플랫폼**
2. **Web 플랫폼 등록** (또는 수정)
3. 도메인 입력:
   ```
   https://maepjji-alert-xxx.vercel.app
   ```
4. **저장**

---

## 5. 테스트

**브라우저에서 접속:**
```
https://maepjji-alert-xxx.vercel.app
```

**확인:**
- ✅ 지도 보임
- ✅ 샘플 마커 5개 보임
- ✅ 검색 작동 ("강남역 맛집")

---

## 완료! 🎉

이제 전 세계 어디서나 접속 가능합니다!

**URL 공유하고 피드백 받으세요:**
```
https://maepjji-alert-xxx.vercel.app
```

---

## 자세한 가이드

- 배포 상세: `DEPLOYMENT.md`
- 환경 변수: `ENVIRONMENT_VARS.md`
- Kakao 설정: `KAKAO_SETUP.md`
