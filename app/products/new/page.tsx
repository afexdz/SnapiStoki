"use client"

import { useState, useEffect, useCallback, DragEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"

const PRODUCT_TYPES = ["Illustration", "Template", "Icônes", "Police", "Photo", "Document", "Autre"]
const LICENSES = ["Usage personnel", "Usage commercial", "Licence étendue"]
const ALLOWED_PRODUCT_EXTS = ["zip", "pdf", "psd", "ai", "svg", "png", "jpg", "jpeg", "sketch", "xd", "fig"]

const inputCls = "w-full px-4 py-2.5 border border-[var(--ink-12)] rounded-xl text-sm text-[var(--ink)] outline-none focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/10 transition-all"
const labelCls = "block text-sm font-semibold text-[var(--ink)] mb-1.5"

type PreviewImage = { file: File; preview: string; uploading: boolean; url?: string }
type ProductFile  = { file: File; uploading: boolean; url?: string }

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NewProductPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [userId, setUserId]           = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const [title, setTitle]             = useState("")
  const [productType, setProductType] = useState("")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput]       = useState("")
  const [tags, setTags]               = useState<string[]>([])
  const [isFree, setIsFree]           = useState(false)
  const [price, setPrice]             = useState(1000)
  const [license, setLicense]         = useState("Usage personnel")
  const [productFile, setProductFile] = useState<ProductFile | null>(null)
  const [fileError, setFileError]     = useState<string | null>(null)
  const [previews, setPreviews]       = useState<PreviewImage[]>([])
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return }
      setUserId(data.user.id)
      setAuthChecked(true)
    })
  }, [router])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 8) { setTags(p => [...p, t]); setTagInput("") }
  }

  const onProductFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files[0]) handleProductFile(e.dataTransfer.files[0])
  }

  function handleProductFile(f: File) {
    setFileError(null)
    const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
    if (!ALLOWED_PRODUCT_EXTS.includes(ext)) { setFileError(`Format non supporté. Acceptés: ${ALLOWED_PRODUCT_EXTS.join(", ")}`); return }
    if (f.size > 50 * 1024 * 1024) { setFileError("Fichier trop volumineux — max 50MB"); return }
    setProductFile({ file: f, uploading: false })
  }

  const validateAndAddPreview = useCallback((files: File[]) => {
    setPreviewError(null)
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    for (const f of files) {
      if (!allowed.includes(f.type)) { setPreviewError("Type non supporté (jpg, png, webp)"); return }
      if (f.size > 5 * 1024 * 1024)  { setPreviewError("Fichier trop volumineux — max 5MB"); return }
    }
    const remaining = 4 - previews.length
    const toAdd = files.slice(0, remaining).map(f => ({
      file: f, preview: URL.createObjectURL(f), uploading: false,
    }))
    setPreviews(p => [...p, ...toAdd])
  }, [previews.length])

  const onPreviewDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    validateAndAddPreview(Array.from(e.dataTransfer.files))
  }
  const onPreviewInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAddPreview(Array.from(e.target.files))
  }

  async function uploadFile(f: File, bucket: string, uid: string): Promise<string> {
    const sb   = createClient()
    const ext  = f.name.split(".").pop()
    const path = `${uid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await sb.storage.from(bucket).upload(path, f, { upsert: true })
    if (error) throw error
    // private bucket: just return the path; public bucket: get public URL
    if (bucket === "digital-products") return path
    return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  const isValid = title.trim().length > 0 && title.trim().length <= 80 &&
    productType !== "" && description.trim().length > 0 &&
    (isFree || price >= 1000) && productFile !== null && previews.length > 0

  async function handleSubmit() {
    if (!isValid) { showToast("Remplissez tous les champs obligatoires", "error"); return }
    setSubmitting(true)
    try {
      const uid = userId!

      // Upload product file
      setProductFile(p => p ? { ...p, uploading: true } : p)
      const filePath = await uploadFile(productFile!.file, "digital-products", uid)
      setProductFile(p => p ? { ...p, uploading: false, url: filePath } : p)

      // Upload preview images (to service-images public bucket as fallback)
      const previewUrls: string[] = []
      for (let i = 0; i < previews.length; i++) {
        setPreviews(p => p.map((x, j) => j === i ? { ...x, uploading: true } : x))
        const url = await uploadFile(previews[i].file, "service-images", uid)
        previewUrls.push(url)
        setPreviews(p => p.map((x, j) => j === i ? { ...x, uploading: false, url } : x))
      }

      const ext = productFile!.file.name.split(".").pop()?.toUpperCase() ?? ""
      const sb = createClient()
      const { data, error } = await sb.from("digital_products").insert({
        seller_id:     uid,
        title:         title.trim(),
        category:      productType,
        description:   description.trim(),
        price:         isFree ? 1 : price,
        is_free:       isFree,
        file_url:      filePath,
        preview_urls:  previewUrls,
        preview_images: previewUrls.slice(0, 4),
        file_format:   ext,
        format:        ext,
        file_size:     formatFileSize(productFile!.file.size),
        tags,
        license,
        is_active:     true,
      }).select("id").single()

      if (error) throw error
      router.push(`/products/${data.id}?created=1`)
    } catch (err: unknown) {
      showToast((err as Error).message ?? "Erreur lors de la publication", "error")
      setSubmitting(false)
    }
  }

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--white)]"><div className="w-8 h-8 border-[3px] border-[var(--orange)] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--ink)]">Vendre un produit digital</h1>
            <p className="text-sm text-gray-500 mt-1">Mettez en vente vos créations numériques</p>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6">
              <label className={labelCls}>Titre du produit</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 80))} placeholder="Ex: Pack 50 templates logo vectoriels..." className={inputCls} />
              <p className={`text-xs text-right mt-1 ${title.length > 70 ? "text-orange-500" : "text-gray-400"}`}>{title.length}/80</p>
            </div>

            {/* Type + License */}
            <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type de produit</label>
                  <select value={productType} onChange={e => setProductType(e.target.value)} className={inputCls}>
                    <option value="">Sélectionner</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Licence</label>
                  <select value={license} onChange={e => setLicense(e.target.value)} className={inputCls}>
                    {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 800))} rows={4} placeholder="Décrivez votre produit, ce qu'il contient..." className={inputCls + " resize-none"} />
                <p className={`text-xs text-right mt-1 ${description.length > 720 ? "text-orange-500" : "text-gray-400"}`}>{description.length}/800</p>
              </div>

              {/* Tags */}
              <div>
                <label className={labelCls}>Tags <span className="text-gray-400 font-normal">(max 8)</span></label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--cream)] text-[var(--orange)] text-xs rounded-lg border border-[var(--orange)]/20">
                      {t}
                      <button onClick={() => setTags(p => p.filter(x => x !== t))}>×</button>
                    </span>
                  ))}
                </div>
                {tags.length < 8 && (
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} placeholder="Ex: logo, figma, template..." className={inputCls + " flex-1"} />
                    <button onClick={addTag} className="px-4 py-2.5 bg-[var(--orange)] text-white text-sm font-semibold rounded-xl">+</button>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6">
              <label className={labelCls}>Prix</label>
              <div className="flex gap-3 mb-4">
                {["Payant", "Gratuit"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setIsFree(opt === "Gratuit")}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      (opt === "Gratuit") === isFree
                        ? "bg-[var(--orange)] border-[var(--orange)] text-white"
                        : "bg-[var(--white)] border-[var(--ink-12)] text-gray-600 hover:border-[var(--orange)]/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {!isFree && (
                <div>
                  <input
                    type="number"
                    value={price}
                    min={1000}
                    step={100}
                    onChange={e => setPrice(Number(e.target.value))}
                    className={inputCls + " text-base font-bold"}
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum 1 000 DA</p>
                  {price < 1000 && <p className="text-xs text-red-500">Le prix minimum est 1 000 DA</p>}
                </div>
              )}
            </div>

            {/* Product file */}
            <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6">
              <label className={labelCls}>Fichier principal <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-400 mb-3">ZIP, PDF, PSD, AI, SVG, PNG, JPG... — max 50MB</p>

              {!productFile ? (
                <div
                  onDrop={onProductFileDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById("product-file-input")?.click()}
                  className="border-2 border-dashed border-[var(--ink-12)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--orange)]/40 transition-colors"
                >
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500">Glissez votre fichier ici ou <span className="text-[var(--orange)] font-semibold">cliquez</span></p>
                  <input id="product-file-input" type="file" className="hidden" onChange={e => e.target.files?.[0] && handleProductFile(e.target.files[0])} />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-[var(--cream)] rounded-xl border border-[var(--orange)]/20">
                  <svg className="w-8 h-8 text-[var(--orange)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--ink)] truncate">{productFile.file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(productFile.file.size)}</p>
                  </div>
                  <button onClick={() => setProductFile(null)} className="text-xs text-gray-400 hover:text-red-500">Supprimer</button>
                </div>
              )}
              {fileError && <p className="text-xs text-red-500 mt-2">{fileError}</p>}
            </div>

            {/* Preview images */}
            <div className="bg-[var(--white)] rounded-2xl border border-[var(--ink-12)] p-6">
              <label className={labelCls}>Images de présentation <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(1–4, max 5MB)</span></label>

              {previews.length < 4 && (
                <div
                  onDrop={onPreviewDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById("preview-input")?.click()}
                  className="border-2 border-dashed border-[var(--ink-12)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--orange)]/40 transition-colors mb-4"
                >
                  <p className="text-sm text-gray-500">Glissez des images ici ou <span className="text-[var(--orange)] font-semibold">cliquez</span></p>
                  <input id="preview-input" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onPreviewInput} />
                </div>
              )}
              {previewError && <p className="text-xs text-red-500 mb-2">{previewError}</p>}

              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {previews.map((p, i) => (
                    <div key={i} className="relative aspect-video bg-gray-100 dark:bg-[var(--ink-12)] rounded-lg overflow-hidden">
                      <img src={p.preview} alt="" className="w-full h-full object-cover" />
                      {p.uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                      <button onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center">×</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-[var(--orange)] text-white text-[8px] font-bold rounded">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="w-full py-3.5 bg-[var(--orange)] text-white text-sm font-bold rounded-xl hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publication...</> : "Publier le produit"}
            </button>
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
