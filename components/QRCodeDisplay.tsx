'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeDisplay({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 })
    }
  }, [url])

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-lg" />
      <button
        onClick={() => {
          const link = document.createElement('a')
          link.download = 'qrcode.png'
          link.href = canvasRef.current?.toDataURL() ?? ''
          link.click()
        }}
        className="text-sm text-stone-500 hover:text-stone-900 underline"
      >
        QR 코드 다운로드
      </button>
    </div>
  )
}
