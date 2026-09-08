"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { generateProductContent, type GenerateResult } from "@/lib/ai-assistant/mockGenerate"

interface AIWritingPanelProps {
  isOpen: boolean
  onClose: () => void
  currentTags: string[]
  onApplyTitle: (title: string) => void
  onApplyDescription: (desc: string) => void
  onApplyTag: (tag: string) => void
  onApplyAll: (data: { title: string; description: string; tags: string[] }) => void
}

type Status = "idle" | "loading" | "done"

function SkeletonLine({ width = "100%", height = "1rem" }: { width?: string; height?: string }) {
  return (
    <div
      className="rounded-lg"
      style={{
        width,
        height,
        background: "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s infinite linear",
      }}
    />
  )
}

function LoadingSkeleton() {
  const t = useTranslations("aiAssistant.panel")
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 text-[var(--orange)] text-sm font-medium">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t("loading.title")}
        </div>
        <p className="text-xs text-white/40 mt-1">{t("loading.subtitle")}</p>
      </div>

      {/* Title skeletons */}
      <div className="rounded-xl border border-white/10 p-4 space-y-3">
        <SkeletonLine width="40%" height="0.75rem" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonLine width={`${75 - i * 5}%`} height="0.875rem" />
              <SkeletonLine width="3.5rem" height="1.75rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Description skeletons */}
      <div className="rounded-xl border border-white/10 p-4 space-y-3">
        <SkeletonLine width="50%" height="0.75rem" />
        {[1, 2].map(i => (
          <div key={i} className="space-y-1.5 pb-3 border-b border-white/10 last:border-0 last:pb-0">
            <SkeletonLine height="0.75rem" />
            <SkeletonLine width="90%" height="0.75rem" />
            <SkeletonLine width="70%" height="0.75rem" />
            <SkeletonLine width="3.5rem" height="1.75rem" />
          </div>
        ))}
      </div>

      {/* Tags skeletons */}
      <div className="rounded-xl border border-white/10 p-4 space-y-3">
        <SkeletonLine width="35%" height="0.75rem" />
        <div className="flex flex-wrap gap-2">
          {[70, 55, 80, 60, 75, 50, 65, 55].map((w, i) => (
            <SkeletonLine key={i} width={`${w}px`} height="1.75rem" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AIWritingPanel({
  isOpen,
  onClose,
  currentTags,
  onApplyTitle,
  onApplyDescription,
  onApplyTag,
  onApplyAll,
}: AIWritingPanelProps) {
  const t = useTranslations("aiAssistant.panel")
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [results, setResults] = useState<GenerateResult | null>(null)
  const [appliedTitle, setAppliedTitle] = useState<string | null>(null)
  const [appliedDesc, setAppliedDesc] = useState<string | null>(null)
  const [allApplied, setAllApplied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
    if (!isOpen) {
      // Reset applied states when panel closes
      setAppliedTitle(null)
      setAppliedDesc(null)
      setAllApplied(false)
    }
  }, [isOpen])

  async function handleGenerate() {
    if (!prompt.trim() || status === "loading") return
    setStatus("loading")
    setResults(null)
    setAppliedTitle(null)
    setAppliedDesc(null)
    setAllApplied(false)
    try {
      const res = await generateProductContent({ prompt: prompt.trim() })
      setResults(res)
      setStatus("done")
    } catch {
      setStatus("idle")
    }
  }

  function handleApplyTitle(title: string) {
    onApplyTitle(title)
    setAppliedTitle(title)
  }

  function handleApplyDesc(desc: string) {
    onApplyDescription(desc)
    setAppliedDesc(desc)
  }

  function handleApplyAll() {
    if (!results) return
    onApplyAll({
      title: results.titles[0],
      description: results.descriptions[0],
      tags: results.tags,
    })
    setAppliedTitle(results.titles[0])
    setAppliedDesc(results.descriptions[0])
    setAllApplied(true)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className={`
          fixed top-0 bottom-0 z-50 w-full sm:w-[440px]
          ltr:right-0 rtl:left-0
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"}
        `}
        style={{ background: "#13161E" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--orange)]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{t("title")}</p>
              <p className="text-[11px] text-white/40 leading-tight mt-0.5">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t("close")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input area */}
        <div className="px-5 py-4 border-b border-white/10 shrink-0">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate() }}
            placeholder={t("inputPlaceholder")}
            rows={3}
            className="w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder-white/30 resize-none outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--orange)" }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
          />
          <p className="text-[11px] text-white/30 mt-1.5 ltr:text-left rtl:text-right">{t("inputHint")}</p>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || status === "loading"}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
              bg-[var(--orange)] text-white hover:bg-[var(--orange-dark)]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("loading.title")}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {status === "done" ? t("regenerate") : t("generate")}
              </>
            )}
          </button>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/30">{t("idleHint")}</p>
            </div>
          )}

          {status === "loading" && <LoadingSkeleton />}

          {status === "done" && results && (
            <div className="space-y-4">
              {/* Titles */}
              <ResultBlock label={t("results.titlesLabel")}>
                <div className="space-y-2">
                  {results.titles.map((title, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <p className="flex-1 text-sm text-white/80 leading-snug">{title}</p>
                      <button
                        onClick={() => handleApplyTitle(title)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          appliedTitle === title
                            ? "bg-green-500/20 text-green-400 cursor-default"
                            : "bg-[var(--orange)]/20 text-[var(--orange)] hover:bg-[var(--orange)]/30"
                        }`}
                      >
                        {appliedTitle === title ? "✓" : t("results.use")}
                      </button>
                    </div>
                  ))}
                </div>
              </ResultBlock>

              {/* Descriptions */}
              <ResultBlock label={t("results.descriptionsLabel")}>
                <div className="space-y-3">
                  {results.descriptions.map((desc, i) => (
                    <div key={i} className={`space-y-2 ${i > 0 ? "pt-3 border-t border-white/10" : ""}`}>
                      <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
                      <button
                        onClick={() => handleApplyDesc(desc)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          appliedDesc === desc
                            ? "bg-green-500/20 text-green-400 cursor-default"
                            : "bg-[var(--orange)]/20 text-[var(--orange)] hover:bg-[var(--orange)]/30"
                        }`}
                      >
                        {appliedDesc === desc ? "✓" : t("results.use")}
                      </button>
                    </div>
                  ))}
                </div>
              </ResultBlock>

              {/* Tags */}
              <ResultBlock label={t("results.tagsLabel")}>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map(tag => {
                    const isAdded = currentTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => !isAdded && onApplyTag(tag)}
                        disabled={isAdded}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          isAdded
                            ? "bg-green-500/20 text-green-400 cursor-default"
                            : "bg-white/8 text-white/70 hover:bg-[var(--orange)]/20 hover:text-[var(--orange)] border border-white/10"
                        }`}
                      >
                        {isAdded ? "✓ " : "+ "}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </ResultBlock>
            </div>
          )}
        </div>

        {/* Footer — Apply All + Regenerate */}
        {status === "done" && results && (
          <div className="px-5 py-4 border-t border-white/10 shrink-0 flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t("regenerate")}
            </button>
            <button
              onClick={handleApplyAll}
              disabled={allApplied}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                allApplied
                  ? "bg-green-500/20 text-green-400 cursor-default"
                  : "bg-[var(--orange)] text-white hover:bg-[var(--orange-dark)]"
              }`}
            >
              {allApplied ? (
                <>✓ {t("results.applied")}</>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t("applyAll")}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function ResultBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-[11px] font-semibold text-[var(--orange)] uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}
