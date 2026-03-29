-- =============================================
-- 갓생북 은혜 초기 스키마 마이그레이션
-- v1.0 · 2026.03 · AI 없음, 완전 무료
-- =============================================

-- 1. users (계정 사용자)
CREATE TABLE IF NOT EXISTS users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  name               text,
  church_name        text,                          -- 소속 교회 (선택)
  marketing_consent  boolean NOT NULL DEFAULT false, -- 마케팅 수신 동의
  created_at         timestamptz DEFAULT now()
);

-- 2. events (이벤트)
CREATE TABLE IF NOT EXISTS events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  name              text NOT NULL,
  event_type        text NOT NULL CHECK (event_type IN ('group', 'personal')),
  category          text NOT NULL CHECK (category IN ('수련회', '선교여행', '캠프', '예배', '모임', '개인')),
  dates_start       date,
  dates_end         date,
  participant_count int,
  qr_code_url       text,                           -- 단체 이벤트만, 개인은 NULL
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed')),
  created_at        timestamptz DEFAULT now()
);

-- 3. sections (목차 — 리더가 수동 등록)
CREATE TABLE IF NOT EXISTS sections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES events(id) ON DELETE CASCADE,
  "order"        int  NOT NULL,
  title          text NOT NULL,                     -- 섹션명 (예: 첫째 날 저녁 예배)
  section_date   date,
  section_time   time,
  created_at     timestamptz DEFAULT now()
);

-- 4. participants (단체 이벤트 참여자 — 회원가입 불필요)
CREATE TABLE IF NOT EXISTS participants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES events(id) ON DELETE CASCADE,
  name           text NOT NULL,
  sub_info       text,                              -- 소속/반/번호 (동명이인 구분)
  session_token  text UNIQUE NOT NULL,              -- localStorage 캐싱용
  record_count   int  NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

-- 5. entries (기록 — 직접 작성)
CREATE TABLE IF NOT EXISTS entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES events(id) ON DELETE CASCADE,
  section_id      uuid REFERENCES sections(id) ON DELETE SET NULL,
  participant_id  uuid REFERENCES participants(id) ON DELETE SET NULL,  -- 단체 이벤트
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,          -- 개인 이벤트
  -- 직접 작성 필드
  body_text       text,                             -- 본문 (최대 500자)
  bible_verse     text,                             -- 성경 구절 직접 입력 (선택)
  quote_text      text,                             -- 인용 문구 직접 입력 (선택)
  -- 사진
  photo_url       text,                             -- 직접 업로드 사진 URL
  template_image  text,                             -- 기본 템플릿 이미지 key (사진 없을 때)
  is_draft        boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 6. group_contents (리더 업로드 공통 콘텐츠)
CREATE TABLE IF NOT EXISTS group_contents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid REFERENCES events(id) ON DELETE CASCADE,
  content_type  text NOT NULL CHECK (content_type IN ('photo', 'notice', 'summary')),
  content_text  text,
  file_url      text,
  page_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- =============================================
-- updated_at 자동 갱신 트리거 (entries)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- users 자동 생성 트리거 (Supabase Auth 연동)
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, church_name, marketing_consent)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'church_name',
    (NEW.raw_user_meta_data->>'marketing_consent')::boolean
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- RLS 활성화
-- =============================================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_contents ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 정책
-- =============================================

-- users: 본인만
CREATE POLICY "users_self" ON users
  FOR ALL USING (auth.uid() = id);

-- events: creator 전체 / 참여자 조회
CREATE POLICY "events_creator" ON events
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "events_read_active" ON events
  FOR SELECT USING (status = 'active');

-- sections: creator 쓰기 / active 이벤트 조회
CREATE POLICY "sections_write" ON sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = sections.event_id AND events.creator_id = auth.uid())
  );

CREATE POLICY "sections_read" ON sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = sections.event_id AND events.status = 'active')
  );

-- participants: creator 조회 / 세션 토큰은 API 레이어에서 처리
CREATE POLICY "participants_creator_read" ON participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.creator_id = auth.uid())
  );

CREATE POLICY "participants_insert" ON participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.status = 'active')
  );

-- entries: 본인 + creator 조회
CREATE POLICY "entries_own_user" ON entries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "entries_creator_read" ON entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events WHERE events.id = entries.event_id AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "entries_participant_insert" ON entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = entries.event_id AND events.status = 'active')
  );

-- group_contents: creator 쓰기 / active 이벤트 조회
CREATE POLICY "group_contents_write" ON group_contents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = group_contents.event_id AND events.creator_id = auth.uid())
  );

CREATE POLICY "group_contents_read" ON group_contents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = group_contents.event_id AND events.status = 'active')
  );
