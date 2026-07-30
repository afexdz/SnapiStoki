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
      .select("id, conversation_id, sender_id, content, read_at, created_at, attachment_path, attachment_type, attachment_name, attachment_size, attachment_width, attachment_height")
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

  // Batch-generate signed URLs for every message that has an attachment.
  // One API call for the entire thread — bucket is private so there are no
  // public URLs; signed URLs are mandatory for display.
  const initialSignedUrls: Record<string, string> = {}
  const attachmentPaths = (msgsResult.data ?? [])
    .map((m) => m.attachment_path)
    .filter((p): p is string => !!p)

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
      initialSignedUrls={initialSignedUrls}
    />
  )
}
