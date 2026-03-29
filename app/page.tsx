import Link from 'next/link'

/* ── 이벤트 유형 데이터 ── */
const EVENT_TYPES = [
  { icon: '⛺', label: '수련회', desc: '1박 이상 교회 수련회' },
  { icon: '✈️', label: '선교여행', desc: '단기선교 · 해외/국내' },
  { icon: '🌿', label: '캠프', desc: '청소년 캠프 · 성경학교' },
  { icon: '🕊️', label: '예배', desc: '특별예배 · 부흥회 · 사경회' },
  { icon: '🤝', label: '모임', desc: '셀 · 소그룹 · 기도회' },
]

/* ── 3단계 How it works ── */
const STEPS = [
  {
    step: '01',
    title: '이벤트 만들기',
    desc: '리더가 회원가입 후 이벤트를 만들면 QR 코드가 생성돼요.',
  },
  {
    step: '02',
    title: 'QR 코드 공유',
    desc: '참여자에게 QR을 공유하세요. 앱 설치 없이 바로 참여해요.',
  },
  {
    step: '03',
    title: '기록하고 플립북으로',
    desc: '각자 사진과 묵상을 기록하면 아름다운 플립북이 완성돼요.',
  },
]

/* ── 샘플 기록 카드 (예시 보기) ── */
function SamplePage({
  verse,
  body,
  tag,
}: {
  verse: string
  body: string
  tag: string
}) {
  return (
    <div className="relative bg-[#FDFAF5] rounded-2xl overflow-hidden shadow-lg border border-[#E8D5A3] w-full max-w-[260px] flex-shrink-0">
      {/* 골드 상단 라인 */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A3]" />
      {/* 사진 영역 */}
      <div className="h-36 bg-gradient-to-br from-[#F5EFE4] to-[#EDE3D0] flex items-center justify-center">
        <span className="text-4xl opacity-40">📸</span>
      </div>
      {/* 콘텐츠 */}
      <div className="p-4 space-y-2">
        <span className="inline-block text-xs font-medium text-[#C9A84C] border border-[#E8D5A3] rounded-full px-2 py-0.5">
          {tag}
        </span>
        <p className="text-xs text-[#8C6E55] italic leading-relaxed line-clamp-2">
          "{verse}"
        </p>
        <p className="text-sm text-[#3D2B1F] leading-relaxed line-clamp-3">
          {body}
        </p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFAF5] text-[#3D2B1F]">
      {/* ── 네비게이션 ── */}
      <nav className="sticky top-0 z-50 bg-[#FDFAF5]/95 backdrop-blur border-b border-[#E8D5A3]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-serif text-lg font-semibold tracking-wide text-[#3D2B1F]">
            갓생북 <span className="text-[#C9A84C]">은혜</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#8C6E55] hover:text-[#3D2B1F] transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-[#C9A84C] text-white px-4 py-1.5 rounded-full hover:bg-[#A8853A] transition-colors"
            >
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
        {/* 무료 배지 */}
        <div className="inline-flex items-center gap-2 bg-[#F5EFE4] border border-[#E8D5A3] text-[#A8853A] text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span>✦</span>
          <span>교회 전용 · 완전 무료</span>
          <span>✦</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-serif font-semibold leading-tight text-[#3D2B1F] mb-5">
          교회 공동체의 소중한 순간을<br />
          <span className="text-[#C9A84C]">신앙 서사</span>로 기록하세요
        </h1>

        <p className="text-base sm:text-lg text-[#8C6E55] max-w-xl mx-auto leading-relaxed mb-8">
          수련회, 선교여행, 셀 모임의 기억이 흘러가기 전에—<br />
          사진 한 장과 짧은 묵상으로 아름다운 플립북을 완성해요.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="cta-pulse w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#A8853A] text-white font-medium text-base px-8 py-3.5 rounded-full transition-colors"
          >
            무료로 시작하기 →
          </Link>
          <a
            href="#sample"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#E8D5A3] text-[#8C6E55] hover:bg-[#F5EFE4] text-base px-8 py-3.5 rounded-full transition-colors"
          >
            예시 보기
          </a>
        </div>

        {/* 신뢰 지표 */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-xs text-[#8C6E55]">
          <span>✓ 회원가입 1분</span>
          <span>✓ 신용카드 불필요</span>
          <span>✓ 기록 횟수 무제한</span>
          <span>✓ PDF 무료 다운로드</span>
        </div>
      </section>

      {/* ── 예시 보기 ── */}
      <section id="sample" className="bg-[#F5EFE4] py-16">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-2">Sample</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F]">
              이렇게 만들어져요
            </h2>
            <p className="text-sm text-[#8C6E55] mt-2">
              참여자 한 명 한 명의 기록이 한 권의 책이 됩니다
            </p>
          </div>

          {/* 샘플 카드 스크롤 */}
          <div className="flex gap-4 overflow-x-auto pb-4 justify-center flex-wrap sm:flex-nowrap">
            <SamplePage
              tag="수련회 · 첫째 날"
              verse="내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까 — 시편 121:1"
              body="강의를 들으며 내가 얼마나 하나님을 의지하지 않고 살았는지 깨달았다. 오늘 이 자리가 다시 시작의 계기가 될 것 같다."
            />
            <SamplePage
              tag="선교여행 · 필리핀"
              verse="가서 모든 민족을 제자로 삼아 — 마태복음 28:19"
              body="처음 봤지만 낯설지 않은 아이들의 눈빛. 언어가 달라도 사랑은 통한다는 걸 오늘 처음으로 진짜로 느꼈다."
            />
            <SamplePage
              tag="셀 모임 · 목요일"
              verse="두세 사람이 내 이름으로 모인 곳에 나도 있느니라 — 마태복음 18:20"
              body="오늘 나눔에서 서로의 이야기를 들으며 내가 혼자가 아니라는 걸 다시 확인했다. 이 공동체가 감사하다."
            />
          </div>

          {/* 플립북 미리보기 힌트 */}
          <p className="text-center text-xs text-[#8C6E55] mt-6">
            ↑ 실제 플립북은 책장을 넘기듯 감상할 수 있어요
          </p>
        </div>
      </section>

      {/* ── 이벤트 유형 ── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-2">Event Types</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F]">
            어떤 모임이든 기록할 수 있어요
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {EVENT_TYPES.map((t) => (
            <div
              key={t.label}
              className="bg-[#F5EFE4] border border-[#E8D5A3] rounded-2xl p-4 text-center hover:border-[#C9A84C] hover:shadow-sm transition-all"
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-medium text-sm text-[#3D2B1F] mb-1">{t.label}</div>
              <div className="text-xs text-[#8C6E55] leading-snug">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#F5EFE4] py-16">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F]">
              3단계로 끝나요
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-[#FDFAF5] rounded-2xl p-6 border border-[#E8D5A3]">
                <div className="font-display text-3xl font-semibold text-[#C9A84C] mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-[#3D2B1F] mb-2">{s.title}</h3>
                <p className="text-sm text-[#8C6E55] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 완전 무료 강조 ── */}
      <section className="max-w-5xl mx-auto px-5 py-16 text-center">
        <div className="bg-gradient-to-br from-[#F5EFE4] to-[#EDE3D0] border border-[#E8D5A3] rounded-3xl px-6 py-12">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F] mb-4">
            교회에 드리는 선물
          </h2>
          <p className="text-[#8C6E55] max-w-md mx-auto leading-relaxed mb-8">
            갓생북 은혜는 교회 공동체를 위해 완전 무료로 제공됩니다.
            기록 횟수 제한도, 숨겨진 비용도 없어요.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto mb-8">
            {[
              ['∞', '기록 횟수'],
              ['∞', '이벤트 생성'],
              ['무료', 'PDF 다운로드'],
              ['무료', '플립북 뷰어'],
            ].map(([val, label]) => (
              <div key={label} className="bg-[#FDFAF5] rounded-xl p-3 border border-[#E8D5A3]">
                <div className="text-xl font-semibold text-[#C9A84C]">{val}</div>
                <div className="text-xs text-[#8C6E55] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            className="cta-pulse inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#A8853A] text-white font-medium px-8 py-3.5 rounded-full transition-colors"
          >
            지금 무료로 시작하기 →
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-[#E8D5A3] py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C6E55]">
          <span className="font-serif text-sm text-[#3D2B1F]">
            갓생북 <span className="text-[#C9A84C]">은혜</span>
          </span>
          <span>교회 공동체를 위한 무료 기록 플립북 서비스</span>
        </div>
      </footer>
    </div>
  )
}
