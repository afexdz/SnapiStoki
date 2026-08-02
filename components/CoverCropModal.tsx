"use client"

import { useRef, useState, useCallback } from "react"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

type Props = {
  src: string
  aspect: number
  outW: number
  outH: number
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(w: number, h: number, aspect: number): Crop {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h), w, h)
}

async function cropToBlob(img: HTMLImageElement, crop: PixelCrop, outW: number, outH: number): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext("2d")!
  const scaleX = img.naturalWidth / img.width
  const scaleY = img.naturalHeight / img.height
  ctx.drawImage(
    img,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, outW, outH
  )
  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error("canvas toBlob failed"))), "image/webp", 0.88)
  )
}

export default function CoverCropModal({ src, aspect, outW, outH, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [confirming, setConfirming] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspect))
  }, [aspect])

  async function handleConfirm() {
    if (!completedCrop || !imgRef.current) return
    setConfirming(true)
    try {
      const blob = await cropToBlob(imgRef.current, completedCrop, outW, outH)
      onConfirm(blob)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-[var(--white)] dark:bg-[#1a1a1a] rounded-2xl p-5 w-full max-w-xl shadow-2xl">
        <h2 className="text-base font-bold text-[var(--ink)] mb-1">Recadrer l&apos;image de couverture</h2>
        <p className="text-xs text-gray-400 mb-4">
          Ratio {aspect}:1 — déplacez et redimensionnez la zone de sélection
        </p>

        <div className="overflow-auto max-h-[60vh] flex items-center justify-center bg-black rounded-xl">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setCompletedCrop}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Recadrage"
              onLoad={onImageLoad}
              className="max-h-[60vh] max-w-full object-contain"
            />
          </ReactCrop>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-[var(--ink-12)] text-sm font-semibold text-gray-600 rounded-xl hover:border-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop || confirming}
            className="flex-1 py-2.5 bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Recadrage...
              </>
            ) : "Valider le recadrage"}
          </button>
        </div>
      </div>
    </div>
  )
}
