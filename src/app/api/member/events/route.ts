import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth, getSession } from '@/lib/auth'

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

// Create or update RSVP
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { eventId, status, guests = 0 } = await request.json()

    if (!eventId || !status) {
      return NextResponse.json({ error: 'Event ID and status are required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['attending', 'maybe', 'not_attending']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Check if event exists and is active
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('is_active', true)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if RSVP already exists
    const { data: existingRsvp } = await supabaseAdmin
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('member_id', session.member.id)
      .single()

    if (existingRsvp) {
      // Update existing RSVP
      const { data: updatedRsvp, error: updateError } = await supabaseAdmin
        .from('event_rsvps')
        .update({ status, guests })
        .eq('id', existingRsvp.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({ rsvp: updatedRsvp })
    } else {
      // Create new RSVP
      const { data: newRsvp, error: insertError } = await supabaseAdmin
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          member_id: session.member.id,
          status,
          guests,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({ rsvp: newRsvp })
    }
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error saving RSVP:', error)
    return NextResponse.json({ error: 'Failed to save RSVP' }, { status: 500 })
  }
}

// Delete RSVP
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', session.member.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting RSVP:', error)
    return NextResponse.json({ error: 'Failed to delete RSVP' }, { status: 500 })
  }
}
