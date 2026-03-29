// 갓생북 은혜 타입 정의
// 갓생북 Supabase 공유 — 테이블명 grace_ 접두어

export type AccountType = 'personal' | 'team'
export type EventType = 'group' | 'personal'
export type GraceCategory = '수련회' | '선교' | '캠프' | '예배' | '모임' | '개인'
export type EventStatus = 'active' | 'completed'
export type ContentType = 'photo' | 'notice' | 'summary'

export interface GraceUser {
  id: string
  name: string | null
  church_name: string | null
  marketing_consent: boolean
  created_at: string
}

export interface GraceEvent {
  id: string
  creator_id: string
  name: string
  event_type: EventType
  category: GraceCategory
  dates_start: string | null
  dates_end: string | null
  participant_count: number | null
  qr_code_url: string | null
  status: EventStatus
  created_at: string
}

export interface GraceSection {
  id: string
  event_id: string
  order: number
  title: string
  section_date: string | null
  section_time: string | null
  created_at: string
}

export interface GraceParticipant {
  id: string
  event_id: string
  name: string
  sub_info: string | null
  session_token: string
  record_count: number
  created_at: string
}

export interface GraceEntry {
  id: string
  event_id: string
  section_id: string | null
  participant_id: string | null
  user_id: string | null
  body_text: string | null
  bible_verse: string | null
  quote_text: string | null
  photo_url: string | null
  template_image: string | null
  is_draft: boolean
  created_at: string
  updated_at: string
}

export interface GraceGroupContent {
  id: string
  event_id: string
  content_type: ContentType
  content_text: string | null
  file_url: string | null
  page_order: number
  created_at: string
}

// 플립북 렌더링용 — 참여자 정보와 기록 합본
export interface GraceEntryWithParticipant extends GraceEntry {
  participant?: Pick<GraceParticipant, 'name' | 'sub_info'>
  section?: Pick<GraceSection, 'title'>
}

// 하위 호환 alias (갓생북에서 가져온 페이지들이 사용)
export type Event = GraceEvent
export type Section = GraceSection
export type Participant = GraceParticipant
export type Entry = GraceEntry
export type GroupContent = GraceGroupContent
export type InsightType = 'bible'
export type BibleQuote = { theme: string; reference: string; text: string; why: string }
export type GeneralQuote = { theme: string; text: string; author: string; why: string }
