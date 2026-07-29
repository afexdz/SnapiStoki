import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ThreadClient from "./ThreadClient"

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect(`/login?next=/messages/${params.id}`)

  const { data: conv } = await sb
    .from("conversations")
    .select("id, buyer_id, seller_id, listing_type, listing_id")
    .eq("id", params.id)
    .single()

  // Server-side participation check (RLS + explicit guard)
  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    redirect("/messages")
  }

  const { data: messages } = await sb
    .from("messages")
    .select("id, conversation_id, sender_id, content, read_at, created_at")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true })

  const interlocutorId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
  const { data: interlocutor } = await sb
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", interlocutorId)
    .single()

  let listingTitle = "Annonce"
  if (conv.listing_type === "service") {
    const { data: svc } = await sb.from("services").select("title").eq("id", conv.listing_id).single()
    if (svc) listingTitle = svc.title
  } else {
    const { data: prod } = await sb.from("digital_products").select("title").eq("id", conv.listing_id).single()
    if (prod) listingTitle = prod.title
  }

  return (
    <ThreadClient
      convId={params.id}
      currentUserId={user.id}
      interlocutor={interlocutor ?? { id: interlocutorId, full_name: null, avatar_url: null }}
      listingTitle={listingTitle}
      listingType={conv.listing_type}
      listingId={conv.listing_id}
      initialMessages={messages ?? []}
    />
  )
}
