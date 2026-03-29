export type Plan = 'free' | 'pro'
export type AccountType = 'personal' | 'team'
export type EventType = 'group' | 'personal'
export type InsightType = 'bible' | 'general' | 'user_choice'
export type EventStatus = 'draft' | 'active' | 'completed'
export type UserRole = 'student' | 'teacher'
export type ContentType = 'photo' | 'notice' | 'summary'
export type ProductType = 'individual_pdf' | 'group_pdf' | 'pro_plan'
export type PaymentStatus = 'pending' | 'success' | 'failed'

export interface User {
  id: string
  email: string
  name: string | null
  plan: Plan
  account_type: AccountType
  credits: number
  created_at: string
}

export interface Event {
  id: string
  creator_id: string
  name: string
  event_type: EventType
  category: string
  insight_type: InsightType
  raw_schedule: string | null
  dates_start: string | null
  dates_end: string | null
  participant_count: number | null
  author_name: string | null
  qr_code_url: string | null
  theme: string | null
  publisher_name: string | null
  publisher_org: string | null
  publish_date: string | null
  copyright_text: string | null
  status: EventStatus
  created_at: string
}

export interface Section {
  id: string
  event_id: string
  order: number
  date: string | null
  time: string | null
  original_title: string
  book_title: string
  description: string | null
  created_at: string
}

export interface Participant {
  id: string
  event_id: string
  name: string
  sub_info: string | null
  session_token: string | null
  record_count: number
  created_at: string
}

export interface BibleQuote {
  theme: string
  book: string
  chapter: number
  verse: number
  text: string
  reference: string
  why: string
}

export interface GeneralQuote {
  theme: string
  text: string
  author: string
  origin: string
  why: string
}

export interface QuotesJSON {
  type: 'bible' | 'general'
  quotes: BibleQuote[] | GeneralQuote[]
}

export interface Entry {
  id: string
  section_id: string
  participant_id: string | null
  user_id: string | null
  user_role: UserRole
  memo: string | null
  ai_essay: string | null
  quotes: QuotesJSON | null
  photo_url: string | null
  ai_image_url: string | null
  is_draft: boolean
  created_at: string
  updated_at: string
}

export interface GroupContent {
  id: string
  event_id: string
  content_type: ContentType
  content_text: string | null
  file_url: string | null
  created_at: string
}

export interface Book {
  id: string
  event_id: string
  summary: string | null
  pdf_url: string | null
  rendered_at: string | null
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  event_id: string
  product_type: ProductType
  amount: number
  currency: string
  status: PaymentStatus
  payment_key: string | null
  paid_at: string | null
  created_at: string
}
