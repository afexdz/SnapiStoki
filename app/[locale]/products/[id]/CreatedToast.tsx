"use client"

import { useState, useEffect } from "react"

export default function CreatedToast({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [show])

  if (!visible) return null

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg z-50">
      Produit publié avec succès !
    </div>
  )
}
