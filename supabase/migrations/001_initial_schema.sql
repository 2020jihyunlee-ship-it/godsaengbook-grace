-- =============================================
-- 갓생북 초기 스키마 마이그레이션
-- =============================================

-- 1. users (계정 사용자)
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text,
  plan          text NOT NULL DEFAULT 'free',
  credits       int  NOT NULL DEFAULT 10,
  created_at    timestamptz DEFAULT now()
);

-- 2. events (이벤트)
CREATE TABLE IF NOT EXISTS events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        uuid REFERENCES users(id) ON DELETE CASCADE,
  name              text NOT NULL,
  event_type        text NOT NULL CHECK (event_type IN ('group', 'personal')),
  category          text NOT NULL,
  insight_type      text NOT NULL CHECK (insight_type IN ('bible', 'general', 'user_choice')),
  raw_schedule      text,
  dates_start       date,
  dates_end         date,
  participant_count int,
  author_name       text,
  qr_code_url       text,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at        timestamptz DEFAULT now()
);

-- 3. sections (목차 — A-1 AI 생성)
CREATE TABLE IF NOT EXISTS sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES events(id) ON DELETE CASCADE,
  "order"         int  NOT NULL,
  date            date,
  time            time,
  original_title  text NOT NULL,
  book_title      text NOT NULL,
  description     text,
  created_at      timestamptz DEFAULT now()
);

-- 4. participants (단체 이벤트 참여자)
CREATE TABLE IF NOT EXISTS participants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES events(id) ON DELETE CASCADE,
  name            text NOT NULL,
  sub_info        text,
  session_token   text UNIQUE,
  record_count    int  NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- 5. entries (기록)
CREATE TABLE IF NOT EXISTS entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      uuid REFERENCES sections(id) ON DELETE CASCADE,
  participant_id  uuid REFERENCES participants(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  user_role       text NOT NULL DEFAULT 'student' CHECK (user_role IN ('student', 'teacher')),
  memo            text,
  ai_essay        text,
  quotes          jsonb,
  photo_url       text,
  ai_image_url    text,
  is_draft        boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 6. group_contents (리더 업로드 공통 콘텐츠)
CREATE TABLE IF NOT EXISTS group_contents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES events(id) ON DELETE CASCADE,
  content_type    text NOT NULL CHECK (content_type IN ('photo', 'notice', 'summary')),
  content_text    text,
  file_url        text,
  created_at      timestamptz DEFAULT now()
);

-- 7. books (프로그램당 1권)
CREATE TABLE IF NOT EXISTS books (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        uuid REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  summary         text,
  pdf_url         text,
  rendered_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- 8. payments
CREATE TABLE IF NOT EXISTS payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),
  event_id        uuid REFERENCES events(id),
  product_type    text NOT NULL CHECK (product_type IN ('individual_pdf', 'group_pdf', 'pro_plan')),
  amount          int  NOT NULL,
  currency        text DEFAULT 'KRW',
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  payment_key     text,
  paid_at         timestamptz,
  created_at      timestamptz DEFAULT now()
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
  INSERT INTO users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- RLS (Row Level Security) 활성화
-- =============================================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE books          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 정책
-- =============================================

-- users: 본인만 조회/수정
CREATE POLICY "users_self" ON users
  FOR ALL USING (auth.uid() = id);

-- events: creator만 전체 권한 / 참여자는 조회만
CREATE POLICY "events_creator" ON events
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "events_read_public" ON events
  FOR SELECT USING (status = 'active');

-- sections: 이벤트 creator 또는 참여자 조회
CREATE POLICY "sections_read" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = sections.event_id
        AND (events.creator_id = auth.uid() OR events.status = 'active')
    )
  );

CREATE POLICY "sections_write" ON sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = sections.event_id
        AND events.creator_id = auth.uid()
    )
  );

-- participants: creator 조회 / 본인 수정
CREATE POLICY "participants_creator_read" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
        AND events.creator_id = auth.uid()
    )
  );

-- entries: 본인(participant or user) + creator 조회
CREATE POLICY "entries_own" ON entries
  FOR ALL USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM participants p
      JOIN events e ON e.id = p.event_id
      WHERE p.id = entries.participant_id
        AND e.creator_id = auth.uid()
    )
  );

-- group_contents: creator 쓰기 / 참여자 읽기
CREATE POLICY "group_contents_creator_write" ON group_contents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = group_contents.event_id
        AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "group_contents_read" ON group_contents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = group_contents.event_id
        AND events.status = 'active'
    )
  );

-- books: creator만
CREATE POLICY "books_creator" ON books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = books.event_id
        AND events.creator_id = auth.uid()
    )
  );

-- payments: 본인만
CREATE POLICY "payments_own" ON payments
  FOR ALL USING (user_id = auth.uid());
