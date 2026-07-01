"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { createClient } from "@/lib/supabase/client"
import { WILAYAS, findNearestWilaya } from "@/lib/wilayas"
import type { User } from "@supabase/supabase-js"

/* ─── Types ─────────────────────────────────────────────────── */
type Profile = {
  id: string
  full_name: string | null
  bio: string | null
  wilaya: string | null
  role: string | null
  avatar_url: string | null
  cover_url: string | null
  cover_position: string | null
  rating: number | null
  created_at: string
}
type Stats = { orders: number; sales: number; reviews: number; revenue: number }
type Service = {
  id: string; title: string; price: number
  rating: number | null; review_count: number | null
  category: string | null; cover_url: string | null
}
type Product = {
  id: string; title: string; price: number
  sales_count: number | null; format: string | null; cover_url: string | null
}
type Review = {
  id: string; rating: number; comment: string | null; created_at: string
  reviewer_name: string | null; reviewer_initials: string | null; reviewer_avatar: string | null
}
type Tab = "services" | "produits" | "avis" | "parametres"

/* ─── Constants ─────────────────────────────────────────────── */
const GRADIENTS = [
  "from-[#FA8112] to-[#E8730F]",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
]

/* ─── Helpers ────────────────────────────────────────────────── */
const getInitials = (name: string | null) =>
  (name || "?").trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)

const memberSince = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

const relativeDate = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return "Il y a 1 jour"
  if (days < 7) return `Il y a ${days} jours`
  const w = Math.floor(days / 7)
  if (days < 30) return `Il y a ${w} semaine${w > 1 ? "s" : ""}`
  const m = Math.floor(days / 30)
  if (days < 365) return `Il y a ${m} mois`
  const y = Math.floor(days / 365)
  return `Il y a ${y} an${y > 1 ? "s" : ""}`
}

/* ─── Sub-components ─────────────────────────────────────────── */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-4 h-4" : "w-3 h-3"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function Spinner({ cls = "w-5 h-5" }: { cls?: string }) {
  return (
    <svg className={`${cls} animate-spin text-[#FA8112]`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

/* ─── Crop helpers ───────────────────────────────────────────── */
function centerAspectCrop(w: number, h: number, aspect: number): Crop {
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h), w, h)
}

async function cropToBlob(img: HTMLImageElement, crop: PixelCrop, outW: number, outH: number): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width  = outW
  canvas.height = outH
  const ctx = canvas.getContext("2d")!
  const scaleX = img.naturalWidth  / img.width
  const scaleY = img.naturalHeight / img.height
  ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, outW, outH)
  return new Promise((res, rej) =>
    canvas.toBlob((b) => b ? res(b) : rej(new Error("canvas toBlob failed")), "image/jpeg", 0.92)
  )
}

/* ─── CropModal ──────────────────────────────────────────────── */
type CropMode = "avatar" | "cover"

interface CropModalProps {
  src: string
  mode: CropMode
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function CropModal({ src, mode, onConfirm, onCancel }: CropModalProps) {
  const aspect   = mode === "avatar" ? 1 : 16 / 3
  const minW     = mode === "avatar" ? 200 : 1200
  const minH     = mode === "avatar" ? 200 : 300
  const outW     = mode === "avatar" ? 400  : 1200
  const outH     = mode === "avatar" ? 400  : 300

  const imgRef                      = useRef<HTMLImageElement>(null)
  const [crop, setCrop]             = useState<Crop>()
  const [completedCrop, setCompleted] = useState<PixelCrop>()
  const [confirming, setConfirming] = useState(false)

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centerAspectCrop(w, h, aspect))
  }, [aspect])

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return
    setConfirming(true)
    const blob = await cropToBlob(imgRef.current, completedCrop, outW, outH)
    onConfirm(blob)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#3a3a3a] overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
          <h3 className="text-base font-bold text-white">Recadrer la photo</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop area */}
        <div className="flex items-center justify-center bg-black/60 p-4 max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompleted(c)}
            aspect={aspect}
            minWidth={minW / 4}
            minHeight={minH / 4}
            circularCrop={mode === "avatar"}
            keepSelection
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="crop-source"
              onLoad={onLoad}
              style={{ maxHeight: "55vh", maxWidth: "100%", display: "block" }}
            />
          </ReactCrop>
        </div>

        {/* Hint */}
        <p className="text-center text-xs text-gray-500 pt-3 px-6">
          {mode === "avatar" ? "Ratio 1:1 — glissez pour repositionner" : "Ratio 16:3 — glissez pour repositionner"}
        </p>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border-2 border-[#3a3a3a] text-gray-300 text-sm font-semibold rounded-xl hover:border-[#FA8112]/40 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!completedCrop || confirming}
            className="flex-1 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#FA8112]/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {confirming
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Envoi...</>
              : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ProfilePage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats]     = useState<Stats>({ orders: 0, sales: 0, reviews: 0, revenue: 0 })
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews]   = useState<Review[]>([])

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl]   = useState<string | null>(null)

  const [activeTab, setActiveTab]   = useState<Tab>("services")
  const [loading, setLoading]       = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", wilaya: "", role: "" })

  const [detectedWilaya, setDetectedWilaya] = useState("")

  const [cropSrc, setCropSrc]   = useState<string | null>(null)
  const [cropMode, setCropMode] = useState<CropMode>("avatar")

  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef  = useRef<HTMLInputElement>(null)

  const [showCoverMenu, setShowCoverMenu]   = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const coverMenuRef  = useRef<HTMLDivElement>(null)
  const avatarMenuRef = useRef<HTMLDivElement>(null)

  const [isRepositioning, setIsRepositioning] = useState(false)
  const [coverPosition, setCoverPosition]     = useState('center 50%')
  const [dragStartY, setDragStartY]           = useState<number | null>(null)
  const [positionPercent, setPositionPercent] = useState(50)

  /* ── Close menus on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (coverMenuRef.current && !coverMenuRef.current.contains(e.target as Node)) setShowCoverMenu(false)
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) setShowAvatarMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  /* ── Init: auth + profile + stats ── */
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Profile data:', profileData)
      console.log('Profile error:', profileError)

      if (profileData) {
        setProfile(profileData)
        if (profileData.avatar_url) {
          console.log('Setting avatar:', profileData.avatar_url)
          setAvatarUrl(profileData.avatar_url)
        }
        if (profileData.cover_url) {
          console.log('[profile] Setting cover_url from DB:', profileData.cover_url)
          setCoverUrl(profileData.cover_url)
        }
        if (profileData.cover_position) {
          setCoverPosition(profileData.cover_position)
          const match = profileData.cover_position.match(/(\d+)%/)
          if (match) setPositionPercent(parseInt(match[1]))
        }

        // Auto-detect wilaya from IP if user hasn't set one
        if (!profileData.wilaya) {
          try {
            const res = await fetch('https://ipapi.co/json/')
            const geo = await res.json()
            if (geo.latitude && geo.longitude) {
              const nearest = findNearestWilaya(geo.latitude, geo.longitude)
              setDetectedWilaya(nearest.name)
              setEditForm(prev => ({ ...prev, wilaya: nearest.name }))
            }
          } catch (e) {
            console.log('IP detection failed:', e)
          }
        }
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  /* ── Tab data ── */
  useEffect(() => {
    if (!user || activeTab === "parametres") return
    ;(async () => {
      setTabLoading(true)
      if (activeTab === "services") {
        const { data } = await supabase.from("services")
          .select("id, title, price, rating, review_count, category, cover_url")
          .eq("seller_id", user.id).order("created_at", { ascending: false })
        setServices(data ?? [])
      } else if (activeTab === "produits") {
        const { data } = await supabase.from("digital_products")
          .select("id, title, price, sales_count, format, cover_url")
          .eq("seller_id", user.id).order("created_at", { ascending: false })
        setProducts(data ?? [])
      } else if (activeTab === "avis") {
        const { data } = await supabase.from("reviews")
          .select("id, rating, comment, created_at, reviewer_name, reviewer_initials, reviewer_avatar")
          .eq("seller_id", user.id).order("created_at", { ascending: false })
        setReviews(data ?? [])
      }
      setTabLoading(false)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user])

  /* ── Open crop modal on file select ── */
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropMode("avatar")
    setCropSrc(url)
    e.target.value = ""
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropMode("cover")
    setCropSrc(url)
    e.target.value = ""
  }

  /* ── Upload confirmed crop blob ── */
  const handleCropConfirm = async (blob: Blob) => {
    if (!user) return
    setUploading(true)
    setCropSrc(null)

    const sb       = createClient()
    const ts       = Date.now()
    const bucket   = cropMode === "avatar" ? "avatars" : "covers"
    const fileName = cropMode === "avatar"
      ? `${user.id}-avatar-${ts}.jpg`
      : `${user.id}-cover-${ts}.jpg`

    console.log(`[upload] Starting ${cropMode} upload — bucket=${bucket} file=${fileName}`)

    const { error: uploadError } = await sb.storage.from(bucket).upload(fileName, blob, {
      upsert: true,
      contentType: "image/jpeg",
    })
    if (uploadError) {
      console.error(`[upload] Storage upload FAILED:`, uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(fileName)
    console.log(`[upload] Storage upload OK — publicUrl=${publicUrl}`)

    if (cropMode === "avatar") {
      const { error: dbErr } = await sb.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)
      if (dbErr) {
        console.error(`[upload] DB update avatar_url FAILED:`, dbErr)
      } else {
        console.log(`[upload] DB avatar_url updated OK`)
        setAvatarUrl(`${publicUrl}?v=${ts}`)
      }
    } else {
      console.log(`[upload] Saving cover_url to DB:`, publicUrl)
      const { error: dbErr } = await sb.from("profiles").update({ cover_url: publicUrl }).eq("id", user.id)
      if (dbErr) {
        console.error(`[upload] DB update cover_url FAILED:`, dbErr)
      } else {
        console.log(`[upload] DB cover_url updated OK — refreshing state`)
        setCoverUrl(publicUrl + '?t=' + Date.now())
      }
    }

    setUploading(false)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  /* ── Delete photo ── */
  const handleDeleteCover = async () => {
    if (!user) return
    const sb = createClient()
    const { error } = await sb.from("profiles").update({ cover_url: null }).eq("id", user.id)
    if (!error) setCoverUrl(null)
  }

  const handleDeleteAvatar = async () => {
    if (!user) return
    const sb = createClient()
    const { error } = await sb.from("profiles").update({ avatar_url: null }).eq("id", user.id)
    if (!error) setAvatarUrl(null)
  }

  /* ── Cover reposition ── */
  const enterRepositionMode = () => {
    setIsRepositioning(true)
    setShowCoverMenu(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return
    e.preventDefault()
    setDragStartY(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRepositioning || dragStartY === null || e.buttons !== 1) return
    e.preventDefault()
    const diff = dragStartY - e.clientY
    const newPercent = Math.max(0, Math.min(100, positionPercent + diff * 0.3))
    setCoverPosition(`center ${newPercent}%`)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isRepositioning) return
    const diff = (dragStartY || e.clientY) - e.clientY
    const newPercent = Math.max(0, Math.min(100, positionPercent + diff * 0.3))
    setPositionPercent(newPercent)
    setDragStartY(null)
  }

  const handleRepositionSave = async () => {
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ cover_position: coverPosition })
      .eq('id', user!.id)
    setIsRepositioning(false)
  }

  const handleRepositionCancel = () => {
    setCoverPosition(`center ${positionPercent}%`)
    setIsRepositioning(false)
  }

  /* ── Save profile edit ── */
  const openEdit = () => {
    setEditForm({
      full_name: profile?.full_name || "",
      bio:       profile?.bio       || "",
      wilaya:    profile?.wilaya    || detectedWilaya || "",
      role:      profile?.role      || "",
    })
    setShowEdit(true)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    const sb = createClient()
    const { error } = await sb
      .from("profiles")
      .update({
        full_name:  editForm.full_name,
        bio:        editForm.bio,
        wilaya:     editForm.wilaya,
        role:       editForm.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
    if (!error) {
      setProfile(prev => prev ? {
        ...prev,
        full_name: editForm.full_name,
        bio:       editForm.bio,
        wilaya:    editForm.wilaya,
        role:      editForm.role,
      } : null)
    }
    setSaving(false)
    setShowEdit(false)
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
          <Spinner cls="w-10 h-10" />
        </main>
        <Footer />
      </>
    )
  }

  /* ── Derived display values ── */
  const displayName     = profile?.full_name || user?.email?.split("@")[0] || "Utilisateur"
  const displayInitials = getInitials(profile?.full_name ?? null)
  const memberRole      = profile?.role

  const statsCards = [
    { label: "Commandes", value: stats.orders.toLocaleString("fr-FR"),  icon: "📦" },
    { label: "Ventes",    value: stats.sales.toLocaleString("fr-FR"),   icon: "🛒" },
    { label: "Avis",      value: stats.reviews.toLocaleString("fr-FR"), icon: "⭐" },
    {
      label: "Revenus",
      value: stats.revenue > 0 ? `${stats.revenue.toLocaleString("fr-FR")} DA` : "0 DA",
      icon: "💰",
    },
  ]

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "services",   label: "Mes services",  count: services.length   },
    { id: "produits",   label: "Mes produits",  count: products.length   },
    { id: "avis",       label: "Avis",          count: stats.reviews     },
    { id: "parametres", label: "Paramètres"                               },
  ]

  /* ── Render ── */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF8F0] dark:bg-[#1a1a1a] pb-20">

        {/* Hidden file inputs */}
        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
        <input ref={coverRef}  type="file" accept="image/*" className="hidden" onChange={handleCoverSelect}  />

        {/* ── Cover + Avatar ── */}
        <div className="relative">
          {/* Cover */}
          <div className="h-52 sm:h-64 relative overflow-hidden select-none">
            {/* Cover background — z-index 0 */}
            {coverUrl ? (
              <img
                key={coverUrl}
                src={coverUrl}
                alt="cover"
                draggable={false}
                style={{
                  position: "absolute", inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: coverPosition,
                  cursor: isRepositioning ? 'ns-resize' : 'default',
                  userSelect: 'none',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, #FA8112 0%, #e06b00 100%)", zIndex: 0 }}
              >
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Reposition mode bar */}
            {isRepositioning && (
              <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:20}}>
                <span style={{color:'white', fontSize:13}}>Faites glisser pour repositionner</span>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={handleRepositionCancel} style={{color:'white', background:'transparent', border:'1px solid white', padding:'5px 14px', borderRadius:6, cursor:'pointer'}}>Annuler</button>
                  <button onClick={handleRepositionSave} style={{background:'#FA8112', color:'white', border:'none', padding:'5px 14px', borderRadius:6, cursor:'pointer'}}>Confirmer</button>
                </div>
              </div>
            )}

            {/* Cover 3-dot menu — hidden during reposition */}
            {!isRepositioning && (
              <div ref={coverMenuRef} className="absolute top-4 right-4" style={{ zIndex: 20 }}>
                <button
                  onClick={() => setShowCoverMenu((v) => !v)}
                  disabled={uploading}
                  className="w-8 h-8 flex items-center justify-center bg-black/30 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-black/50 transition-colors disabled:opacity-60"
                >
                  {uploading ? <Spinner cls="w-3.5 h-3.5" /> : <span className="text-base font-bold leading-none tracking-widest">···</span>}
                </button>
                {showCoverMenu && (
                  <div className="absolute right-0 top-10 w-52 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-xl border border-[#F0E8E0] dark:border-[#3a3a3a] overflow-hidden">
                    <button
                      onClick={() => { coverRef.current?.click(); setShowCoverMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-[#FAF3E1] hover:bg-[#FA8112] hover:text-white transition-colors"
                    >
                      Changer la couverture
                    </button>
                    {coverUrl && (
                      <button
                        onClick={enterRepositionMode}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-[#FAF3E1] hover:bg-[#FA8112] hover:text-white transition-colors"
                      >
                        Repositionner
                      </button>
                    )}
                    <button
                      onClick={() => { handleDeleteCover(); setShowCoverMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Supprimer la couverture
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="absolute left-6 sm:left-10 bottom-0 translate-y-1/2" style={{ zIndex: 10 }}>
            <div className="relative">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#1a1a1a]">
                <div style={{ width: "100%", height: "100%", overflow: "hidden", background: "linear-gradient(135deg, #FA8112 0%, #e06b00 100%)" }}>
                  {avatarUrl ? (
                    <img
                      key={avatarUrl}
                      src={avatarUrl}
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "36px", fontWeight: "800", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.2)", lineHeight: 1 }}>
                        {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
              </div>

              {/* Avatar 3-dot menu */}
              <div ref={avatarMenuRef} className="absolute -bottom-1 -right-1">
                <button
                  onClick={() => setShowAvatarMenu((v) => !v)}
                  className="w-8 h-8 bg-[#FA8112] hover:bg-[#E8730F] rounded-xl flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  <span className="text-sm font-bold leading-none tracking-widest">···</span>
                </button>
                {showAvatarMenu && (
                  <div className="absolute left-0 bottom-10 w-44 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-xl border border-[#F0E8E0] dark:border-[#3a3a3a] overflow-hidden">
                    <button
                      onClick={() => { avatarRef.current?.click(); setShowAvatarMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-[#FAF3E1] hover:bg-[#FA8112] hover:text-white transition-colors"
                    >
                      Changer la photo
                    </button>
                    <button
                      onClick={() => { handleDeleteAvatar(); setShowAvatarMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Supprimer la photo
                    </button>
                  </div>
                )}
              </div>

              <span className="absolute top-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* ── Profile info ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-16 sm:pt-14 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">
                  {displayName}
                </h1>
                {memberRole && memberRole !== "buyer" && memberRole !== "seller" && (
                  <span className="px-3 py-1 bg-[#FA8112]/15 dark:bg-[#FA8112]/20 text-[#FA8112] text-xs font-bold rounded-full">
                    {memberRole}
                  </span>
                )}
                {memberRole === "seller" && (
                  <span className="px-3 py-1 bg-[#FA8112]/15 dark:bg-[#FA8112]/20 text-[#FA8112] text-xs font-bold rounded-full">
                    Vendeur
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-lg leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                {profile?.rating != null && (
                  <div className="flex items-center gap-1.5">
                    <Stars rating={profile.rating} size="md" />
                    <span className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">{profile.rating.toFixed(1)}</span>
                    <span>({stats.reviews} avis)</span>
                  </div>
                )}
                {profile?.wilaya && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#FA8112]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.wilaya}, Algérie
                  </div>
                )}
                {profile?.created_at && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Membre depuis {memberSince(profile.created_at)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <button className="px-5 py-2.5 border-2 border-[#F0E8E0] dark:border-[#3a3a3a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm font-semibold rounded-xl hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all">
                Message
              </button>
              <button
                onClick={openEdit}
                className="px-5 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#FA8112]/30"
              >
                Modifier le profil
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {statsCards.map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-4 text-center hover:border-[#FA8112]/30 hover:shadow-lg hover:shadow-[#FA8112]/10 transition-all"
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs nav ── */}
          <div className="flex gap-1 bg-[#F0E8E0] dark:bg-[#2a2a2a] p-1 rounded-2xl mb-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#1a1a1a] text-[#FA8112] shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-[#1A1A1A] dark:hover:text-[#FAF3E1]"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-[#FA8112]/15 text-[#FA8112]"
                      : "bg-white dark:bg-[#3a3a3a] text-gray-500 dark:text-gray-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          {tabLoading ? (
            <div className="flex justify-center py-20"><Spinner cls="w-8 h-8" /></div>
          ) : (
            <>
              {/* Services */}
              {activeTab === "services" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((s, i) => (
                    <div key={s.id} className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all overflow-hidden">
                      <div
                        className={`h-36 relative overflow-hidden ${!s.cover_url ? `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}` : ""}`}
                        style={s.cover_url ? { backgroundImage: `url(${s.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                      >
                        {s.category && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">{s.category}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-2 group-hover:text-[#FA8112] transition-colors line-clamp-2">{s.title}</h3>
                        {s.rating != null && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <Stars rating={s.rating} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{s.rating} ({s.review_count ?? 0})</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {s.price.toLocaleString("fr-FR")} <span className="text-[#FA8112]">DA</span>
                          </span>
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-[#F0E8E0] dark:border-[#3a3a3a] rounded-lg hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add service card */}
                  <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#2a2a2a] rounded-2xl border-2 border-dashed border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 hover:bg-[#FA8112]/5 dark:hover:bg-[#FA8112]/10 transition-all p-8 group min-h-[180px]">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] dark:bg-[#1a1a1a] group-hover:bg-[#FA8112]/15 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FA8112] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#FA8112] transition-colors">Ajouter un service</span>
                  </button>
                </div>
              )}

              {/* Products */}
              {activeTab === "produits" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p, i) => (
                    <div key={p.id} className="group bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/30 hover:shadow-xl hover:shadow-[#FA8112]/10 transition-all overflow-hidden">
                      <div
                        className={`h-36 relative overflow-hidden ${!p.cover_url ? `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}` : ""}`}
                        style={p.cover_url ? { backgroundImage: `url(${p.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                      >
                        {p.format && (
                          <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-xs rounded-lg">{p.format}</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] mb-1 line-clamp-2 group-hover:text-[#FA8112] transition-colors">{p.title}</h3>
                        <p className="text-xs text-gray-400 mb-3">
                          {p.sales_count ?? 0} vente{(p.sales_count ?? 0) !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAF3E1]">
                            {p.price.toLocaleString("fr-FR")} <span className="text-[#FA8112]">DA</span>
                          </span>
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-[#F0E8E0] dark:border-[#3a3a3a] rounded-lg hover:border-[#FA8112]/40 hover:text-[#FA8112] transition-all">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#2a2a2a] rounded-2xl border-2 border-dashed border-[#F0E8E0] dark:border-[#3a3a3a] hover:border-[#FA8112]/40 hover:bg-[#FA8112]/5 dark:hover:bg-[#FA8112]/10 transition-all p-8 group min-h-[180px]">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8F0] dark:bg-[#1a1a1a] group-hover:bg-[#FA8112]/15 flex items-center justify-center transition-colors">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-[#FA8112] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-[#FA8112] transition-colors">Ajouter un produit</span>
                  </button>
                </div>
              )}

              {/* Reviews */}
              {activeTab === "avis" && (
                <div className="space-y-4 max-w-3xl">
                  {reviews.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-4xl mb-3">⭐</div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Aucun avis reçu pour l'instant.</p>
                    </div>
                  ) : reviews.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-6 hover:border-[#FA8112]/30 hover:shadow-lg hover:shadow-[#FA8112]/10 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FA8112] to-[#E8730F] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                          {r.reviewer_avatar
                            ? <img src={r.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                            : (r.reviewer_initials || "?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-[#1A1A1A] dark:text-[#FAF3E1] text-sm">
                                {r.reviewer_name || "Anonyme"}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Stars rating={r.rating} />
                                <span className="text-xs text-gray-400">{relativeDate(r.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{r.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Settings */}
              {activeTab === "parametres" && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#F0E8E0] dark:border-[#3a3a3a] p-6">
                    <h3 className="font-bold text-[#1A1A1A] dark:text-[#FAF3E1] mb-5">Informations du compte</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={user?.email || ""}
                          className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm outline-none opacity-70 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
                      </div>
                      {profile?.created_at && (
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                            Membre depuis
                          </label>
                          <input
                            readOnly
                            value={memberSince(profile.created_at)}
                            className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm outline-none opacity-70 cursor-not-allowed"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={openEdit}
                      className="mt-5 px-6 py-2.5 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#FA8112]/30"
                    >
                      Modifier les informations du profil
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#2a2a2a] rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
                    <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Zone de danger</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Une fois votre compte supprimé, toutes vos données seront définitivement perdues.
                    </p>
                    <button className="px-5 py-2.5 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Edit profile modal ── */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowEdit(false)}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-[#2a2a2a] rounded-3xl shadow-2xl shadow-[#FA8112]/10 border border-[#F0E8E0] dark:border-[#3a3a3a] p-8 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-[#1A1A1A] dark:text-[#FAF3E1]">Modifier le profil</h2>
                <button
                  onClick={() => setShowEdit(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Votre nom complet"
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                </div>

                {/* Role / métier */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">
                    Métier / spécialité <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="ex: Designer graphique, Développeur web…"
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Décrivez votre expérience et vos compétences…"
                    className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] placeholder-gray-400 outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm resize-none"
                  />
                </div>

                {/* Wilaya */}
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#FAF3E1] mb-1.5">Wilaya</label>
                  <div className="relative">
                    <select
                      value={editForm.wilaya}
                      onChange={(e) => setEditForm((f) => ({ ...f, wilaya: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[#F0E8E0] dark:border-[#3a3a3a] bg-[#FFF8F0] dark:bg-[#1a1a1a] text-[#1A1A1A] dark:text-[#FAF3E1] outline-none focus:border-[#FA8112] focus:ring-2 focus:ring-[#FA8112]/20 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionnez votre wilaya</option>
                      {WILAYAS.map((w) => (
                        <option key={w.id} value={w.name}>
                          {w.id.toString().padStart(2, "0")} — {w.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEdit(false)}
                    className="flex-1 py-3 border-2 border-[#F0E8E0] dark:border-[#3a3a3a] text-[#1A1A1A] dark:text-[#FAF3E1] text-sm font-semibold rounded-xl hover:border-[#FA8112]/40 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 py-3 bg-[#FA8112] hover:bg-[#E8730F] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#FA8112]/30 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? <><Spinner cls="w-4 h-4" /> Sauvegarde…</> : "Sauvegarder"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ── Crop modal ── */}
        {cropSrc && (
          <CropModal
            src={cropSrc}
            mode={cropMode}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </main>
      <Footer />
    </>
  )
}
