-- =============================================
-- 갓생북 은혜 스키마 (갓생북 Supabase 공유)
-- 모든 테이블은 grace_ 접두어 사용
-- Auth는 기존 갓생북 auth.users 공유
-- v1.0 · 2026.03
-- =============================================

-- 1. grace_users (은혜 전용 사용자 프로필)
--    auth.users는 갓생북과 공유, 은혜 전용 필드만 별도 저장
CREATE TABLE IF NOT EXISTS grace_users (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name               text,
  church_name        text,
  marketing_consent  boolean NOT NULL DEFAULT false,
  created_at         timestamptz DEFAULT now()
);

-- 2. grace_events
CREATE TABLE IF NOT EXISTS grace_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name              text NOT NULL,
  event_type        text NOT NULL CHECK (event_type IN ('group', 'personal')),
  category          text NOT NULL CHECK (category IN ('수련회', '선교여행', '캠프', '예배', '모임', '개인')),
  dates_start       date,
  dates_end         date,
  participant_count int,
  qr_code_url       text,
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed')),
  created_at        timestamptz DEFAULT now()
);

-- 3. grace_sections (목차 — 리더 수동 등록)
CREATE TABLE IF NOT EXISTS grace_sections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES grace_events(id) ON DELETE CASCADE,
  "order"        int  NOT NULL,
  title          text NOT NULL,
  section_date   date,
  section_time   time,
  created_at     timestamptz DEFAULT now()
);

-- 4. grace_participants (단체 이벤트 참여자 — 회원가입 불필요)
CREATE TABLE IF NOT EXISTS grace_participants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       uuid REFERENCES grace_events(id) ON DELETE CASCADE,
  name           text NOT NULL,
  sub_info       text,
  session_token  text UNIQUE NOT NULL,
  record_count   int  NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now()
);

-- 5. grace_entries (기록 — 직접 작성)
CREATE TABLE IF NOT EXISTS grace_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES grace_events(id) ON DELETE CASCADE,
  section_id      uuid REFERENCES grace_sections(id) ON DELETE SET NULL,
  participant_id  uuid REFERENCES grace_participants(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body_text       text,
  bible_verse     text,
  quote_text      text,
  photo_url       text,
  template_image  text,
  is_draft        boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 6. grace_group_contents (리더 업로드 공통 콘텐츠)
CREATE TABLE IF NOT EXISTS grace_group_contents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid REFERENCES grace_events(id) ON DELETE CASCADE,
  content_type  text NOT NULL CHECK (content_type IN ('photo', 'notice', 'summary')),
  content_text  text,
  file_url      text,
  page_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- =============================================
-- updated_at 트리거 (grace_entries)
-- =============================================
CREATE OR REPLACE FUNCTION grace_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grace_entries_updated_at
  BEFORE UPDATE ON grace_entries
  FOR EACH ROW EXECUTE FUNCTION grace_update_updated_at();

-- =============================================
-- grace_users 자동 생성 트리거
-- 갓생북 은혜로 가입 시 grace_users row 생성
-- =============================================
CREATE OR REPLACE FUNCTION handle_grace_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO grace_users (id, name, church_name, marketing_consent)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'church_name',
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주의: 갓생북의 on_auth_user_created 트리거와 충돌 방지
-- 갓생북 은혜 가입자는 app_metadata로 구분 가능
-- 아래 트리거는 필요 시 활성화 (갓생북과 auth 완전 공유 시 주석 처리)
-- CREATE TRIGGER on_grace_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_grace_new_user();

-- =============================================
-- RLS 활성화
-- =============================================
ALTER TABLE grace_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_participants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE grace_group_contents ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 정책
-- =============================================

-- grace_users: 본인만
CREATE POLICY "grace_users_self" ON grace_users
  FOR ALL USING (auth.uid() = id);

-- grace_events: creator 전체 / active 이벤트 조회
CREATE POLICY "grace_events_creator" ON grace_events
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "grace_events_read_active" ON grace_events
  FOR SELECT USING (status = 'active');

-- grace_sections
CREATE POLICY "grace_sections_write" ON grace_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_sections.event_id AND grace_events.creator_id = auth.uid())
  );

CREATE POLICY "grace_sections_read" ON grace_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_sections.event_id AND grace_events.status = 'active')
  );

-- grace_participants
CREATE POLICY "grace_participants_creator_read" ON grace_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_participants.event_id AND grace_events.creator_id = auth.uid())
  );

CREATE POLICY "grace_participants_insert" ON grace_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_participants.event_id AND grace_events.status = 'active')
  );

-- grace_entries
CREATE POLICY "grace_entries_own_user" ON grace_entries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "grace_entries_creator_read" ON grace_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_entries.event_id AND grace_events.creator_id = auth.uid())
  );

CREATE POLICY "grace_entries_participant_insert" ON grace_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_entries.event_id AND grace_events.status = 'active')
  );

-- grace_group_contents
CREATE POLICY "grace_group_contents_write" ON grace_group_contents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_group_contents.event_id AND grace_events.creator_id = auth.uid())
  );

CREATE POLICY "grace_group_contents_read" ON grace_group_contents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM grace_events WHERE grace_events.id = grace_group_contents.event_id AND grace_events.status = 'active')
  );
