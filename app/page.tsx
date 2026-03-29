import Link from 'next/link'

const EVENT_TYPES = [
  { icon: '⛺', label: '수련회',   desc: '교회 수련회' },
  { icon: '✈️', label: '선교', desc: '단기선교' },
  { icon: '🌿', label: '캠프',     desc: '청소년·성경학교' },
  { icon: '🕊️', label: '예배',     desc: '특별예배·부흥회' },
  { icon: '🤝', label: '모임',     desc: '셀·소그룹' },
]

const STEPS = [
  {
    step: '01',
    icon: '✦',
    title: '이벤트 만들기',
    desc: '리더가 회원가입 후 이벤트를 만들면 QR 코드가 자동 생성돼요.',
  },
  {
    step: '02',
    icon: '📱',
    title: 'QR 코드 공유',
    desc: '참여자에게 QR을 보여주세요. 앱 설치 없이 바로 참여해요.',
  },
  {
    step: '03',
    icon: '📖',
    title: '플립북 완성',
    desc: '사진과 묵상을 기록하면 아름다운 플립북이 만들어져요.',
  },
]

function SampleCard({ tag, verse, body, photo }: { tag: string; verse: string; body: string; photo?: string }) {
  return (
    <div className="flex-shrink-0 w-72 bg-[#FDFAF5] rounded-2xl overflow-hidden border border-[#E8D5A3] shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] to-[#E8D5A3]" />
      <div className="h-32 bg-gradient-to-br from-[#F5EFE4] to-[#EDE3D0] flex items-center justify-center overflow-hidden">
        {photo
          ? <img src={photo} alt={tag} className="w-full h-full object-cover" />
          : <span className="text-4xl opacity-30">📸</span>
        }
      </div>
      <div className="p-4 space-y-2">
        <span className="inline-block text-xs font-medium text-[#C9A84C] border border-[#E8D5A3] rounded-full px-2.5 py-0.5">
          {tag}
        </span>
        <p className="text-xs text-[#8C6E55] italic leading-relaxed line-clamp-2">"{verse}"</p>
        <p className="text-sm text-[#3D2B1F] leading-relaxed line-clamp-3">{body}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFAF5] text-[#3D2B1F]">

      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-[#FDFAF5]/95 backdrop-blur border-b border-[#E8D5A3]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-serif text-lg font-semibold text-[#3D2B1F]">
            갓생북 <span className="text-[#C9A84C]">은혜</span>
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-[#8C6E55] px-3 py-1.5 hover:text-[#3D2B1F] transition-colors">
              로그인
            </Link>
            <Link href="/signup" className="text-sm bg-[#C9A84C] text-white px-4 py-2 rounded-full hover:bg-[#A8853A] transition-colors font-medium">
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="max-w-2xl mx-auto px-5 pt-14 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#F5EFE4] border border-[#E8D5A3] text-[#A8853A] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span>✦</span>
          <span>교회 전용 · 완전 무료</span>
          <span>✦</span>
        </div>

        <h1
          className="text-[2.15rem] sm:text-5xl font-serif font-semibold leading-snug text-[#3D2B1F] mb-4"
          style={{ wordBreak: 'keep-all' }}
        >
          순간의 은혜가<br />
          <span className="text-[#C9A84C]">평생의 기억</span>으로
        </h1>

        <p
          className="text-[0.95rem] sm:text-lg text-[#8C6E55] max-w-sm mx-auto leading-loose mb-8"
          style={{ wordBreak: 'keep-all' }}
        >
          사진 한 장, 기록 한 줄.<br />
          우리가 함께한 시간이 책이 됩니다.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-xs mx-auto sm:max-w-none">
          <Link
            href="/signup"
            className="cta-pulse inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#A8853A] text-white font-semibold text-base px-8 py-4 rounded-full transition-colors"
          >
            무료로 시작하기 →
          </Link>
          <a
            href="#sample"
            className="inline-flex items-center justify-center border border-[#E8D5A3] text-[#8C6E55] hover:bg-[#F5EFE4] text-base px-8 py-4 rounded-full transition-colors"
          >
            예시 보기
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#A8853A]">
          <span>✓ 회원가입 1분</span>
          <span>✓ 기록 무제한</span>
          <span>✓ PDF 다운로드</span>
        </div>
      </section>

      {/* 예시 보기 */}
      <section id="sample" className="bg-[#F5EFE4] py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center px-5 mb-8">
            <p className="text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-2">Sample</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F]">이렇게 만들어져요</h2>
            <p className="text-sm text-[#8C6E55] mt-2">참여자 한 명 한 명의 기록이 한 권의 책이 됩니다</p>
          </div>

          {/* 가로 스크롤 */}
          <div className="flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
            <SampleCard
              tag="수련회 · 첫째 날"
              verse="내가 산을 향하여 눈을 들리라 — 시편 121:1"
              body="강의를 들으며 얼마나 하나님을 의지하지 않고 살았는지 깨달았다. 오늘이 다시 시작의 계기가 될 것 같다."
            />
            <SampleCard
              tag="선교 · 아프리카"
              verse="가서 모든 민족을 제자로 삼아 — 마태복음 28:19"
              body="붉은 흙 위에서 아이들과 예배드렸다. 언어도 문화도 달랐지만 같은 하나님을 향해 손을 들었다."
            />
            <SampleCard
              tag="성경학교 · 언더우드기념관"
              verse="믿음의 선진들이 증거하는 것은 — 히브리서 12:1"
              body="100년 전 이 땅에 복음을 심은 헌신이 오늘 내 신앙의 뿌리임을 기념관 앞에서 실감했다."
              photo="/sample-bible-school.png"
            />
            <SampleCard
              tag="셀 모임 · 목요일"
              verse="두세 사람이 내 이름으로 모인 곳에 — 마태복음 18:20"
              body="서로의 이야기를 들으며 내가 혼자가 아니라는 걸 다시 확인했다. 이 공동체가 감사하다."
            />
            {/* 오른쪽 여백 */}
            <div className="flex-shrink-0 w-1" />
          </div>
          <p className="text-center text-xs text-[#A8853A] mt-4">← 옆으로 밀어 더 보기</p>
        </div>
      </section>

      {/* 이벤트 유형 */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-2">Event Types</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F]" style={{ wordBreak: 'keep-all' }}>
            어떤 모임이든 기록할 수 있어요
          </h2>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {EVENT_TYPES.map((t) => (
            <div
              key={t.label}
              className="bg-[#F5EFE4] border border-[#E8D5A3] rounded-2xl py-4 px-2 text-center hover:border-[#C9A84C] transition-all"
            >
              <div className="text-2xl sm:text-3xl mb-2">{t.icon}</div>
              <div className="font-semibold text-xs sm:text-sm text-[#3D2B1F]">{t.label}</div>
              <div className="hidden sm:block text-xs text-[#8C6E55] mt-1 leading-snug">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5EFE4] py-12">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-8">
            <p className="text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#3D2B1F]">3단계로 끝나요</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-[#FDFAF5] rounded-2xl p-5 border border-[#E8D5A3] flex items-start gap-4 sm:block">
                <div className="text-2xl sm:text-3xl sm:mb-3 shrink-0">{s.icon}</div>
                <div>
                  <div className="text-xs font-semibold text-[#C9A84C] mb-1 sm:mb-2">{s.step}</div>
                  <h3 className="font-semibold text-[#3D2B1F] mb-1">{s.title}</h3>
                  <p className="text-sm text-[#8C6E55] leading-relaxed" style={{ wordBreak: 'keep-all' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 교회에 드리는 선물 */}
      <section className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="bg-gradient-to-br from-[#F5EFE4] to-[#EDE3D0] border border-[#E8D5A3] rounded-3xl px-6 py-10">
          <div className="text-3xl mb-3">✦</div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#3D2B1F] mb-3">
            교회에 드리는 선물
          </h2>
          <p className="text-sm text-[#8C6E55] max-w-xs mx-auto leading-loose mb-6" style={{ wordBreak: 'keep-all' }}>
            교회 공동체를 위해 무료로 제공됩니다.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            {[
              ['∞', '기록 횟수'],
              ['∞', '이벤트 생성'],
              ['✓', 'PDF 다운로드'],
              ['✓', '플립북 뷰어'],
            ].map(([val, label]) => (
              <div key={label} className="bg-[#FDFAF5] rounded-xl py-3 border border-[#E8D5A3]">
                <div className="text-lg font-bold text-[#C9A84C]">{val}</div>
                <div className="text-xs text-[#8C6E55] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            className="cta-pulse inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#A8853A] text-white font-semibold px-8 py-4 rounded-full transition-colors w-full sm:w-auto"
          >
            지금 시작하기 →
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[#E8D5A3] py-6">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8C6E55]">
          <span className="font-serif text-sm text-[#3D2B1F]">
            갓생북 <span className="text-[#C9A84C]">은혜</span>
          </span>
          <span>교회 공동체를 위한 무료 기록 플립북 서비스</span>
        </div>
      </footer>
    </div>
  )
}
