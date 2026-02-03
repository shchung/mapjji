#!/bin/bash

echo "🧪 Testing Production Authentication UI"
echo "========================================"
echo ""
echo "Testing: https://maepjji-alert.vercel.app"
echo ""

TEST_EMAIL="test@example.com"
PROD_URL="https://maepjji-alert.vercel.app"

echo "📋 Test Plan:"
echo "  1. Load production site"
echo "  2. Check if map renders"
echo "  3. Verify auth modal can be triggered"
echo "  4. Test email input UI"
echo ""

echo "🌐 Opening production site..."
open "${PROD_URL}"

sleep 3

echo ""
echo "✅ Manual Test Checklist:"
echo ""
echo "  [ ] 1. Map loads successfully"
echo "  [ ] 2. Sample markers (🌶️) are visible"
echo "  [ ] 3. Click a marker → BottomSheet opens"
echo "  [ ] 4. Click '맵기 레벨 등록하기' → AuthModal opens"
echo "  [ ] 5. Email input field is visible"
echo "  [ ] 6. Enter email → Click '이메일로 로그인'"
echo "  [ ] 7. Success message appears: '메일을 확인하세요!'"
echo "  [ ] 8. Check email inbox for magic link"
echo "  [ ] 9. Click magic link in email"
echo "  [ ] 10. Redirected back to site, logged in"
echo "  [ ] 11. SpiceLevelForm appears"
echo "  [ ] 12. Select spice level (1-5)"
echo "  [ ] 13. Click '등록하기'"
echo "  [ ] 14. Toast: '맵기 레벨이 등록되었습니다!'"
echo ""
echo "💡 Tip: Open browser DevTools (F12) → Console to check for errors"
echo ""

read -p "Did all tests pass? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Production authentication is working!"
    echo ""
    echo "📝 Next steps:"
    echo "  - Fix local .env.local key"
    echo "  - Test OAuth providers (optional)"
    exit 0
else
    echo "❌ Some tests failed"
    echo ""
    echo "📝 Debugging steps:"
    echo "  1. Check browser console for errors (F12)"
    echo "  2. Verify Supabase project is active"
    echo "  3. Check Vercel environment variables: vercel env ls"
    echo "  4. Review AUTH_STATUS_SUMMARY.md for configuration"
    exit 1
fi
