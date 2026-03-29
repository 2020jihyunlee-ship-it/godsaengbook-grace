// ─────────────────────────────────────────────────────────────
// 갓생북 테마 시스템
// 모든 테마는 CSS 변수로 관리됩니다.
// 새 테마 추가: THEMES 객체에 ThemeDef 하나 추가하면 끝.
// ─────────────────────────────────────────────────────────────

export type ThemeId =
  | 'luxe-cream'
  | 'sacred'
  | 'adventure'
  | 'editorial'
  | 'archive'
  | 'mission'
  | 'minimal'

/** CSS 변수 맵 — 컴포넌트에서 var(--color-bg) 형태로 사용 */
export interface ThemeVars {
  // 필수 변수 (user-specified)
  '--color-bg':       string
  '--color-primary':  string
  '--color-accent':   string
  '--color-text':     string
  '--font-serif':     string
  '--font-sans':      string

  // 확장 변수 (레이아웃 세부 조정용)
  '--color-surface':      string   // 카드/섹션 배경
  '--color-text-muted':   string   // 흐린 텍스트
  '--color-accent-soft':  string   // rgba 약한 포인트
  '--color-divider':      string   // 구분선
  '--hero-overlay':       string   // 히어로 오버레이 gradient
  '--hero-fallback':      string   // 사진 없을 때 hero 배경
  '--header-bg':          string   // 헤더 backdrop
  '--header-border':      string   // 헤더 하단선

  // 테마 특성 변수
  '--photo-border':       string   // 사진 테두리 (sacred: 골드 프레임, 기본: none)
  '--top-line-opacity':   string   // 페이지 상단 골드 라인 투명도 (0 or 1)
  '--chapter-style':      string   // 챕터 번호 스타일 ('roman' | 'numeric')
  '--photo-radius':       string   // 사진 모서리 둥글기 (adventure: 4px, 기본: 2px)
  '--divider-style':      string   // 구분선 스타일 ('solid' | 'dashed' | 'dotted')
  '--texture-opacity':    string   // 종이 질감 노이즈 투명도 (adventure/archive: ~0.04)
  '--date-style':         string   // 날짜 표시 스타일 ('stamp' | 'default')
  '--photo-filter':       string   // CSS filter (archive: sepia 30%, 기본: none)
  '--photo-shadow':       string   // 사진 컨테이너 box-shadow (archive: vintage frame)
  '--date-font':          string   // 날짜 전용 폰트 (archive: Caveat 손글씨)
  '--location-icon':      string   // 날짜 앞 아이콘 접두사 (archive: '📍 ')
  '--quote-bar':          string   // 인용구 왼쪽 세로선 색상 (mission: 오렌지, 기본: transparent)
  '--meaning-box':        string   // 사진 아래 "이 순간의 의미" 박스 ('show' | 'hide')
  '--heading-weight':     string   // 제목 폰트 웨이트 (minimal: '500', 기본: '700')
  '--body-weight':        string   // 본문 폰트 웨이트 (minimal: '300', 기본: '400')
  '--ornament-opacity':   string   // 골드 장식 요소 투명도 (minimal: '0', 기본: '1')
}

export interface ThemeDef {
  id: ThemeId
  name: string          // 영문 표시명
  label: string         // 한국어 표시명
  vars: ThemeVars
  swatch: [string, string, string]  // ThemePicker 미리보기 색상
}

// ── 테마 목록 ───────────────────────────────────────────────

export const THEMES: Record<ThemeId, ThemeDef> = {

  // ①  Luxe Cream — 여행 (현재 기본 스타일)
  'luxe-cream': {
    id: 'luxe-cream',
    name: 'Luxe Cream',
    label: '럭스 크림',
    swatch: ['#FEFCF8', '#B8975A', '#1c1714'],
    vars: {
      '--color-bg':          '#FEFCF8',
      '--color-primary':     '#1c1714',
      '--color-accent':      '#B8975A',
      '--color-text':        '#3d342e',
      '--font-serif':        "'Noto Serif KR', Georgia, serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#F5F0E8',
      '--color-text-muted':  '#9e9690',
      '--color-accent-soft': 'rgba(184,151,90,0.15)',
      '--color-divider':     'rgba(184,151,90,0.15)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.68) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #1A1A2E 0%, #1A4F8A 60%, #0d3060 100%)',
      '--header-bg':         'rgba(254,252,248,0.92)',
      '--header-border':     'rgba(184,151,90,0.15)',
      '--photo-border':      'none',
      '--top-line-opacity':  '0',
      '--chapter-style':     'numeric',
      '--photo-radius':      '2px',
      '--divider-style':     'solid',
      '--texture-opacity':   '0',
      '--date-style':        'default',
      '--photo-filter':      'none',
      '--photo-shadow':      'none',
      '--date-font':         "'Cormorant Garamond', Georgia, serif",
      '--location-icon':     '',
      '--quote-bar':         'transparent',
      '--meaning-box':       'hide',
      '--heading-weight':    '700',
      '--body-weight':       '400',
      '--ornament-opacity':  '1',
    },
  },

  // ②  Sacred — 수련회
  'sacred': {
    id: 'sacred',
    name: 'Sacred',
    label: '성스러운',
    swatch: ['#1B2A4A', '#B8975A', '#F5F0E8'],
    vars: {
      '--color-bg':          '#1B2A4A',
      '--color-primary':     '#F5F0E8',
      '--color-accent':      '#B8975A',
      '--color-text':        'rgba(245,240,232,0.88)',
      '--font-serif':        "'Cormorant Garamond', 'Noto Serif KR', Georgia, serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#2E4470',
      '--color-text-muted':  'rgba(245,240,232,0.45)',
      '--color-accent-soft': 'rgba(184,151,90,0.22)',
      '--color-divider':     'rgba(184,151,90,0.25)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(27,42,74,0.3) 0%, rgba(27,42,74,0.52) 55%, rgba(10,18,35,0.9) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #0a1223 0%, #1B2A4A 50%, #2E4470 100%)',
      '--header-bg':         'rgba(27,42,74,0.95)',
      '--header-border':     'rgba(184,151,90,0.25)',
      '--photo-border':      '1px solid rgba(184,151,90,0.55)',
      '--top-line-opacity':  '1',
      '--chapter-style':     'roman',
      '--photo-radius':      '2px',
      '--divider-style':     'solid',
      '--texture-opacity':   '0',
      '--date-style':        'default',
      '--photo-filter':      'none',
      '--photo-shadow':      'none',
      '--date-font':         "'Cormorant Garamond', Georgia, serif",
      '--location-icon':     '',
      '--quote-bar':         'transparent',
      '--meaning-box':       'hide',
      '--heading-weight':    '700',
      '--body-weight':       '400',
      '--ornament-opacity':  '1',
    },
  },

  // ③  Adventure — 캠프
  'adventure': {
    id: 'adventure',
    name: 'Adventure',
    label: '탐험',
    swatch: ['#F4EFE4', '#4A5E3A', '#D4703A'],
    vars: {
      '--color-bg':          '#F4EFE4',
      '--color-primary':     '#2C2416',
      '--color-accent':      '#4A5E3A',
      '--color-text':        '#3A2E1A',
      '--font-serif':        "'Noto Sans KR', system-ui, sans-serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#EAE3D2',
      '--color-text-muted':  '#8B7A5A',
      '--color-accent-soft': 'rgba(74,94,58,0.12)',
      '--color-divider':     'rgba(139,111,58,0.35)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(44,36,22,0.22) 0%, rgba(44,36,22,0.44) 55%, rgba(44,36,22,0.82) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #1A2410 0%, #2E3D1A 50%, #4A5E3A 100%)',
      '--header-bg':         'rgba(244,239,228,0.94)',
      '--header-border':     'rgba(74,94,58,0.2)',
      '--photo-border':      'none',
      '--top-line-opacity':  '0',
      '--chapter-style':     'numeric',
      '--photo-radius':      '4px',
      '--divider-style':     'dashed',
      '--texture-opacity':   '0.04',
      '--date-style':        'stamp',
      '--photo-filter':      'none',
      '--photo-shadow':      'none',
      '--date-font':         "'Noto Sans KR', sans-serif",
      '--location-icon':     '',
      '--quote-bar':         'transparent',
      '--meaning-box':       'hide',
      '--heading-weight':    '700',
      '--body-weight':       '400',
      '--ornament-opacity':  '1',
    },
  },

  // ④  Editorial — 교육
  'editorial': {
    id: 'editorial',
    name: 'Editorial',
    label: '에디토리얼',
    swatch: ['#2C5F8A', '#2E2E2E', '#FFFFFF'],
    vars: {
      '--color-bg':          '#FFFFFF',
      '--color-primary':     '#2E2E2E',
      '--color-accent':      '#2C5F8A',
      '--color-text':        '#444444',
      '--font-serif':        "'Noto Serif KR', Georgia, serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#F8F8F8',
      '--color-text-muted':  '#888888',
      '--color-accent-soft': 'rgba(44,95,138,0.1)',
      '--color-divider':     'rgba(44,95,138,0.12)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(44,95,138,0.22) 0%, rgba(44,95,138,0.4) 55%, rgba(46,46,46,0.82) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #1A2E44 0%, #2C5F8A 60%, #3D7AB8 100%)',
      '--header-bg':         'rgba(255,255,255,0.95)',
      '--header-border':     'rgba(44,95,138,0.12)',
      '--photo-border':      'none',
      '--top-line-opacity':  '0',
      '--chapter-style':     'numeric',
      '--photo-radius':      '2px',
      '--divider-style':     'solid',
      '--texture-opacity':   '0',
      '--date-style':        'default',
      '--photo-filter':      'none',
      '--photo-shadow':      'none',
      '--date-font':         "'Cormorant Garamond', Georgia, serif",
      '--location-icon':     '',
      '--quote-bar':         'transparent',
      '--meaning-box':       'hide',
      '--heading-weight':    '700',
      '--body-weight':       '400',
      '--ornament-opacity':  '1',
    },
  },

  // ⑤  Archive — 해외탐방
  'archive': {
    id: 'archive',
    name: 'Archive',
    label: '아카이브',
    swatch: ['#F5EDD6', '#8B4513', '#1B4332'],
    vars: {
      '--color-bg':          '#F5EDD6',
      '--color-primary':     '#2C1810',
      '--color-accent':      '#8B4513',
      '--color-text':        '#3E2A1A',
      '--font-serif':        "'Cormorant Garamond', 'Noto Serif KR', Georgia, serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#EDE0C0',
      '--color-text-muted':  '#9A7A58',
      '--color-accent-soft': 'rgba(139,69,19,0.1)',
      '--color-divider':     'rgba(139,69,19,0.22)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(44,24,16,0.25) 0%, rgba(44,24,16,0.48) 55%, rgba(27,67,50,0.82) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #1a1008 0%, #3E2A1A 50%, #8B4513 100%)',
      '--header-bg':         'rgba(245,237,214,0.96)',
      '--header-border':     'rgba(139,69,19,0.18)',
      '--photo-border':      'none',
      '--top-line-opacity':  '0',
      '--chapter-style':     'numeric',
      '--photo-radius':      '2px',
      '--divider-style':     'solid',
      '--texture-opacity':   '0.05',
      '--date-style':        'default',
      '--photo-filter':      'sepia(30%) contrast(1.05) brightness(0.97)',
      '--photo-shadow':      '0 0 0 1px rgba(139,69,19,0.25), 2px 3px 0 1px rgba(196,168,130,0.5), 4px 5px 0 0px rgba(139,69,19,0.12)',
      '--date-font':         "'Caveat', cursive",
      '--location-icon':     '📍 ',
      '--quote-bar':         'transparent',
      '--meaning-box':       'hide',
      '--heading-weight':    '700',
      '--body-weight':       '400',
      '--ornament-opacity':  '1',
    },
  },

  // ⑥  Mission — 선교
  'mission': {
    id: 'mission',
    name: 'Mission',
    label: '미션',
    swatch: ['#FEFEFE', '#D4703A', '#B8975A'],
    vars: {
      '--color-bg':          '#FEFEFE',
      '--color-primary':     '#1A1A1A',
      '--color-accent':      '#D4703A',
      '--color-text':        '#2A2A2A',
      '--font-serif':        "'Noto Serif KR', Georgia, serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#FFF3EC',
      '--color-text-muted':  '#9A8880',
      '--color-accent-soft': 'rgba(212,112,58,0.1)',
      '--color-divider':     'rgba(212,112,58,0.3)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(26,26,26,0.2) 0%, rgba(26,26,26,0.4) 55%, rgba(26,26,26,0.75) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #1a1008 0%, #6A2010 50%, #D4703A 100%)',
      '--header-bg':         'rgba(254,254,254,0.97)',
      '--header-border':     'rgba(212,112,58,0.18)',
      '--photo-border':      'none',
      '--top-line-opacity':  '0',
      '--chapter-style':     'numeric',
      '--photo-radius':      '4px',
      '--divider-style':     'wave',
      '--texture-opacity':   '0',
      '--date-style':        'default',
      '--photo-filter':      'none',
      '--photo-shadow':      'none',
      '--date-font':         "'Cormorant Garamond', Georgia, serif",
      '--location-icon':     '',
      '--quote-bar':         '#D4703A',
      '--meaning-box':       'show',
      '--heading-weight':    '700',
      '--body-weight':       '400',
      '--ornament-opacity':  '1',
    },
  },

  // ⑦  Minimal — 기타
  'minimal': {
    id: 'minimal',
    name: 'Minimal',
    label: '미니멀',
    swatch: ['#FFFFFF', '#333333', '#000000'],
    vars: {
      '--color-bg':          '#FFFFFF',
      '--color-primary':     '#333333',
      '--color-accent':      '#333333',
      '--color-text':        '#444444',
      '--font-serif':        "'Noto Sans KR', system-ui, sans-serif",
      '--font-sans':         "'Noto Sans KR', system-ui, sans-serif",
      '--color-surface':     '#F5F5F5',
      '--color-text-muted':  '#AAAAAA',
      '--color-accent-soft': 'rgba(0,0,0,0.04)',
      '--color-divider':     'rgba(0,0,0,0.08)',
      '--hero-overlay':      'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.6) 100%)',
      '--hero-fallback':     'linear-gradient(160deg, #111111 0%, #333333 60%, #555555 100%)',
      '--header-bg':         'rgba(255,255,255,0.98)',
      '--header-border':     'rgba(0,0,0,0.06)',
      '--photo-border':      'none',
      '--top-line-opacity':  '0',
      '--chapter-style':     'numeric',
      '--photo-radius':      '2px',
      '--divider-style':     'none',
      '--texture-opacity':   '0',
      '--date-style':        'default',
      '--photo-filter':      'none',
      '--photo-shadow':      'none',
      '--date-font':         "'Noto Sans KR', system-ui, sans-serif",
      '--location-icon':     '',
      '--quote-bar':         'transparent',
      '--meaning-box':       'hide',
      '--heading-weight':    '500',
      '--body-weight':       '300',
      '--ornament-opacity':  '0',
    },
  },
}

// ── 카테고리 → 테마 자동 매핑 ──────────────────────────────

export const CATEGORY_THEME_MAP: Record<string, ThemeId> = {
  '수련회':   'sacred',
  '캠프':     'adventure',
  '교육':     'editorial',
  '여행':     'luxe-cream',
  '해외탐방': 'archive',
  '선교':     'mission',
  '기타':     'minimal',
}

export function getThemeByCategory(category: string): ThemeId {
  return CATEGORY_THEME_MAP[category] ?? 'luxe-cream'
}

// ── applyTheme — CSS 변수를 DOM에 주입 ─────────────────────
// element 생략 시 document.documentElement(:root)에 적용
export function applyTheme(themeId: ThemeId, element?: HTMLElement): void {
  const theme = THEMES[themeId]
  if (!theme) return
  const target = element ?? document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => {
    target.style.setProperty(key, value)
  })
}

// 편의 export
export const THEME_LIST: ThemeDef[] = Object.values(THEMES)
