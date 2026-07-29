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
  if (!sellerId || !listingType || !listingId) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  if (user.id === sellerId) {
    return NextResponse.json({ error: 'Impossible de vous contacter vous-même' }, { status: 400 })
  }
  if (!['service', 'product'].includes(listingType)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  }

  const { data: existing } = await sb
    .from('conversations')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('seller_id', sellerId)
    .eq('listing_type', listingType)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ conversationId: existing.id })
  }

  const { data: created, error } = await sb
    .from('conversations')
    .insert({ buyer_id: user.id, seller_id: sellerId, listing_type: listingType, listing_id: listingId })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversationId: created.id })
}
