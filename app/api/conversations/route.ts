import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { sellerId?: string; listingType?: string; listingId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { sellerId, listingType, listingId } = body
  if (!sellerId) {
    return NextResponse.json({ error: 'sellerId manquant' }, { status: 400 })
  }
  if (user.id === sellerId) {
    return NextResponse.json({ error: 'Impossible de vous contacter vous-même' }, { status: 400 })
  }
  if ((listingType && !listingId) || (!listingType && listingId)) {
    return NextResponse.json({ error: 'listingType et listingId doivent être fournis ensemble' }, { status: 400 })
  }
  if (listingType && !['service', 'product'].includes(listingType)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  // Find existing conversation for the pair — order-insensitive (A→B = B→A)
  const { data: existing } = await sb
    .from('conversations')
    .select('id')
    .or(
      `and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),` +
      `and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ conversationId: existing.id })
  }

  // Create new conversation
  const { data: created, error } = await sb
    .from('conversations')
    .insert({ buyer_id: user.id, seller_id: sellerId })
    .select('id')
    .single()

  if (error) {
    // Race condition: another request created the conv between our SELECT and INSERT
    if (error.code === '23505') {
      const { data: raceConv } = await sb
        .from('conversations')
        .select('id')
        .or(
          `and(buyer_id.eq.${user.id},seller_id.eq.${sellerId}),` +
          `and(buyer_id.eq.${sellerId},seller_id.eq.${user.id})`
        )
        .maybeSingle()
      if (raceConv) return NextResponse.json({ conversationId: raceConv.id })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If a listing context was provided, insert a context marker as the first message
  if (listingType && listingId) {
    await sb.from('messages').insert({
      conversation_id: created.id,
      sender_id: user.id,
      content: null,
      listing_type: listingType,
      listing_id: listingId,
    })
  }

  return NextResponse.json({ conversationId: created.id })
}
