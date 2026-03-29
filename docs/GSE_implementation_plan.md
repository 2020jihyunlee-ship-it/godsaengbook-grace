# 갓생북 은혜 — 구현 플랜
> v1.0 · 2026.03 · 유스케이스 v1.0 기반

---

## 1. 기술 스택 확정

| 영역 | 기술 | 비고 |
|---|---|---|
| Framework | Next.js 15 (App Router) | PWA 지원 |
| Language | TypeScript | 전체 적용 |
| Styling | Tailwind CSS | Mobile-first |
| Auth / DB / Storage | Supabase | 별도 프로젝트 생성 |
| Flipbook Viewer | react-pageflip | 클라이언트 렌더링 |
| PDF Builder | html2pdf.js | 클라이언트 사이드, PC 전용 |
| 배포 | Vercel | 별도 프로젝트, 별도 도메인 |
| GitHub | 별도 레포 | 갓생북과 독립적으로 관리 |
| 상태관리 | useSWR + React Context | 서버 상태 / 글로벌 상태 |

> **AI 없음** — Gemini, 이미지 생성 API 일체 없음. 외부 API 비용 없음.

---

## 2. 프로젝트 파일 구조

```
갓생북 은혜/
├── app/
│   ├── (auth)/
│   │   ├── login/          page.tsx
│   │   └── signup/         page.tsx   ← 마케팅 수신 동의 포함
│   ├── (dashboard)/
│   │   ├── dashboard/      page.tsx   ← 계정 사용자 대시보드
│   │   └── events/
│   │       ├── new/        page.tsx   ← 이벤트 생성
│   │       └── [id]/
│   │           ├── page.tsx           ← 이벤트 상세 / 모니터링
│   │           └── contents/page.tsx ← 그룹 콘텐츠 업로드
│   ├── (participant)/
│   │   ├── join/[eventId]/ page.tsx   ← QR 접속 / 이름 입력
│   │   ├── record/         page.tsx   ← 기록 입력
│   │   └── flipbook/[id]/  page.tsx   ← 플립북 감상
│   ├── api/
│   │   ├── events/         route.ts
│   │   ├── participants/   route.ts
│   │   ├── entries/        route.ts
│   │   ├── group-contents/ route.ts
│   │   └── flipbook/[id]/  route.ts
│   └── page.tsx                       ← 랜딩페이지 (예시 보기 포함)
├── components/
│   ├── flipbook/
│   │   ├── FlipbookViewer.tsx
│   │   ├── TitlePage.tsx
│   │   ├── EntryPage.tsx              ← 본문 + 성경 구절 + 인용 문구 + 사진
│   │   └── GroupContentPage.tsx
│   ├── record/
│   │   ├── RecordForm.tsx             ← 기록 입력 폼
│   │   ├── GuideTemplate.tsx          ← 묵상 가이드 질문 + 예시글
│   │   ├── PhotoUpload.tsx            ← 카메라/사진첩 + 템플릿 이미지 선택
│   │   └── TemplateImagePicker.tsx    ← 기본 템플릿 이미지 선택
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── SampleFlipbook.tsx         ← 예시 플립북 미리보기
│   │   └── EventTypeCards.tsx
│   └── ui/                            ← 공통 컴포넌트
├── lib/
│   ├── supabase.ts
│   ├── guide-templates.ts             ← 이벤트 유형별 묵상 가이드 질문 + 예시글
│   ├── template-images.ts             ← 기본 템플릿 이미지 목록
│   └── pdf-builder.ts                 ← html2pdf.js 래퍼
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
└── types/
    └── index.ts
```

---

## 3. 구현 단계

### Phase 1 — 기반 설정 (1~2일)
- [ ] GitHub 레포 생성 (별도, 갓생북과 독립)
- [ ] Next.js 15 + TypeScript + Tailwind 프로젝트 초기화
- [ ] Supabase 프로젝트 생성 (별도)
- [ ] DB 스키마 마이그레이션 (`users`, `events`, `sections`, `participants`, `entries`, `group_contents`)
- [ ] RLS 정책 설정
- [ ] Vercel 프로젝트 연결 + 환경변수 설정
- [ ] 별도 Vercel 배포 URL 확보

### Phase 2 — 인증 & 랜딩 (1일)
- [ ] Supabase Auth 연동 (이메일/비밀번호)
- [ ] 회원가입 페이지: 마케팅 수신 동의 체크박스 포함
- [ ] 로그인 페이지
- [ ] 랜딩페이지: Hero + 이벤트 유형 카드 + **예시 플립북 미리보기** + CTA

### Phase 3 — 이벤트 생성 & 관리 (1~2일)
- [ ] 이벤트 생성 폼 (유형 선택 — 수련회/선교여행/캠프/예배/모임/개인)
- [ ] QR 코드 생성 및 표시
- [ ] 이벤트 대시보드 (모니터링: 참여자 목록, 기록 현황)
- [ ] 그룹 콘텐츠 업로드 (사진/공지/총평)
- [ ] 섹션(목차) 수동 등록

### Phase 4 — 참여자 기록 입력 (2일)
- [ ] QR 접속 페이지 (이름 입력 → 세션 생성)
- [ ] 기록 입력 폼
  - [ ] 묵상 가이드 질문 (이벤트 유형별 — `guide-templates.ts`)
  - [ ] 예시 완성글 보기 UI
  - [ ] 본문 / 성경 구절 / 인용 문구 입력 필드
  - [ ] 사진 업로드 (카메라 + 사진첩)
  - [ ] 기본 템플릿 이미지 선택 (사진 없을 때)
- [ ] 저장 로직 + 자동 임시저장 (debounce upsert)

### Phase 5 — 플립북 뷰어 (2일)
- [ ] react-pageflip 연동
- [ ] EntryPage 컴포넌트 (본문 + 성경 구절 + 인용 문구 + 사진)
- [ ] GroupContentPage 컴포넌트
- [ ] TitlePage 컴포넌트
- [ ] 책장 넘기기 애니메이션 + 사운드
- [ ] PWA 오프라인 캐시

### Phase 6 — PDF 다운로드 (1일)
- [ ] `html2pdf.js` 연동
- [ ] 개별 참여자 PDF 빌드
- [ ] 그룹 통합 PDF 빌드
- [ ] 모바일 접속 시 PC 안내 메시지

### Phase 7 — 마무리 & 배포 (1일)
- [ ] 모바일 반응형 전체 점검
- [ ] PWA 설정 (`manifest.json`, Service Worker)
- [ ] Supabase Storage 버킷 + RLS 최종 확인
- [ ] Vercel 프로덕션 배포
- [ ] 환경변수 최종 점검

---

## 4. 갓생북(원본)과의 차이점 요약

| 항목 | 갓생북 | 갓생북 은혜 |
|---|---|---|
| AI 에세이 생성 | Gemini API | 없음 (직접 작성) |
| AI 성경 구절 추천 | Gemini API | 없음 (직접 입력) |
| AI 이미지 생성 | Google AI API | 없음 (템플릿 이미지) |
| 기록 횟수 제한 | 3회 무료 | 무제한 |
| 결제 시스템 | Stripe / PortOne | 없음 |
| PDF 다운로드 | 유료 | 무료 |
| 이벤트 유형 | 범용 (교회/비교회) | 교회 전용 |
| 이메일 수집 | 기본 | 마케팅 수신 동의 포함 |
| 비용 | AI API 비용 발생 | $0 (무료 티어) |

---

## 5. 배포 환경 변수 (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> AI API 키 없음.

---

## 6. 이메일 활용 전략

- 회원가입 시 모든 계정 사용자 이메일 수집 (서비스 공지 목적)
- `marketing_consent = true` 사용자 대상: 갓생북 유료 버전 출시 / 업그레이드 소식 발송
- 향후 Supabase Edge Functions 또는 외부 이메일 서비스(Resend, Mailchimp 등)와 연동 가능
