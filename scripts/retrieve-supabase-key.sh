#!/bin/bash

echo "🔑 Supabase API Key 자동 복구 도구"
echo "================================="
echo ""

PROJECT_ID="hqouaiupjrlqlnnkifkg"
DASHBOARD_URL="https://supabase.com/dashboard/project/${PROJECT_ID}/settings/api"

echo "📋 다음 단계를 따라주세요:"
echo ""
echo "1. 브라우저가 열리면 Supabase에 로그인하세요"
echo "2. API 키 페이지가 자동으로 로드됩니다"
echo "3. 'anon public' 키를 복사하세요"
echo ""
echo "브라우저를 여는 중..."
sleep 2

# macOS에서 브라우저 열기
open "${DASHBOARD_URL}"

echo ""
echo "✅ 브라우저가 열렸습니다"
echo ""
echo "📝 다음 단계:"
echo "   1. Supabase 로그인"
echo "   2. 'Project API keys' 섹션에서 'anon' 'public' 키 복사"
echo "   3. 아래 명령어를 실행하여 키 저장:"
echo ""
echo "   cat > .env.local.new << 'EOF'"
echo "   # Supabase"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://hqouaiupjrlqlnnkifkg.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_복사한_키_붙여넣기"
echo "   "
echo "   # Kakao Maps"
echo "   NEXT_PUBLIC_KAKAO_MAP_API_KEY=e505a419b0cb4b4323a9d5ed58464aa8"
echo "   "
echo "   # Kakao REST API (for server-side search)"
echo "   KAKAO_REST_API_KEY=97f729aeaacb2facf8af2c7dcac9b3b2"
echo "   EOF"
echo ""
echo "   # 키 입력 후 저장:"
echo "   mv .env.local .env.local.backup"
echo "   mv .env.local.new .env.local"
echo ""

read -p "키를 복사했나요? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ 좋습니다! 이제 복사한 키를 붙여넣으세요:"
    echo ""
    read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon_key
    
    if [ -z "$anon_key" ]; then
        echo "❌ 키가 입력되지 않았습니다."
        exit 1
    fi
    
    # .env.local 백업
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    
    # 새 .env.local 생성
    cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hqouaiupjrlqlnnkifkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon_key}

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_API_KEY=e505a419b0cb4b4323a9d5ed58464aa8

# Kakao REST API (for server-side search)
KAKAO_REST_API_KEY=97f729aeaacb2facf8af2c7dcac9b3b2
EOF
    
    echo ""
    echo "✅ .env.local 파일이 업데이트되었습니다!"
    echo "📦 백업 파일: .env.local.backup.*"
    echo ""
    echo "🔄 개발 서버를 재시작하세요:"
    echo "   npm run dev"
    echo ""
else
    echo ""
    echo "ℹ️  나중에 다시 실행하세요: ./scripts/retrieve-supabase-key.sh"
    echo ""
fi
