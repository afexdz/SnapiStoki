"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export default function UnreadBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const uidRef = useRef<string | null>(null)

  useEffect(() => {
    const sb = createClient()

    const fetchCount = async () => {
      if (!uidRef.current) return
      const { count: c } = await sb
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", uidRef.current)
      setCount(c ?? 0)
    }

    sb.auth.getUser().then(({ data }) => {
      if (!data.user) return
      uidRef.current = data.user.id
      fetchCount()

      channelRef.current = sb
        .channel(`unread-badge-${data.user.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
          if ((payload.new as { sender_id: string }).sender_id !== uidRef.current) {
            setCount((c) => c + 1)
          }
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => {
          fetchCount()
        })
        .subscribe()
    })

    return () => {
      if (channelRef.current) sb.removeChannel(channelRef.current)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] bg-[var(--orange)] text-white text-[10px] font-bold rounded-full px-1 leading-none ${className}`}>
      {count > 99 ? "99+" : count}
    </span>
  )
}
