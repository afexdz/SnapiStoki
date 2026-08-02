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
  // Both must be provided together, or neither
  if ((listingType && !listingId) || (!listingType && listingId)) {
    return NextResponse.json({ error: 'listingType et listingId doivent être fournis ensemble' }, { status: 400 })
  }
  if (listingType && !['service', 'product'].includes(listingType)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  // Find existing conversation — NULL must be matched with IS NULL, not = NULL
  let query = sb
    .from('conversations')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('seller_id', sellerId)

  if (listingType && listingId) {
    query = query.eq('listing_type', listingType).eq('listing_id', listingId)
  } else {
    query = query.is('listing_type', null).is('listing_id', null)
  }

  const { data: existing } = await query.maybeSingle()
  if (existing) {
    return NextResponse.json({ conversationId: existing.id })
  }

  const { data: created, error } = await sb
    .from('conversations')
    .insert({
      buyer_id: user.id,
      seller_id: sellerId,
      listing_type: listingType ?? null,
      listing_id: listingId ?? null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversationId: created.id })
}
