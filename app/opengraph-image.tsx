import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '갓생북 은혜 — 순간의 은혜가 평생의 기억으로'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FAF7FE 0%, #EEE0FB 100%)',
          position: 'relative',
        }}
      >
        {/* 배경 퍼플 원 */}
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(107,31,173,0.08) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* 상단 장식선 */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #6B1FAD, #C9A84C, #6B1FAD)',
          }}
        />

        {/* 로고 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 38, fontWeight: 700, color: '#6B1FAD' }}>
            갓생북
          </span>
          <span style={{ fontSize: 38, fontWeight: 700, color: '#C9A84C' }}>
            은혜
          </span>
        </div>

        {/* 메인 슬로건 */}
        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: '#1A0533',
            textAlign: 'center',
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          순간의 은혜가
        </div>
        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: '#6B1FAD',
            textAlign: 'center',
            lineHeight: 1.3,
            marginBottom: 36,
          }}
        >
          평생의 기억으로
        </div>

        {/* 서브 */}
        <div
          style={{
            fontSize: 26,
            color: '#6B4E8A',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          사진 한 장, 기록 한 줄 — 교회 전용 플립북 서비스
        </div>

        {/* 하단 장식선 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #6B1FAD, #C9A84C, #6B1FAD)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
