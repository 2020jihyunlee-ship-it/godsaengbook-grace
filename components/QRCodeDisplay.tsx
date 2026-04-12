'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

export default function QRCodeDisplay({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [btnCopied, setBtnCopied] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 })
    }
  }, [url])

  function handleDownload() {
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvasRef.current?.toDataURL() ?? ''
    link.click()
  }

  function copyToClipboard(onDone: () => void) {
    navigator.clipboard.writeText(url).then(onDone)
  }

  function handleBtnCopy() {
    copyToClipboard(() => {
      setBtnCopied(true)
      setTimeout(() => setBtnCopied(false), 2000)
    })
  }

  function handleUrlCopy() {
    copyToClipboard(() => {
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <canvas ref={canvasRef} className="rounded-lg" />

      {/* 액션 버튼 */}
      <div className="flex gap-2 w-full max-w-xs">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm text-[#8C6E55] border border-[#E8D5A3] rounded-lg hover:bg-[#FDF3E3] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          QR 다운로드
        </button>
        <button
          onClick={handleBtnCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm border rounded-lg transition-all duration-200"
          style={
            btnCopied
              ? { backgroundColor: '#ed5f1e', color: 'white', borderColor: '#ed5f1e' }
              : { color: '#8C6E55', borderColor: '#E8D5A3' }
          }
        >
          {btnCopied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              복사됨!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              링크 복사
            </>
          )}
        </button>
      </div>

      {/* URL 박스 — 클릭하면 복사, 독립 피드백 */}
      <button
        onClick={handleUrlCopy}
        title="클릭하여 복사"
        className="w-full max-w-xs text-left rounded-lg px-3 py-2.5 border transition-all duration-200"
        style={
          urlCopied
            ? { backgroundColor: '#fff7ed', borderColor: '#ed5f1e' }
            : { backgroundColor: '#FDF3E3', borderColor: '#E8D5A3' }
        }
      >
        <p
          className="text-[10px] mb-0.5 transition-colors duration-200"
          style={{ color: urlCopied ? '#ed5f1e' : '#C4A882' }}
        >
          {urlCopied ? '✓ 복사됨!' : '참여 링크 · 클릭하여 복사'}
        </p>
        <p className="text-xs text-[#8C6E55] break-all leading-relaxed">{url}</p>
      </button>
    </div>
  )
}
