import Link from 'next/link'
import LandingFlipbook from '@/components/LandingFlipbook'

const EVENT_TYPES = [
  { icon: '⛺', label: '수련회',   desc: '교회 수련회' },
  { icon: '✈️', label: '선교',     desc: '단기선교' },
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
    title: '참여자 초대',
    desc: 'QR 코드를 보여주면 참여자가 스캔 후 바로 기록을 시작해요. 앱 설치 불필요.',
  },
  {
    step: '03',
    icon: '📖',
    title: '나만의 플립북 완성',
    desc: '사진과 묵상을 기록하면 참여자 각자의 플립북이 만들어져요.',
  },
  {
    step: '04',
    icon: '🔗',
    title: '가족·친구에게 공유',
    desc: '완성된 플립북을 링크로 공유해보세요. 함께하지 못한 분들도 볼 수 있어요.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7FE] text-[#1A0533]">

      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 bg-[#FAF7FE]/95 backdrop-blur border-b border-[#D8C2EF]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-lg font-extrabold tracking-tight">
            <img src="/logo.svg" alt="" width={24} height={24} />
            <span className="text-[#6B1FAD]">갓생북</span> <span className="text-[#C9A84C]">은혜</span>
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-[#6B4E8A] px-3 py-1.5 hover:text-[#1A0533] transition-colors">
              로그인
            </Link>
            <Link href="/signup" className="text-sm bg-[#6B1FAD] text-white px-4 py-2 rounded-full hover:bg-[#5A1590] transition-colors font-medium">
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="max-w-2xl mx-auto px-5 pt-14 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#F0E8FA] border border-[#9B6FD0] text-[#6B1FAD] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span>✦</span>
          <span>교회 전용 플립북 서비스</span>
          <span>✦</span>
        </div>

        <h1
          className="text-[2.15rem] sm:text-5xl font-extrabold leading-snug text-[#1A0533] mb-4"
          style={{ wordBreak: 'keep-all' }}
        >
          순간의 은혜가<br />
          <span className="text-[#6B1FAD]">평생의 기억</span>으로
        </h1>

        <p
          className="text-[0.95rem] sm:text-lg text-[#6B4E8A] max-w-sm mx-auto leading-loose mb-8"
          style={{ wordBreak: 'keep-all' }}
        >
          사진 한 장, 기록 한 줄.<br />
          우리가 함께한 시간이 책이 됩니다.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-xs mx-auto sm:max-w-none">
          <Link
            href="/signup"
            className="cta-pulse inline-flex items-center justify-center gap-2 bg-[#6B1FAD] hover:bg-[#5A1590] text-white font-semibold text-base px-8 py-4 rounded-full transition-colors"
          >
            기록 시작하기 →
          </Link>
          <a
            href="#sample"
            className="inline-flex items-center justify-center border border-[#D8C2EF] text-[#6B4E8A] hover:bg-[#F0E8FA] text-base px-8 py-4 rounded-full transition-colors"
          >
            예시 보기
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#6B1FAD]">
          <span>✓ 회원가입 1분</span>
          <span>✓ 기록 무제한</span>
          <span>✓ 링크 공유</span>
        </div>
      </section>

      {/* 예시 보기 */}
      <section id="sample" className="bg-[#F0E8FA] pt-10 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center px-5 mb-4">
            <p className="text-xs font-medium text-[#6B1FAD] tracking-widest uppercase mb-2">Sample</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A0533]">이렇게 만들어져요</h2>
            <p className="text-sm text-[#6B4E8A] mt-1.5">참여자 한 명 한 명의 기록이 한 권의 책이 됩니다</p>
          </div>
          <LandingFlipbook />
        </div>
      </section>

      {/* 이벤트 유형 */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-[#6B1FAD] tracking-widest uppercase mb-2">Event Types</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A0533]" style={{ wordBreak: 'keep-all' }}>
            어떤 모임이든 기록할 수 있어요
          </h2>
        </div>
        <div className="flex gap-3 sm:grid sm:grid-cols-5 sm:gap-4 overflow-x-auto pb-2 sm:overflow-visible sm:pb-0 -mx-1 px-1">
          {EVENT_TYPES.map((t) => (
            <div
              key={t.label}
              className="bg-[#F0E8FA] border border-[#D8C2EF] rounded-2xl py-5 px-3 text-center hover:border-[#6B1FAD] transition-all flex-shrink-0 w-[110px] sm:w-auto"
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-semibold text-sm text-[#1A0533]">{t.label}</div>
              <div className="text-xs text-[#6B4E8A] mt-1 leading-snug">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F0E8FA] py-12">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-8">
            <p className="text-xs font-medium text-[#6B1FAD] tracking-widest uppercase mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A0533]">이렇게 사용해요</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-5 border border-[#D8C2EF] flex items-start gap-4 sm:block">
                <div className="text-2xl sm:text-3xl sm:mb-3 shrink-0">{s.icon}</div>
                <div>
                  <div className="text-xs font-semibold text-[#6B1FAD] mb-1 sm:mb-2">{s.step}</div>
                  <h3 className="font-semibold text-[#1A0533] mb-1">{s.title}</h3>
                  <p className="text-sm text-[#6B4E8A] leading-relaxed" style={{ wordBreak: 'keep-all' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 교회에 드리는 선물 */}
      <section className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="bg-gradient-to-br from-[#6B1FAD] to-[#4A1080] rounded-3xl px-6 py-10">
          <div className="text-3xl mb-3 text-[#C9A84C]">✦</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            교회에 드리는 선물
          </h2>
          <p className="text-sm text-purple-200 max-w-xs mx-auto leading-loose mb-6" style={{ wordBreak: 'keep-all' }}>
            교회 공동체를 위해 무료로 제공됩니다.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            {[
              ['∞', '기록 횟수'],
              ['∞', '이벤트 생성'],
              ['✓', 'PDF 다운로드'],
              ['✓', '플립북 뷰어'],
            ].map(([val, label]) => (
              <div key={label} className="bg-white/10 rounded-xl py-3 border border-white/20">
                <div className="text-lg font-bold text-[#C9A84C]">{val}</div>
                <div className="text-xs text-purple-200 mt-0.5">{label}</div>
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
      <footer className="border-t border-[#D8C2EF] py-6">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B4E8A]">
          <span className="inline-flex items-center gap-1.5 font-bold text-sm">
            <img src="/logo.svg" alt="" width={20} height={20} />
            <span className="text-[#6B1FAD]">갓생북</span> <span className="text-[#C9A84C]">은혜</span>
          </span>
          <span>교회 공동체를 위한 무료 기록 플립북 서비스</span>
          <a href="mailto:gatsaengbook@gmail.com" className="hover:text-[#6B1FAD] transition-colors">
            gatsaengbook@gmail.com
          </a>
        </div>
      </footer>
    </div>
  )
}
