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
    .select("id, buyer_id, seller_id")
    .eq("id", convId)
    .single()

  if (convErr) console.error("[thread/page] conversations query error:", convErr)

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    redirect("/messages")
  }

  const interlocutorId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id

  const [msgsResult, interlocutorResult] = await Promise.all([
    sb
      .from("messages")
      .select(
        "id, conversation_id, sender_id, content, read_at, created_at, " +
        "attachment_path, attachment_type, attachment_name, attachment_size, " +
        "attachment_width, attachment_height, listing_type, listing_id"
      )
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true }),
    sb
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", interlocutorId)
      .single(),
  ])

  if (msgsResult.error) console.error("[thread/page] messages query error:", msgsResult.error)
  if (interlocutorResult.error) console.error("[thread/page] interlocutor query error:", interlocutorResult.error)

  type MsgRecord = {
    id: string; conversation_id: string; sender_id: string; content: string | null
    read_at: string | null; created_at: string
    attachment_path: string | null; attachment_type: string | null
    attachment_name: string | null; attachment_size: number | null
    attachment_width: number | null; attachment_height: number | null
    listing_type: string | null; listing_id: string | null
  }
  const msgs = (msgsResult.data ?? []) as unknown as MsgRecord[]

  // Batch-generate signed URLs for attachment messages
  const initialSignedUrls: Record<string, string> = {}
  const attachmentPaths = msgs.map((m) => m.attachment_path).filter((p): p is string => !!p)

  if (attachmentPaths.length > 0) {
    const { data: signedData, error: signedError } = await sb.storage
      .from("message-attachments")
      .createSignedUrls(attachmentPaths, 3600)
    if (signedError) {
      console.error("[thread/page] createSignedUrls error:", signedError)
    } else {
      for (const item of signedData ?? []) {
        if (item.path && item.signedUrl && !item.error) {
          initialSignedUrls[item.path] = item.signedUrl
        }
      }
    }
  }

  // Batch-fetch listing titles for context messages (listing_type set, no content/attachment)
  const serviceIds = [...new Set(
    msgs.filter(m => m.listing_type === "service" && m.listing_id).map(m => m.listing_id as string)
  )]
  const productIds = [...new Set(
    msgs.filter(m => m.listing_type === "product" && m.listing_id).map(m => m.listing_id as string)
  )]

  const listingTitles: Record<string, string> = {}
  const [svcsData, prodsData] = await Promise.all([
    serviceIds.length === 0
      ? null
      : sb.from("services").select("id, title").in("id", serviceIds).then(r => r.data),
    productIds.length === 0
      ? null
      : sb.from("digital_products").select("id, title").in("id", productIds).then(r => r.data),
  ])
  for (const s of svcsData ?? []) listingTitles[s.id] = s.title
  for (const p of prodsData ?? []) listingTitles[p.id] = p.title

  return (
    <ThreadClient
      convId={convId}
      currentUserId={user.id}
      interlocutor={interlocutorResult.data ?? { id: interlocutorId, full_name: null, avatar_url: null }}
      listingTitles={listingTitles}
      initialMessages={msgs as Parameters<typeof ThreadClient>[0]["initialMessages"]}
      initialSignedUrls={initialSignedUrls}
    />
  )
}
