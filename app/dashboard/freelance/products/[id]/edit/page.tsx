"use client"

import { useState, useEffect, useCallback, DragEvent, ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/client"

const PRODUCT_TYPES = ["Illustration", "Template", "Icônes", "Police", "Photo", "Document", "Autre"]
const LICENSES = ["Usage personnel", "Usage commercial", "Licence étendue"]
const ALLOWED_PRODUCT_EXTS = ["zip", "pdf", "psd", "ai", "svg", "png", "jpg", "jpeg", "sketch", "xd", "fig"]

const inputCls = "w-full px-4 py-2.5 border border-[var(--ink-12)] rounded-xl text-sm text-[var(--ink)] bg-[var(--white)] outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/10 transition-all"
const labelCls = "block text-sm font-semibold text-[var(--ink)] mb-1.5"

type PreviewImage = { file: File; preview: string }
type ExistingPreview = { url: string }
type NewProductFile = { file: File }

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const [title, setTitle] = useState("")
  const [productType, setProductType] = useState("")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isFree, setIsFree] = useState(false)
  const [price, setPrice] = useState(1000)
  const [license, setLicense] = useState("Usage personnel")
  const [existingPreviews, setExistingPreviews] = useState<ExistingPreview[]>([])
  const [newPreviews, setNewPreviews] = useState<PreviewImage[]>([])
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [newProductFile, setNewProductFile] = useState<NewProductFile | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: prod, error } = await sb.from("digital_products").select("*").eq("id", id).single()
      if (error || !prod || prod.seller_id !== user.id) {
        router.push("/dashboard/freelance/products")
        return
      }

      setTitle(prod.title ?? "")
      setProductType(prod.category ?? "")
      setDescription(prod.description ?? "")
      setTags(prod.tags ?? [])
      setIsFree(prod.is_free ?? false)
      setPrice(prod.price ?? 1000)
      setLicense(prod.license ?? "Usage personnel")
      setExistingFileUrl(prod.file_url ?? null)

      const imgs: string[] = [...(prod.preview_urls ?? []), ...(prod.preview_images ?? [])].filter(Boolean)
      setExistingPreviews([...new Set(imgs)].map(url => ({ url })))
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
    if (t && !tags.includes(t) && tags.length < 8) { setTags(p => [...p, t]); setTagInput("") }
  }

  const totalPreviews = existingPreviews.length + newPreviews.length

  const validateAndAddPreview = useCallback((files: File[]) => {
    setPreviewError(null)
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    for (const f of files) {
      if (!allowed.includes(f.type)) { setPreviewError("Type non supporté (jpg, png, webp)"); return }
      if (f.size > 5 * 1024 * 1024) { setPreviewError("Fichier trop volumineux — max 5MB"); return }
    }
    const remaining = 3 - totalPreviews
    if (remaining <= 0) return
    const toAdd = files.slice(0, remaining).map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setNewPreviews(p => [...p, ...toAdd])
  }, [totalPreviews])

  const onPreviewDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); validateAndAddPreview(Array.from(e.dataTransfer.files)) }
  const onPreviewInput = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) validateAndAddPreview(Array.from(e.target.files)) }

  const onProductFileDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleProductFile(e.dataTransfer.files[0]) }
  const onProductFileInput = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleProductFile(e.target.files[0]) }

  function handleProductFile(f: File) {
    setFileError(null)
    const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
    if (!ALLOWED_PRODUCT_EXTS.includes(ext)) { setFileError(`Format non supporté. Acceptés: ${ALLOWED_PRODUCT_EXTS.join(", ")}`); return }
    if (f.size > 50 * 1024 * 1024) { setFileError("Fichier trop volumineux — max 50MB"); return }
    setNewProductFile({ file: f })
  }

  async function handleSubmit() {
    if (!isFree && price < 500) { showToast("Prix minimum 500 DA", "error"); return }
    if (totalPreviews === 0) { showToast("Ajoutez au moins une image d'aperçu", "error"); return }

    setSubmitting(true)
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const uploadedPreviewUrls = await Promise.all(
        newPreviews.map(async img => {
          const ext = img.file.name.split(".").pop()
          const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
          const { error } = await sb.storage.from("product-previews").upload(path, img.file, { upsert: true })
          if (error) throw error
          return sb.storage.from("product-previews").getPublicUrl(path).data.publicUrl
        })
      )

      let fileUrl = existingFileUrl
      if (newProductFile) {
        const ext = newProductFile.file.name.split(".").pop()
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await sb.storage.from("product-files").upload(path, newProductFile.file, { upsert: true })
        if (error) throw error
        fileUrl = sb.storage.from("product-files").getPublicUrl(path).data.publicUrl
      }

      const allPreviews = [...existingPreviews.map(p => p.url), ...uploadedPreviewUrls]

      const { error } = await sb.from("digital_products").update({
        title: title.trim(),
        category: productType || null,
        description: description.trim() || null,
        tags,
        is_free: isFree,
        price: isFree ? 0 : price,
        license,
        preview_urls: allPreviews,
        preview_images: allPreviews,
        ...(fileUrl ? { file_url: fileUrl } : {}),
        format: newProductFile ? (newProductFile.file.name.split(".").pop()?.toUpperCase() ?? null) : undefined,
      }).eq("id", id).eq("seller_id", user.id)

      if (error) throw error
      showToast("Produit mis à jour", "success")
      setTimeout(() => router.push(`/products/${id}`), 1000)
    } catch (err: unknown) {
      showToast((err as Error).message ?? "Erreur", "error")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
        <div className="w-8 h-8 border-[3px] border-[#FA8112] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAFA] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/dashboard/freelance/products" className="p-2 rounded-xl border border-[var(--ink-12)] text-gray-500 hover:text-[#FA8112] hover:border-[#FA8112]/40 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--ink)]">Modifier le produit</h1>
              <p className="text-sm text-gray-500 mt-1">Mettez à jour votre ressource numérique</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--ink-12)] p-6 shadow-sm space-y-6">
            <div>
              <label className={labelCls}>Titre du produit</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value.slice(0, 80))} placeholder="Ex: Pack d'icônes minimalistes..." className={inputCls} />
              <p className={`text-xs text-right mt-1 ${title.length > 70 ? "text-orange-500" : "text-gray-400"}`}>{title.length}/80</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Type</label>
                <select value={productType} onChange={e => setProductType(e.target.value)} className={inputCls}>
                  <option value="">Choisir un type</option>
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

            <div>
              <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optionnel)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 800))} rows={4} placeholder="Décrivez votre produit..." className={inputCls + " resize-none"} />
              <p className="text-xs text-right mt-1 text-gray-400">{description.length}/800</p>
            </div>

            <div>
              <label className={labelCls}>Tags <span className="text-gray-400 font-normal">(max 8)</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--cream)] text-[#FA8112] text-xs rounded-lg border border-[#FA8112]/20">
                    {t}<button onClick={() => setTags(p => p.filter(x => x !== t))} className="ml-1 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              {tags.length < 8 && (
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} placeholder="Ex: icônes, design..." className={inputCls + " flex-1"} />
                  <button onClick={addTag} className="px-4 py-2.5 bg-[#FA8112] text-white text-sm font-semibold rounded-xl">+</button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls + " mb-0"}>Prix</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Gratuit</span>
                  <div onClick={() => setIsFree(p => !p)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${isFree ? "bg-[#FA8112]" : "bg-gray-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isFree ? "left-5" : "left-0.5"}`} />
                  </div>
                </label>
              </div>
              {!isFree && (
                <div className="relative">
                  <input type="number" value={price} min={500} step={100} onChange={e => setPrice(Number(e.target.value))} className={inputCls + " pr-12"} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">DA</span>
                </div>
              )}
              {!isFree && price < 500 && <p className="text-xs text-red-500 mt-1">Minimum 500 DA</p>}
            </div>

            <div>
              <label className={labelCls}>Images d'aperçu <span className="text-gray-400 font-normal">(1–3 images, max 5MB)</span></label>
              {totalPreviews < 3 && (
                <div onDrop={onPreviewDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed border-[var(--ink-12)] rounded-xl p-6 text-center cursor-pointer hover:border-[#FA8112]/40 transition-colors" onClick={() => document.getElementById("edit-preview-input")?.click()}>
                  <p className="text-sm text-gray-500">Glissez ou <span className="text-[#FA8112] font-semibold">cliquez</span></p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB</p>
                  <input id="edit-preview-input" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onPreviewInput} />
                </div>
              )}
              {previewError && <p className="text-xs text-red-500 mt-2">{previewError}</p>}
              {totalPreviews > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {existingPreviews.map((img, i) => (
                    <div key={img.url} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setExistingPreviews(p => p.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                    </div>
                  ))}
                  {newPreviews.map((img, i) => (
                    <div key={i} className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setNewPreviews(p => p.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">Nouveau</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Fichier produit <span className="text-gray-400 font-normal">(optionnel — remplace le fichier actuel)</span></label>
              {existingFileUrl && !newProductFile && (
                <div className="mb-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-xs text-green-700 font-medium">Fichier actuel enregistré</p>
                  <p className="text-xs text-green-600 mt-0.5">Laissez vide pour conserver ce fichier</p>
                </div>
              )}
              {newProductFile ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--cream)] border border-[var(--ink-12)] rounded-xl">
                  <svg className="w-5 h-5 text-[#FA8112] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--ink)] truncate">{newProductFile.file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(newProductFile.file.size)}</p>
                  </div>
                  <button onClick={() => setNewProductFile(null)} className="text-gray-400 hover:text-red-500 p-1">×</button>
                </div>
              ) : (
                <div onDrop={onProductFileDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed border-[var(--ink-12)] rounded-xl p-6 text-center cursor-pointer hover:border-[#FA8112]/40 transition-colors" onClick={() => document.getElementById("edit-product-file")?.click()}>
                  <p className="text-sm text-gray-500">Glissez ou <span className="text-[#FA8112] font-semibold">cliquez</span></p>
                  <p className="text-xs text-gray-400 mt-1">{ALLOWED_PRODUCT_EXTS.join(", ")} — max 50MB</p>
                  <input id="edit-product-file" type="file" className="hidden" onChange={onProductFileInput} />
                </div>
              )}
              {fileError && <p className="text-xs text-red-500 mt-2">{fileError}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
              className="w-full py-3 bg-[#FA8112] text-white font-bold rounded-xl hover:bg-[#E8730F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement...</> : "Enregistrer les modifications"}
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
