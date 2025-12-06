import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()

    // Get upcoming events
    const { data: events } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(5)

    // Get member's RSVPs
    const { data: rsvps } = await supabaseAdmin
      .from('event_rsvps')
      .select('*')
      .eq('member_id', session.member.id)

    // Combine events with RSVP status
    const eventsWithRsvp = (events || []).map(event => ({
      ...event,
      rsvp: (rsvps || []).find(r => r.event_id === event.id),
    }))

    return NextResponse.json({ events: eventsWithRsvp })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching events:', error)
    return NextResponse.json({ events: [] })
  }
}
