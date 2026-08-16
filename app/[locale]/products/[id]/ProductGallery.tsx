"use client"

import { useState } from "react"

const VIDEO_EXTS = new Set(["mp4", "mov", "avi"])

type Props = {
  images: string[]
  title: string
  isFree: boolean
  format: string | null
  videoUrl?: string | null
}

export default function ProductGallery({ images, title, isFree, format, videoUrl }: Props) {
  const [galleryIdx, setGalleryIdx] = useState(0)
  const isVideo = format ? VIDEO_EXTS.has(format.toLowerCase()) : false

  if (images.length === 0 && !videoUrl) {
    return (
      <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="w-full aspect-video bg-gray-100 dark:bg-[var(--ink-12)] flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
        <div className="absolute inset-0 bg-[var(--cream)] dark:bg-[#1a1a1a]">
          {isVideo && videoUrl ? (
            <video
              src={videoUrl}
              controls
              preload="metadata"
              className="w-full h-full object-contain"
            />
          ) : images.length > 0 ? (
            <>
              <img src={images[galleryIdx]} alt={title} className="w-full h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setGalleryIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">‹</button>
                  <button onClick={() => setGalleryIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60">›</button>
                </>
              )}
            </>
          ) : null}
          {format && <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#1A1A1A]/80 text-white text-xs font-bold rounded-lg">{format}</span>}
          {isFree && <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-lg">Gratuit</span>}
        </div>
      </div>
      {/* Thumbnail strip — only shown for image products with multiple previews */}
      {!isVideo && images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, i) => (
            <button key={i} onClick={() => setGalleryIdx(i)} className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition ${i === galleryIdx ? "border-[var(--orange)]" : "border-transparent"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
