"use client"

import { useState } from "react"

export default function ServiceGallery({ images, title }: { images: string[]; title: string }) {
  const [galleryIdx, setGalleryIdx] = useState(0)

  if (images.length === 0) {
    return (
      <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="w-full aspect-video bg-gray-100 dark:bg-[var(--ink-12)] flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--white)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
      <div className="relative w-full" style={{ paddingBottom: "60%" }}>
        <div className="absolute inset-0 bg-[var(--cream)] dark:bg-[#1a1a1a]">
          <img src={images[galleryIdx]} alt={title} className="w-full h-full object-contain" />
          {images.length > 1 && (
            <>
              <button
                onClick={() => setGalleryIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
              >‹</button>
              <button
                onClick={() => setGalleryIdx(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"
              >›</button>
            </>
          )}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setGalleryIdx(i)}
              className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition ${i === galleryIdx ? "border-[var(--orange)]" : "border-transparent"}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
