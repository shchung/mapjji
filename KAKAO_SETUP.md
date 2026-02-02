# Kakao Developers 프로덕션 설정 가이드

## 준비물

- Vercel 배포 완료된 URL (예: `https://maepjji-alert-xxx.vercel.app`)
- Kakao 계정

---

## 1단계: REST API 키 확인

### 접속

```
https://developers.kakao.com
```

### REST API 키 복사

1. **로그인**

2. **내 애플리케이션 클릭**
   - 상단 메뉴 또는 좌측 사이드바

3. **앱 선택**
   - "맵찌주의보" 앱 클릭
   - (없으면 새로 생성: "애플리케이션 추가하기")

4. **앱 키 확인**
   - 좌측 메뉴: "앱 설정" → "앱 키"
   - 여러 종류의 키가 보임:

```
Native 앱 키: 1234567890abcdef1234567890abcdef (안 씀)
JavaScript 키: e505a419b0cb4b4323a9d5ed58464aa8 (지도용, 이미 설정됨)
REST API 키: abcdef1234567890abcdef1234567890 (검색용, 필요!)
Admin 키: 1234567890abcdef1234567890abcdef1234567890abcdef (안 씀)
```

5. **REST API 키 복사**
   - "REST API 키" 오른쪽 복사 버튼 클릭
   - 메모장에 저장

6. **Vercel 환경 변수에 추가**
   ```
   Name: KAKAO_REST_API_KEY
   Value: (복사한 REST API 키)
   ```

---

## 2단계: 웹 플랫폼 도메인 등록

### 플랫폼 설정

1. **좌측 메뉴: "앱 설정" → "플랫폼"**

2. **현재 등록된 도메인 확인**
   ```
   Web
   └─ http://localhost:3000 (개발용)
   ```

3. **"Web 플랫폼 등록" 또는 "수정" 클릭**

### 프로덕션 도메인 추가

4. **사이트 도메인 입력**

   **올바른 형식:**
   ```
   https://maepjji-alert-xxx.vercel.app
   ```

   **주의사항:**
   - ✅ `https://` 프로토콜 포함
   - ❌ 끝에 `/` 없이
   - ✅ Vercel에서 받은 정확한 URL
   - ❌ `http://` 안 됨 (Vercel은 항상 HTTPS)

5. **여러 도메인 등록 가능**
   ```
   http://localhost:3000
   https://maepjji-alert-xxx.vercel.app
   https://maepjji-alert-git-main-xxx.vercel.app (Preview)
   https://maepjji.com (커스텀 도메인, 나중에)
   ```

6. **"저장" 클릭**

---

## 3단계: 서비스 활성화 확인

### Kakao 로그인 (선택적)

1. **좌측 메뉴: "제품 설정" → "Kakao 로그인"**

2. **활성화 설정**
   - 스위치 ON (이미 켜져있을 수 있음)
   - Redirect URI는 필요 없음 (로그인 기능 안 씀)

3. **동의 항목**
   - 현재는 설정 불필요
   - 나중에 사용자 로그인 추가 시 설정

### 지도 서비스

4. **좌측 메뉴: "제품 설정" → "지도"**

5. **확인사항**
   - 자동으로 활성화되어 있어야 함
   - 별도 설정 불필요

---

## 4단계: 할당량 확인 (선택적)

### API 사용량 모니터링

1. **좌측 메뉴: "통계"**

2. **확인 가능한 정보:**
   - REST API 호출 횟수
   - JavaScript API 호출 횟수
   - 일별/월별 사용량

### 무료 할당량

```
Kakao Local API (검색):
- 월 300,000건 무료
- 초과 시: ₩2/건

Kakao Maps API (지도):
- 월 300,000건 무료
- 초과 시: ₩2/건
```

### 예상 사용량

```
사용자 100명/일 × 30일:
- 지도 로드: 3,000건
- 검색: 1,500건
- 총: 4,500건/월

→ 무료 할당량(300,000건) 내
→ 비용 ₩0
```

---

## 5단계: 보안 설정 (선택적)

### IP 제한 (필요시)

1. **좌측 메뉴: "앱 설정" → "보안"**

2. **서비스 IP 관리**
   - REST API 키를 특정 IP에서만 사용하도록 제한
   - Vercel은 동적 IP라서 설정 어려움
   - **현재는 설정하지 않아도 됨**

### 키 재발급

3. **키 노출 시 재발급:**
   - "앱 설정" → "앱 키"
   - 해당 키 오른쪽 "재발급" 클릭
   - Vercel 환경 변수 업데이트 필요

---

## 문제 해결

### 지도가 안 보여요

**증상:**
```
지도 영역이 회색으로 표시
또는 "Kakao Maps API를 사용할 수 없습니다" 오류
```

**해결:**
1. JavaScript 키 확인
   ```
   NEXT_PUBLIC_KAKAO_MAP_API_KEY가 올바른지 확인
   ```

2. 도메인 등록 확인
   ```
   플랫폼 설정에 정확한 Vercel URL이 있는지 확인
   https:// 프로토콜 확인
   ```

3. 브라우저 콘솔 확인
   ```
   F12 → Console 탭
   "Kakao Maps" 관련 에러 확인
   ```

### 검색이 안 돼요

**증상:**
```
검색창에 입력해도 결과 없음
또는 "Search failed" 오류
```

**해결:**
1. REST API 키 확인
   ```
   Vercel 환경 변수 KAKAO_REST_API_KEY 확인
   ```

2. 재배포 확인
   ```
   환경 변수 추가 후 Vercel 재배포했는지 확인
   ```

3. API 로그 확인
   ```
   Vercel Dashboard → 프로젝트 → Functions
   /api/search 로그 확인
   ```

4. Kakao Developers 상태 확인
   ```
   통계 메뉴에서 API 호출이 기록되는지 확인
   ```

### 403 Forbidden 오류

**증상:**
```
Network 탭에서 Kakao API 요청이 403 에러
```

**원인:**
```
도메인이 플랫폼에 등록되지 않음
```

**해결:**
```
1. 정확한 도메인 확인:
   브라우저 주소창 URL 복사

2. Kakao Developers 플랫폼 설정:
   복사한 URL 그대로 등록

3. 저장 후 5분 대기 (전파 시간)
```

### 429 Too Many Requests 오류

**증상:**
```
API 호출 시 429 에러
```

**원인:**
```
무료 할당량 초과 (월 300,000건)
```

**해결:**
```
1. 통계 메뉴에서 사용량 확인
2. 유료 전환 고려
3. 또는 캐싱 로직 추가
```

---

## 체크리스트

### 필수 설정
- [ ] REST API 키 복사 완료
- [ ] Vercel 환경 변수에 추가
- [ ] 웹 플랫폼에 Vercel URL 등록
- [ ] `https://` 프로토콜 확인
- [ ] 저장 완료

### 확인 사항
- [ ] JavaScript 키 확인 (지도용)
- [ ] REST API 키 확인 (검색용)
- [ ] 두 키가 다른 키임을 확인
- [ ] 도메인 등록 확인

### 테스트
- [ ] 배포된 사이트에서 지도 표시 확인
- [ ] 검색 기능 작동 확인
- [ ] 브라우저 콘솔 에러 없음 확인

---

## 키 정리표

| 키 종류 | 용도 | 환경 변수 | 위치 |
|---------|------|-----------|------|
| JavaScript 키 | 지도 표시 | `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | 클라이언트 |
| REST API 키 | 장소 검색 | `KAKAO_REST_API_KEY` | 서버 |
| Native 앱 키 | 안 씀 | - | - |
| Admin 키 | 안 씀 | - | - |

---

## 추가 리소스

### 공식 문서
- Kakao Maps: https://apis.map.kakao.com/web/documentation/
- Kakao Local: https://developers.kakao.com/docs/latest/ko/local/dev-guide

### 고객 센터
- 데브톡: https://devtalk.kakao.com
- 문의: developers@kakao.com

---

**완료되면 → DEPLOYMENT.md 4단계로 이동하여 배포 확인!**
