# DCinside-web - 학급 관리 웹 애플리케이션

React + TypeScript + Vite로 만든 학급 관리 시스템입니다.

## 기술 스택

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **External API**: 밥.net (급식 정보)

## 프로젝트 구조

```
dcinside-web/
├── src/
│   ├── components/      # 재사용 가능한 컴포넌트
│   │   └── FeatureCard.tsx
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── Home.tsx
│   │   ├── Seats.tsx
│   │   ├── Meals.tsx
│   │   ├── Notices.tsx
│   │   └── Suggestions.tsx
│   ├── hooks/          # 커스텀 훅
│   ├── utils/          # 유틸리티 함수
│   ├── types/          # TypeScript 타입 정의
│   │   └── index.ts
│   ├── config/         # 설정 파일
│   │   └── firebase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example        # 환경 변수 예시
└── README.md
```

## 주요 기능

1. **자리 배치표** - 학생들의 자리 배치 관리
2. **급식 정보** - 일일 급식 메뉴 확인
3. **공지사항** - 중요한 공지사항 게시
4. **건의사항** - 익명 건의사항 작성 및 관리

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

1. `.env.example` 파일을 `.env`로 복사
2. Supabase 프로젝트 설정 값을 입력

```bash
cp .env.example .env
```

필수 환경 변수:
- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Key

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프리뷰

```bash
npm run preview
```

## 개발 가이드

### 새로운 페이지 추가

1. `src/pages/` 에 새 페이지 컴포넌트 생성
2. `src/App.tsx` 에 라우트 추가
3. 인증이 필요한 페이지는 `<ProtectedRoute>` 로 감싸기

### 타입 정의

모든 타입은 `src/types/index.ts` 에 정의되어 있습니다.

### 스타일링

Tailwind CSS를 사용하여 유틸리티 클래스로 스타일링합니다.

---

## 🔧 문제 해결 (Troubleshooting)

### 캐시 문제로 인한 무한 로딩

개발 중 브라우저 캐시로 인해 페이지가 무한 로딩되거나 오래된 데이터가 표시될 수 있습니다.

#### 즉시 해결 방법:

**1. 브라우저 캐시 완전히 삭제**
```
Windows: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete

→ "전체 기간" 선택
→ "쿠키 및 기타 사이트 데이터" 체크
→ "캐시된 이미지 및 파일" 체크
→ "데이터 삭제" 클릭
→ 브라우저 재시작
```

**2. 개발자 도구에서 캐시 비활성화**
```
F12 → Network 탭 → "Disable cache" 체크
(개발자 도구를 열어둔 상태로 작업)
```

**3. Supabase 세션 클리어 (개발 환경 전용)**

브라우저 콘솔(F12 → Console)에서:
```javascript
// Supabase 세션만 클리어
window.clearSupabaseCache()

// 또는 전체 캐시 클리어
window.clearAppCache()
```

실행 후 새로고침(`Ctrl + R`)

#### 자동화된 캐시 관리:

개발 서버는 자동으로 다음 설정을 적용합니다:
- 서버 응답 헤더에 `Cache-Control: no-store` 추가
- Supabase 세션 자동 갱신
- 개발 환경에서만 캐시 클리어 함수 노출

### 건의사항 상태 변경 오류

**오류**: `suggestions_status_check constraint violation`

**원인**: 상태 값이 데이터베이스 제약조건과 맞지 않음

**해결**: 코드에서 정의된 상태 값 확인
- 허용된 상태: `'pending'`, `'reviewed'`
- ❌ 잘못된 값: `'confirmed'`, `'completed'` 등

### Supabase 연결 문제

1. `.env` 파일의 환경 변수 확인
2. Supabase Dashboard에서 프로젝트 URL과 Anon Key 재확인
3. 네트워크 탭에서 API 요청 상태 확인

---

## 라이선스

MIT
