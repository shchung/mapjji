# Supabase API Key 복구 가이드

## 문제
`.env.local` 파일의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 손상되어 "invalid api key" 오류 발생

## 해결 방법

### 방법 1: Supabase 대시보드에서 직접 복사 (추천)

1. **Supabase 대시보드 열기**
   ```
   https://supabase.com/dashboard/project/hqouaiupjrlqlnnkifkg
   ```

2. **Settings → API 메뉴로 이동**
   - 좌측 사이드바에서 ⚙️ Settings 클릭
   - API 탭 선택

3. **Project API keys 섹션 찾기**
   - `anon` `public` 키 찾기
   - 전체 키 복사 (약 300자 이상의 긴 문자열)

4. **키 형식 확인**
   ```
   eyJhbGci...매우긴문자열...끝부분
   ```
   - 시작: `eyJ`로 시작
   - 끝: 완전한 base64 문자열로 끝남 (손상되지 않음)

5. **.env.local 파일 수정**
   ```bash
   nano .env.local
   ```
   
   다음 줄 찾아서 교체:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=복사한_완전한_키
   ```

6. **저장 및 재시작**
   ```bash
   # Ctrl+O (저장), Ctrl+X (종료)
   npm run dev
   ```

---

### 방법 2: 자동화 스크립트 (브라우저 자동화)

**실행 방법:**

```bash
cd /Users/max/dev/maepjji-alert
./scripts/retrieve-supabase-key.sh
```

이 스크립트는:
1. Supabase 대시보드를 브라우저로 열기
2. 로그인 대기 (사용자가 직접 로그인)
3. API 키 페이지로 자동 이동
4. 키 복사 안내

---

### 방법 3: Vercel에서 확인 (프로덕션 키)

Vercel 프로덕션에 올바른 키가 설정되어 있으므로, 프로덕션 사이트에서 인증이 작동하는지 확인:

```bash
# 프로덕션 사이트 열기
open https://maepjji-alert.vercel.app
```

프로덕션에서 로그인이 작동하면 키가 올바르게 설정된 것입니다.

---

## 확인 방법

올바른 키로 수정 후:

```bash
# 개발 서버 재시작
npm run dev

# 브라우저에서 테스트
open http://localhost:3000
```

1. 레스토랑 마커 클릭
2. "맵기 레벨 등록하기" 클릭
3. 이메일 입력 후 "이메일로 로그인" 클릭
4. ❌ "invalid api key" 오류 대신
5. ✅ "메일을 확인하세요!" 메시지 표시

---

## 참고

현재 손상된 키 끝부분:
```
...INp
```

올바른 키는 이것보다 훨씬 길고 완전한 base64 문자열로 끝나야 합니다.
