'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

interface Props {
  imageSrc: string
  onConfirm: (croppedFile: File) => void
  onCancel: () => void
}

async function getCroppedImage(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()))
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(new File([blob!], 'photo.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  })
}

export default function PhotoCropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    const file = await getCroppedImage(imageSrc, croppedAreaPixels)
    onConfirm(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* 안내 텍스트 */}
      <div className="pt-safe px-4 pt-4 pb-2 text-center">
        <p className="text-white text-sm font-medium">사진을 움직여 초점을 맞추세요</p>
        <p className="text-white/50 text-xs mt-0.5">드래그로 이동 · 핀치 또는 슬라이더로 확대</p>
      </div>

      {/* 크롭 영역 */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={false}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: {
              border: '2px solid rgba(201,168,76,0.9)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
              borderRadius: '8px',
            },
          }}
        />
      </div>

      {/* 줌 슬라이더 */}
      <div className="px-8 py-3 flex items-center gap-3">
        <span className="text-white/50 text-xs">축소</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="flex-1 accent-[#C9A84C]"
        />
        <span className="text-white/50 text-xs">확대</span>
      </div>

      {/* 버튼 */}
      <div
        className="px-4 pb-4 flex gap-3"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl border border-white/20 text-white text-sm font-medium"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className="flex-2 px-8 py-3.5 rounded-2xl bg-[#C9A84C] text-white text-sm font-semibold disabled:opacity-60"
          style={{ flex: 2 }}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              처리 중...
            </span>
          ) : '사용하기'}
        </button>
      </div>
    </div>
  )
}
