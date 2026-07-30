import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ThreadClient from "./ThreadClient"

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: convId } = await params

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect(`/login?next=/messages/${convId}`)

  const { data: conv, error: convErr } = await sb
    .from("conversations")
    .select("id, buyer_id, seller_id, listing_type, listing_id")
    .eq("id", convId)
    .single()

  if (convErr) console.error("[thread/page] conversations query error:", convErr)

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    redirect("/messages")
  }

  const [msgsResult, interlocutorResult] = await Promise.all([
    sb
      .from("messages")
      .select("id, conversation_id, sender_id, content, read_at, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true }),
    sb
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id)
      .single(),
  ])

  if (msgsResult.error) console.error("[thread/page] messages query error:", msgsResult.error)
  if (interlocutorResult.error) console.error("[thread/page] interlocutor query error:", interlocutorResult.error)

  const interlocutorId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id

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
      convId={convId}
      currentUserId={user.id}
      interlocutor={interlocutorResult.data ?? { id: interlocutorId, full_name: null, avatar_url: null }}
      listingTitle={listingTitle}
      listingType={conv.listing_type}
      listingId={conv.listing_id}
      initialMessages={(msgsResult.data ?? []) as Parameters<typeof ThreadClient>[0]["initialMessages"]}
    />
  )
}
