"use client"

import { useState, useEffect, useRef, useCallback, DragEvent, ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import Navbar from "@/components/Navbar"
import CoverCropModal from "@/components/CoverCropModal"
import { createClient } from "@/lib/supabase/client"

const CATEGORIES = [
  "Designer graphique", "Développeur web/mobile", "Rédacteur/copywriter",
  "Traducteur", "Monteur vidéo", "Community manager", "Photographe",
  "Motion designer", "Consultant marketing", "Expert SEO", "UI/UX designer", "Data analyst",
]
const DELIVERY_OPTIONS = [1, 2, 3, 5, 7, 10, 14, 21, 30]
const REVISION_OPTIONS = [0, 1, 2, 3, 5, 10, -1]

type Package = { name: string; description: string; delivery_days: number; revisions: number; price: number }
type NewImage = { file: File; preview: string; uploading: boolean; url?: string }
type ExistingImage = { url: string }

const inputCls = "w-full px-4 py-2.5 border border-[var(--ink-12)] rounded-xl text-sm text-[var(--ink)] bg-[var(--white)] dark:bg-[var(--background)] outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/10 transition-all"
const labelCls = "block text-sm font-semibold text-[var(--ink)] mb-1.5"

const DEFAULT_PKG = (name: string, price: number): Package => ({ name, description: "", delivery_days: 3, revisions: 1, price })

const PkgCol = ({ pkg, setPkgFn, label, disabled = false }: {
  pkg: Package; setPkgFn: (f: keyof Package, v: string | number) => void; label: string; disabled?: boolean
}) => {
  const t = useTranslations("dashboardSeller")
  return (
    <div className={`flex-1 min-w-0 p-4 border border-[var(--ink-12)] rounded-xl space-y-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <p className="text-sm font-bold text-[var(--ink)]">{label}</p>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">{t("editService.packages.descriptionLabel")}</label>
        <textarea value={pkg.description} onChange={e => setPkgFn("description", e.target.value)} maxLength={100} rows={2} placeholder={t("editService.packages.descriptionPlaceholder")} className={inputCls + " resize-none text-xs"} />
        <p className="text-[10px] text-gray-400 text-right">{pkg.description.length}/100</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("editService.packages.deliveryLabel")}</label>
          <select value={pkg.delivery_days} onChange={e => setPkgFn("delivery_days", Number(e.target.value))} className={inputCls + " text-xs"}>
            {DELIVERY_OPTIONS.map(d => (
              <option key={d} value={d}>
                {d === 1 ? t("editService.packages.deliveryDay", { n: d }) : t("editService.packages.deliveryDays", { n: d })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("editService.packages.revisionsLabel")}</label>
          <select value={pkg.revisions} onChange={e => setPkgFn("revisions", Number(e.target.value))} className={inputCls + " text-xs"}>
            {REVISION_OPTIONS.map(r => (
              <option key={r} value={r}>
                {r === -1 ? t("editService.packages.revisionsUnlimited") : r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">{t("editService.packages.priceLabel")}</label>
        <input type="number" value={pkg.price} min={1000} step={100} onChange={e => setPkgFn("price", Number(e.target.value))} className={inputCls + " text-sm font-bold"} />
        {pkg.price < 1000 && <p className="text-xs text-red-500 mt-1">{t("editService.packages.priceMin")}</p>}
      </div>
    </div>
  )
}

function StepBar({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < step
        const active = num === step
        return (
          <div key={num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${done || active ? "bg-[var(--orange)] border-[var(--orange)] text-white" : "bg-[var(--white)] border-gray-300 text-gray-400"}`}>
                {done ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : num}
              </div>
              <span className={`hidden sm:block text-[10px] mt-1 whitespace-nowrap font-medium ${active ? "text-[var(--orange)]" : "text-gray-400"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 sm:mb-4 mx-1 ${num < step ? "bg-[var(--orange)]" : "bg-gray-200 dark:bg-[var(--ink-12)]"}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const t = useTranslations("dashboardSeller")
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [singlePkg, setSinglePkg] = useState(false)
  const [pkgBasique, setPkgBasique] = useState<Package>(DEFAULT_PKG("Basique", 5000))
  const [pkgStandard, setPkgStandard] = useState<Package>(DEFAULT_PKG("Standard", 10000))
  const [pkgPremium, setPkgPremium] = useState<Package>(DEFAULT_PKG("Premium", 20000))
  const [description, setDescription] = useState("")
  const [faqItems, setFaqItems] = useState<{ q: string; a: string }[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [imgError, setImgError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState("")

  const [cropSrc, setCropSrc]         = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const steps = [
    t("editService.steps.overview"),
    t("editService.steps.pricing"),
    t("editService.steps.description"),
    t("editService.steps.gallery"),
  ]

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: svc, error } = await sb.from("services").select("*").eq("id", id).single()
      if (error || !svc || svc.seller_id !== user.id) {
        router.push("/dashboard/freelance/services")
        return
      }

      setTitle(svc.title ?? "")
      setCategory(svc.category ?? "")
      setTags(svc.tags ?? [])
      setDescription(svc.description ?? "")
      setFaqItems(svc.faq ?? [])
      setVideoUrl(svc.video_url ?? "")

      const imgs: string[] = [...(svc.gallery ?? []), ...(svc.images ?? [])].filter(Boolean)
      setExistingImages([...new Set(imgs)].map(url => ({ url })))

      if (svc.packages && typeof svc.packages === "object") {
        const pkgs = svc.packages as Record<string, Package>
        if (pkgs.basique) setPkgBasique(pkgs.basique)
        if (pkgs.standard) setPkgStandard(pkgs.standard)
        if (pkgs.premium) setPkgPremium(pkgs.premium)
        const hasSingle = pkgs.basique && !pkgs.standard
        setSinglePkg(hasSingle)
      }
      setLoading(false)
    }
    load()
  }, [id, router])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 5) { setTags(p => [...p, tag]); setTagInput("") }
  }

  const totalImages = existingImages.length + newImages.length

  const validateAndAdd = useCallback((files: File[]) => {
    setImgError(null)
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    for (const f of files) {
      if (!allowed.includes(f.type)) { setImgError(t("editService.gallery.typeError")); return }
      if (f.size > 5 * 1024 * 1024) { setImgError(t("editService.gallery.sizeError")); return }
    }
    const remaining = 3 - totalImages
    if (remaining <= 0) return
    const toAdd = files.slice(0, remaining)
    if (totalImages === 0) {
      setCropSrc(URL.createObjectURL(toAdd[0]))
      setPendingFiles(toAdd.slice(1))
    } else {
      setNewImages(p => [...p, ...toAdd.map(f => ({ file: f, preview: URL.createObjectURL(f), uploading: false }))])
    }
  }, [totalImages, t])

  function handleCropConfirm(blob: Blob) {
    const croppedFile = new File([blob], `cover_${Date.now()}.webp`, { type: "image/webp" })
    const rest = pendingFiles.map(f => ({ file: f, preview: URL.createObjectURL(f), uploading: false }))
    setNewImages(p => [...p, { file: croppedFile, preview: URL.createObjectURL(blob), uploading: false }, ...rest])
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFiles([])
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFiles([])
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); validateAndAdd(Array.from(e.dataTransfer.files)) }
  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) validateAndAdd(Array.from(e.target.files)) }

  const setPkg = (key: "basique" | "standard" | "premium", field: keyof Package, value: string | number) => {
    const setters = { basique: setPkgBasique, standard: setPkgStandard, premium: setPkgPremium }
    setters[key](p => ({ ...p, [field]: value }))
  }

  async function uploadImage(img: NewImage, uid: string): Promise<string> {
    const sb = createClient()
    const ext = img.file.name.split(".").pop()
    const path = `${uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await sb.storage.from("service-images").upload(path, img.file, { upsert: true })
    if (error) throw error
    return sb.storage.from("service-images").getPublicUrl(path).data.publicUrl
  }

  const step1Valid = title.trim().length >= 15 && title.trim().length <= 80 && category !== ""
  const step2Valid = (() => {
    if (pkgBasique.price < 1000) return false
    if (!singlePkg) { if (pkgStandard.price < pkgBasique.price) return false; if (pkgPremium.price < pkgStandard.price) return false }
    return true
  })()
  const step3Valid = description.trim().length >= 120 && description.trim().length <= 1200

  async function handleSubmit() {
    if (totalImages === 0) { showToast(t("editService.actions.noImageError"), "error"); return }
    setSubmitting(true)
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error(t("editService.actions.unauthError"))

      const uploadedNewUrls = await Promise.all(newImages.map(img => uploadImage(img, user.id)))
      const allUrls = [...existingImages.map(i => i.url), ...uploadedNewUrls]

      const packages: Record<string, Package> = { basique: pkgBasique }
      if (!singlePkg) { packages.standard = pkgStandard; packages.premium = pkgPremium }
      const minPrice = Math.min(...Object.values(packages).map(p => p.price))
      const faq = faqItems.filter(f => f.q.trim() && f.a.trim())

      const { error } = await sb.from("services").update({
        title: title.trim(), category, description: description.trim(),
        price: minPrice, delivery_days: pkgBasique.delivery_days,
        images: allUrls.slice(0, 3), gallery: allUrls,
        packages, tags, faq, video_url: videoUrl.trim() || null,
      }).eq("id", id).eq("seller_id", user.id)

      if (error) throw error
      showToast(t("editService.actions.success"), "success")
      setTimeout(() => router.push(`/services/${id}`), 1000)
    } catch (err: unknown) {
      showToast((err as Error).message ?? "Erreur", "error")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
        <div className="w-8 h-8 border-[3px] border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/dashboard/freelance/services" className="p-2 rounded-xl border border-[var(--ink-12)] text-gray-500 hover:text-[var(--orange)] hover:border-[var(--orange)]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--ink)]">{t("editService.title")}</h1>
              <p className="text-sm text-gray-500 mt-1">{t("editService.subtitle")}</p>
            </div>
          </div>

          <StepBar step={step} steps={steps} />

          <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6 shadow-sm">

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>{t("editService.fields.titleLabel")}</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 80))} placeholder={t("editService.fields.titlePlaceholder")} className={inputCls} />
                  <div className="flex justify-between mt-1">
                    {title.length > 0 && title.length < 15 && <p className="text-xs text-red-500">{t("editService.fields.titleMin")}</p>}
                    {title.length >= 15 && <p className="text-xs text-green-600">✓</p>}
                    {title.length === 0 && <span />}
                    <p className={`text-xs ${title.length > 70 ? "text-orange-500" : "text-gray-400"}`}>{title.length}/80</p>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t("editService.fields.category")}</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                    <option value="">{t("editService.fields.categoryPlaceholder")}</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("editService.fields.tags")} <span className="text-gray-400 font-normal">{t("editService.fields.tagsMax")}</span></label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--cream)] text-[var(--orange)] text-xs rounded-lg border border-[var(--orange)]/20">
                        {tag}<button onClick={() => setTags(p => p.filter(x => x !== tag))} className="ml-1 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                  {tags.length < 5 && (
                    <div className="flex gap-2">
                      <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} placeholder={t("editService.fields.tagsPlaceholder")} className={inputCls + " flex-1"} />
                      <button onClick={addTag} className="px-4 py-2.5 bg-[var(--orange)] text-white text-sm font-semibold rounded-xl">+</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[var(--ink)]">{t("editService.packages.title")}</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-600">{t("editService.packages.singleToggle")}</span>
                    <div onClick={() => setSinglePkg(p => !p)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${singlePkg ? "bg-[var(--orange)]" : "bg-gray-200 dark:bg-[var(--ink-12)]"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--white)] shadow transition-all ${singlePkg ? "left-5" : "left-0.5"}`} />
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <PkgCol pkg={pkgBasique} setPkgFn={(f, v) => setPkg("basique", f, v)} label={t("editService.packages.basic")} />
                  <PkgCol pkg={pkgStandard} setPkgFn={(f, v) => setPkg("standard", f, v)} label={t("editService.packages.standard")} disabled={singlePkg} />
                  <PkgCol pkg={pkgPremium} setPkgFn={(f, v) => setPkg("premium", f, v)} label={t("editService.packages.premium")} disabled={singlePkg} />
                </div>
                {!step2Valid && <p className="text-xs text-red-500">{t("editService.packages.priceError")}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>{t("editService.description.label")}</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 1200))} rows={8} placeholder={t("editService.description.placeholder")} className={inputCls + " resize-none"} />
                  <div className="flex justify-between mt-1">
                    {description.length > 0 && description.length < 120 && <p className="text-xs text-red-500">{t("editService.description.minError", { n: 120 - description.length })}</p>}
                    {description.length >= 120 && <p className="text-xs text-green-600">✓</p>}
                    {description.length === 0 && <span />}
                    <p className={`text-xs ${description.length > 1100 ? "text-orange-500" : "text-gray-400"}`}>{description.length}/1200</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls + " mb-0"}>{t("editService.faq.label")} <span className="text-gray-400 font-normal">{t("editService.faq.optional")}</span></label>
                    {faqItems.length < 5 && <button onClick={() => setFaqItems(p => [...p, { q: "", a: "" }])} className="text-sm text-[var(--orange)] font-semibold hover:text-[var(--orange-dark)]">{t("editService.faq.addQuestion")}</button>}
                  </div>
                  <div className="space-y-4">
                    {faqItems.map((item, i) => (
                      <div key={i} className="p-4 border border-[var(--ink-12)] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-500">{t("editService.faq.questionN", { n: i + 1 })}</p>
                          <button onClick={() => setFaqItems(p => p.filter((_, j) => j !== i))} className="text-xs text-gray-400 hover:text-red-500">{t("editService.faq.deleteQuestion")}</button>
                        </div>
                        <input type="text" value={item.q} onChange={e => setFaqItems(p => p.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} placeholder={t("editService.faq.questionPlaceholder")} className={inputCls} />
                        <textarea value={item.a} onChange={e => setFaqItems(p => p.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} placeholder={t("editService.faq.answerPlaceholder")} rows={2} className={inputCls + " resize-none"} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>{t("editService.gallery.label")} <span className="text-gray-400 font-normal">{t("editService.gallery.hint")}</span></label>

                  {totalImages < 3 && (
                    <div ref={dropRef} onDrop={onDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed border-[var(--ink-12)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--orange)]/40 transition-colors" onClick={() => document.getElementById("edit-img-input")?.click()}>
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-sm text-gray-500">{t("editService.gallery.dropHint")} <span className="text-[var(--orange)] font-semibold">{t("editService.gallery.dropClick")}</span></p>
                      <p className="text-xs text-gray-400 mt-1">{t("editService.gallery.formatHint")}</p>
                      <input id="edit-img-input" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFileInput} />
                    </div>
                  )}

                  {imgError && <p className="text-xs text-red-500 mt-2">{imgError}</p>}

                  {totalImages > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {existingImages.map((img, i) => (
                        <div key={img.url} className="relative aspect-video bg-gray-100 dark:bg-[var(--ink-12)] rounded-xl overflow-hidden">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setExistingImages(p => p.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                          {i === 0 && <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[var(--orange)] text-white text-[9px] font-bold rounded">{t("editService.gallery.coverBadge")}</span>}
                        </div>
                      ))}
                      {newImages.map((img, i) => (
                        <div key={i} className="relative aspect-video bg-gray-100 dark:bg-[var(--ink-12)] rounded-xl overflow-hidden">
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                          {img.uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                          <button onClick={() => setNewImages(p => p.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">{t("editService.gallery.newBadge")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>{t("editService.video.label")} <span className="text-gray-400 font-normal">{t("editService.video.optional")}</span></label>
                  <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder={t("editService.video.placeholder")} className={inputCls} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 border border-[var(--ink-12)] text-sm font-semibold text-gray-600 rounded-xl hover:border-gray-300 transition-colors">{t("editService.actions.back")}</button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)} className="px-6 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-xl hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {t("editService.actions.continue")}
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || totalImages === 0} className="px-6 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-xl hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("editService.actions.saving")}</> : t("editService.actions.save")}
              </button>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50 ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {cropSrc && (
        <CoverCropModal
          src={cropSrc}
          aspect={2}
          outW={1200}
          outH={600}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}
