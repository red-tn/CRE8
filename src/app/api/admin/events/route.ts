import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const { data: events } = await supabaseAdmin
      .from('events')
      .select('*, event_rsvps(count)')
      .order('event_date', { ascending: false })

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      title,
      description,
      location,
      address,
      eventDate,
      startTime,
      endTime,
      imageUrl,
      isMembersOnly,
      maxAttendees,
    } = body

    if (!title || !eventDate) {
      return NextResponse.json({ error: 'Title and date required' }, { status: 400 })
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        description: description || null,
        location: location || null,
        address: address || null,
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null,
        image_url: imageUrl || null,
        is_members_only: isMembersOnly || false,
        max_attendees: maxAttendees || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Convert field names
    const dbUpdates: Record<string, unknown> = {}
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
    if (updates.isMembersOnly !== undefined) dbUpdates.is_members_only = updates.isMembersOnly
    if (updates.maxAttendees !== undefined) dbUpdates.max_attendees = updates.maxAttendees
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await supabaseAdmin
      .from('events')
      .update({ is_active: false })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
