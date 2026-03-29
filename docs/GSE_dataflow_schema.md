# 갓생북 은혜 — 데이터 플로우 & DB 스키마
> v1.0 · 2026.03 · PRD v1.0 기반

---

## 1. 전체 데이터 플로우

### A. 계정 사용자 플로우

```
[계정 사용자] 회원가입 (Supabase Auth)
  이메일, 비밀번호, 이름, 소속 교회, marketing_consent 저장
        │
        ▼
  이벤트 유형 선택
  ┌──────────────────────┬───────────────────────┐
  │  단체 이벤트          │  개인 기록 이벤트       │
  │  (수련회/선교/캠프 등) │  (개인 묵상/여정)       │
  └──────────┬───────────┴──────────┬────────────┘
             │                      │
             ▼                      ▼
  이벤트 설정 입력            이벤트명 + 카테고리 설정
  (이름/기간/인원/유형)
             │                      │
             ▼                      ▼
  QR 코드 생성 & 저장         QR 없음 (본인 직접 접근)
             │                      │
             └──────────┬───────────┘
                        ▼
              events 테이블 저장
                        │
               ┌────────┴────────┐
               ▼                 ▼
  [참여자 기록 모니터링]  [그룹 공통 콘텐츠 업로드]
  (참여자 목록, 기록 수)  (단체 사진, 공지, 총평)
                                  → Supabase Storage
                        │
                        ▼
              [PDF 다운로드 요청]
              결제 없음 — 바로 진행
                        │
                        ▼
              client-side PDF 빌드
              (html2pdf.js, PC 브라우저)
                        │
                        ▼
              .pdf 파일 로컬 다운로드
```

---

### B. 참여자 플로우 (단체 이벤트)

```
[참여자] QR 코드 스캔 (모바일)
        │
        ▼
  이름 입력 → 세션 생성
  (participants 테이블 저장 + localStorage 캐싱)
        │
        ▼
  '나의 플립북' 대시보드
        │
        ▼
  '기록하기' → 섹션 선택
        │
        ▼
  입력: 텍스트 직접 작성 (최대 500자)
  + 성경 구절 직접 입력 (선택)
  + 인용 문구 직접 입력 (선택)
  + 사진 업로드 (권장) or 템플릿 이미지 선택
        │
        ▼
  '저장하기' 탭
        │
        ▼
  entries 테이블 저장 (Supabase DB)
  사진 → Supabase Storage 저장
        │
        ▼
  플립북 대시보드 실시간 업데이트
  (새 페이지 반영)
```

---

## 2. DB 스키마 (Supabase PostgreSQL)

### `users` — 계정 사용자

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,         -- 마케팅 이메일 수집
  name            TEXT NOT NULL,
  church_name     TEXT,                         -- 소속 교회 (선택)
  marketing_consent BOOLEAN DEFAULT false,      -- 마케팅 수신 동의
  created_at      TIMESTAMPTZ DEFAULT now()
);
-- Supabase Auth와 연동: auth.users.id = users.id
```

### `events` — 이벤트 (단체 / 개인)

```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name      TEXT NOT NULL,
  event_type      TEXT NOT NULL,                -- 'retreat' | 'mission' | 'camp' | 'worship' | 'meeting' | 'personal'
  is_group        BOOLEAN DEFAULT true,         -- 단체(true) / 개인(false)
  start_date      DATE,
  end_date        DATE,
  expected_count  INTEGER,                      -- 예상 참여 인원
  qr_code_url     TEXT,                         -- 단체 이벤트만 생성, 개인은 NULL
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `sections` — 섹션 (일정 목차)

```sql
CREATE TABLE sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,                -- 섹션명 (예: "첫째 날 저녁 예배")
  section_order   INTEGER NOT NULL,
  section_date    DATE,
  section_time    TIME,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `participants` — 참여자 (단체 이벤트)

```sql
CREATE TABLE participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sub_group       TEXT,                         -- 소속/반/번호 (선택, 동명이인 구분)
  session_token   TEXT UNIQUE NOT NULL,         -- localStorage 캐싱용
  record_count    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `entries` — 개별 기록

```sql
CREATE TABLE entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  section_id      UUID REFERENCES sections(id),
  -- 작성자: 참여자(단체) 또는 계정 사용자(개인)
  participant_id  UUID REFERENCES participants(id),  -- 단체 이벤트
  user_id         UUID REFERENCES users(id),          -- 개인 이벤트
  -- 직접 작성 내용
  body_text       TEXT,                         -- 본문 (직접 작성)
  bible_verse     TEXT,                         -- 성경 구절 (직접 입력, 선택)
  quote_text      TEXT,                         -- 인용 문구 (직접 입력, 선택)
  -- 사진
  photo_url       TEXT,                         -- 직접 업로드 사진 URL
  template_image  TEXT,                         -- 기본 템플릿 이미지 key (사진 없을 때)
  -- 메타
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `group_contents` — 그룹 공통 콘텐츠 (리더 업로드)

```sql
CREATE TABLE group_contents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL,                -- 'photo' | 'notice' | 'summary'
  content_url     TEXT,                         -- 사진 URL (Supabase Storage)
  content_text    TEXT,                         -- 텍스트 콘텐츠
  page_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Supabase Storage 버킷 구조

```
participant-photos/
  └── {event_id}/{participant_id}/{entry_id}/photo.jpg

group-contents/
  └── {event_id}/{content_id}/image.jpg

template-images/
  └── church/
  │     church_01.jpg … church_10.jpg
  └── nature/
  │     nature_01.jpg … nature_10.jpg
  └── verse/
        verse_01.jpg … verse_10.jpg
```

---

## 4. API Routes (Vercel Functions)

AI 없음 — 최소한의 서버 로직만 담당.

| Route | Method | 역할 |
|---|---|---|
| `/api/events` | POST | 이벤트 생성, QR URL 생성 |
| `/api/events/[id]` | GET | 이벤트 상세 조회 |
| `/api/participants` | POST | 참여자 세션 생성 |
| `/api/entries` | POST | 기록 저장 |
| `/api/entries/[id]` | GET / PATCH | 기록 조회 / 수정 |
| `/api/group-contents` | POST | 그룹 콘텐츠 업로드 |
| `/api/flipbook/[eventId]` | GET | 플립북 전체 데이터 조회 |

---

## 5. Row Level Security (RLS) 정책

```
users:         본인만 조회/수정 가능
events:        creator_id = auth.uid() 만 수정/삭제 가능. 참여자는 read-only.
participants:  session_token 보유자만 본인 데이터 수정 가능
entries:       본인(participant / user) 만 생성/수정. event creator는 read-only.
group_contents: creator_id만 생성/수정. 참여자는 read-only.
```
