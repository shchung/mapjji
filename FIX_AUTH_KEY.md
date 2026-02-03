# ⚠️ ACTION REQUIRED: Fix Supabase API Key

## Problem
로컬 개발 환경의 `.env.local` 파일에서 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 손상되어 로그인이 작동하지 않습니다.

## Browser Opened
Supabase 대시보드가 자동으로 열렸습니다:
https://supabase.com/dashboard/project/hqouaiupjrlqlnnkifkg/settings/api

## Next Steps

### 1. Supabase 로그인
열린 브라우저에서 Supabase에 로그인하세요.

### 2. API 키 복사
"Project API keys" 섹션에서:
- `anon` `public` 레이블이 있는 키를 찾으세요
- 전체 키를 복사하세요 (매우 긴 문자열, 약 300자 이상)

### 3. 키 업데이트

**방법 A: 터미널에서 직접 입력**
```bash
cd /Users/max/dev/maepjji-alert

# 현재 파일 백업
cp .env.local .env.local.backup

# 파일 편집
nano .env.local

# NEXT_PUBLIC_SUPABASE_ANON_KEY= 줄을 찾아서
# 복사한 키로 교체

# Ctrl+O (저장), Ctrl+X (종료)
```

**방법 B: 스크립트 재실행**
```bash
./scripts/retrieve-supabase-key.sh
```

### 4. 개발 서버 재시작
```bash
npm run dev
```

### 5. 테스트
http://localhost:3000 에서:
1. 레스토랑 클릭
2. "맵기 레벨 등록하기" 클릭  
3. 이메일 입력 후 "이메일로 로그인" 클릭
4. ✅ "메일을 확인하세요!" 메시지가 나타나면 성공

## Note
프로덕션 환경 (https://maepjji-alert.vercel.app)은 올바른 키로 설정되어 있으므로 정상 작동합니다.
로컬 개발 환경만 수정이 필요합니다.
