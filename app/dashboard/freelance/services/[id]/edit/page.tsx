"use client"

import { useState, useEffect, useRef, useCallback, DragEvent, ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
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
}) => (
  <div className={`flex-1 min-w-0 p-4 border border-[var(--ink-12)] rounded-xl space-y-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
    <p className="text-sm font-bold text-[var(--ink)]">{label}</p>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Description</label>
      <textarea value={pkg.description} onChange={e => setPkgFn("description", e.target.value)} maxLength={100} rows={2} placeholder="Ce que comprend ce package..." className={inputCls + " resize-none text-xs"} />
      <p className="text-[10px] text-gray-400 text-right">{pkg.description.length}/100</p>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Délai</label>
        <select value={pkg.delivery_days} onChange={e => setPkgFn("delivery_days", Number(e.target.value))} className={inputCls + " text-xs"}>
          {DELIVERY_OPTIONS.map(d => <option key={d} value={d}>{d} jour{d > 1 ? "s" : ""}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Révisions</label>
        <select value={pkg.revisions} onChange={e => setPkgFn("revisions", Number(e.target.value))} className={inputCls + " text-xs"}>
          {REVISION_OPTIONS.map(r => <option key={r} value={r}>{r === -1 ? "Illimité" : r}</option>)}
        </select>
      </div>
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Prix (DA)</label>
      <input type="number" value={pkg.price} min={1000} step={100} onChange={e => setPkgFn("price", Number(e.target.value))} className={inputCls + " text-sm font-bold"} />
      {pkg.price < 1000 && <p className="text-xs text-red-500 mt-1">Minimum 1 000 DA</p>}
    </div>
  </div>
)

function StepBar({ step }: { step: number }) {
  const steps = ["Aperçu", "Tarifs", "Description & FAQ", "Galerie"]
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
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 5) { setTags(p => [...p, t]); setTagInput("") }
  }

  const totalImages = existingImages.length + newImages.length

  const validateAndAdd = useCallback((files: File[]) => {
    setImgError(null)
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    for (const f of files) {
      if (!allowed.includes(f.type)) { setImgError("Type non supporté (jpg, png, webp)"); return }
      if (f.size > 5 * 1024 * 1024) { setImgError("Fichier trop volumineux — max 5MB"); return }
    }
    const remaining = 3 - totalImages
    if (remaining <= 0) return
    const toAdd = files.slice(0, remaining).map(f => ({ file: f, preview: URL.createObjectURL(f), uploading: false }))
    setNewImages(p => [...p, ...toAdd])
  }, [totalImages])

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
    if (totalImages === 0) { showToast("Ajoutez au moins une image", "error"); return }
    setSubmitting(true)
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error("Non authentifié")

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
      showToast("Service mis à jour", "success")
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
              <h1 className="text-2xl font-bold text-[var(--ink)]">Modifier le service</h1>
              <p className="text-sm text-gray-500 mt-1">Mettez à jour les informations de votre service</p>
            </div>
          </div>

          <StepBar step={step} />

          <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6 shadow-sm">

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Titre du service</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 80))} placeholder="Je vais créer votre logo professionnel..." className={inputCls} />
                  <div className="flex justify-between mt-1">
                    {title.length > 0 && title.length < 15 && <p className="text-xs text-red-500">Minimum 15 caractères</p>}
                    {title.length >= 15 && <p className="text-xs text-green-600">✓</p>}
                    {title.length === 0 && <span />}
                    <p className={`text-xs ${title.length > 70 ? "text-orange-500" : "text-gray-400"}`}>{title.length}/80</p>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Catégorie</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                    <option value="">Choisir une catégorie</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tags <span className="text-gray-400 font-normal">(max 5)</span></label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--cream)] text-[var(--orange)] text-xs rounded-lg border border-[var(--orange)]/20">
                        {t}<button onClick={() => setTags(p => p.filter(x => x !== t))} className="ml-1 hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                  {tags.length < 5 && (
                    <div className="flex gap-2">
                      <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} placeholder="Ex: logo, design, branding" className={inputCls + " flex-1"} />
                      <button onClick={addTag} className="px-4 py-2.5 bg-[var(--orange)] text-white text-sm font-semibold rounded-xl">+</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[var(--ink)]">Packages tarifaires</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-600">Package unique</span>
                    <div onClick={() => setSinglePkg(p => !p)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${singlePkg ? "bg-[var(--orange)]" : "bg-gray-200 dark:bg-[var(--ink-12)]"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--white)] shadow transition-all ${singlePkg ? "left-5" : "left-0.5"}`} />
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <PkgCol pkg={pkgBasique} setPkgFn={(f, v) => setPkg("basique", f, v)} label="Basique" />
                  <PkgCol pkg={pkgStandard} setPkgFn={(f, v) => setPkg("standard", f, v)} label="Standard" disabled={singlePkg} />
                  <PkgCol pkg={pkgPremium} setPkgFn={(f, v) => setPkg("premium", f, v)} label="Premium" disabled={singlePkg} />
                </div>
                {!step2Valid && <p className="text-xs text-red-500">Le prix Standard doit être ≥ Basique, et Premium ≥ Standard. Minimum 1 000 DA.</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Description du service</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 1200))} rows={8} placeholder="Décrivez votre service en détail..." className={inputCls + " resize-none"} />
                  <div className="flex justify-between mt-1">
                    {description.length > 0 && description.length < 120 && <p className="text-xs text-red-500">Minimum 120 caractères ({120 - description.length} manquants)</p>}
                    {description.length >= 120 && <p className="text-xs text-green-600">✓</p>}
                    {description.length === 0 && <span />}
                    <p className={`text-xs ${description.length > 1100 ? "text-orange-500" : "text-gray-400"}`}>{description.length}/1200</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls + " mb-0"}>FAQ <span className="text-gray-400 font-normal">(optionnel, max 5)</span></label>
                    {faqItems.length < 5 && <button onClick={() => setFaqItems(p => [...p, { q: "", a: "" }])} className="text-sm text-[var(--orange)] font-semibold hover:text-[var(--orange-dark)]">+ Ajouter une question</button>}
                  </div>
                  <div className="space-y-4">
                    {faqItems.map((item, i) => (
                      <div key={i} className="p-4 border border-[var(--ink-12)] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-500">Question {i + 1}</p>
                          <button onClick={() => setFaqItems(p => p.filter((_, j) => j !== i))} className="text-xs text-gray-400 hover:text-red-500">Supprimer</button>
                        </div>
                        <input type="text" value={item.q} onChange={e => setFaqItems(p => p.map((x, j) => j === i ? { ...x, q: e.target.value } : x))} placeholder="Ex: Quel format de fichiers livrez-vous ?" className={inputCls} />
                        <textarea value={item.a} onChange={e => setFaqItems(p => p.map((x, j) => j === i ? { ...x, a: e.target.value } : x))} placeholder="Réponse..." rows={2} className={inputCls + " resize-none"} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Images du service <span className="text-gray-400 font-normal">(1–3 images, max 5MB)</span></label>

                  {totalImages < 3 && (
                    <div ref={dropRef} onDrop={onDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed border-[var(--ink-12)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--orange)]/40 transition-colors" onClick={() => document.getElementById("edit-img-input")?.click()}>
                      <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-sm text-gray-500">Glissez des images ici ou <span className="text-[var(--orange)] font-semibold">cliquez</span></p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB</p>
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
                          {i === 0 && <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[var(--orange)] text-white text-[9px] font-bold rounded">Cover</span>}
                        </div>
                      ))}
                      {newImages.map((img, i) => (
                        <div key={i} className="relative aspect-video bg-gray-100 dark:bg-[var(--ink-12)] rounded-xl overflow-hidden">
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                          {img.uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                          <button onClick={() => setNewImages(p => p.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">Nouveau</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Lien vidéo <span className="text-gray-400 font-normal">(optionnel — YouTube ou Vimeo)</span></label>
                  <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 border border-[var(--ink-12)] text-sm font-semibold text-gray-600 rounded-xl hover:border-gray-300 transition-colors">← Retour</button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid) || (step === 3 && !step3Valid)} className="px-6 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-xl hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Continuer →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || totalImages === 0} className="px-6 py-2.5 bg-[var(--orange)] text-white text-sm font-bold rounded-xl hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement...</> : "Enregistrer les modifications"}
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
    </>
  )
}
