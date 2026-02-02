# 환경 변수 설정 가이드

## 필수 환경 변수 (4개)

### 1. Supabase 설정 (2개)

**NEXT_PUBLIC_SUPABASE_URL**
```
https://hqouaiupjrlqlnnkifkg.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3VhaXVwanJscWxubmtpZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NzU0NjIsImV4cCI6MjA1NDA1MTQ2Mn0.sb_publishable_sJayYg79ARGGW84ejPmeQw_vQuQNINp
```

### 2. Kakao 설정 (2개)

**NEXT_PUBLIC_KAKAO_MAP_API_KEY**
```
e505a419b0cb4b4323a9d5ed58464aa8
```

**KAKAO_REST_API_KEY**
```
⚠️ Kakao Developers에서 직접 확인 필요

1. https://developers.kakao.com 접속
2. 로그인
3. "내 애플리케이션" 클릭
4. 앱 선택
5. "앱 설정" → "앱 키" 클릭
6. "REST API 키" 복사
```

---

## Vercel Dashboard에서 설정하기

### 방법

1. **Vercel Dashboard 접속**
   ```
   https://vercel.com/dashboard
   ```

2. **프로젝트 선택**
   - `maepjji-alert` 클릭

3. **Settings → Environment Variables**

4. **각 변수 추가**
   - "Add New" 버튼 클릭
   - Name, Value 입력
   - Environment: **모두 체크** (Production, Preview, Development)
   - "Save" 클릭

5. **재배포 (중요!)**
   - Deployments 탭
   - 최신 배포 → "..." → "Redeploy"

---

## CLI로 설정하기

```bash
# Vercel 로그인 (최초 1회)
vercel login

# 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_KAKAO_MAP_API_KEY
vercel env add KAKAO_REST_API_KEY

# 각 명령마다:
# 1. 값 입력
# 2. 환경 선택 (스페이스바로 모두 선택)

# 재배포
vercel --prod
```

---

## 환경 변수 확인

### Dashboard
```
Vercel Dashboard → 프로젝트 → Settings → Environment Variables
```

### CLI
```bash
# 모든 환경 변수 목록
vercel env ls

# 특정 환경 변수 값 확인
vercel env pull .env.local
cat .env.local
```

---

## 문제 해결

### 환경 변수가 적용 안 돼요

**재배포 안 하셨나요?**
```
환경 변수 추가/수정 후 반드시 재배포 필요!

Dashboard → Deployments → Redeploy
```

### NEXT_PUBLIC_ 접두사 차이

**클라이언트 노출 여부:**
```
NEXT_PUBLIC_* → 브라우저에서 접근 가능
KAKAO_REST_API_KEY → 서버에서만 사용 (보안)
```

### 환경 변수 삭제

```bash
# Dashboard
Settings → Environment Variables → 변수 선택 → Delete

# CLI
vercel env rm VARIABLE_NAME
```

---

## 보안 주의사항

### 절대 GitHub에 올리지 마세요

```bash
# .gitignore에 이미 포함됨:
.env.local
.env*.local
```

### REST API 키 노출 금지

```
❌ 잘못된 사용:
NEXT_PUBLIC_KAKAO_REST_API_KEY (클라이언트 노출!)

✅ 올바른 사용:
KAKAO_REST_API_KEY (서버에서만 사용)
```

### 키 재발급 (노출 시)

1. Kakao Developers 접속
2. "앱 설정" → "앱 키"
3. "재발급" 클릭
4. Vercel 환경 변수 업데이트
5. 재배포

---

## 환경별 변수 관리

### Production (프로덕션)
```
실제 사용자가 접속하는 환경
https://maepjji-alert-xxx.vercel.app
```

### Preview (미리보기)
```
Pull Request 생성 시 자동 배포
테스트용 임시 URL
```

### Development (개발)
```
vercel dev 실행 시 사용
로컬 개발 환경
```

**모든 환경에 동일한 값 사용 권장**

---

## 체크리스트

- [ ] 4개 환경 변수 모두 추가
- [ ] 각 변수마다 3개 환경 모두 체크
- [ ] Kakao REST API 키 정확히 복사
- [ ] 재배포 완료
- [ ] 배포된 사이트에서 작동 확인

완료 후 → DEPLOYMENT.md 3단계로 이동
