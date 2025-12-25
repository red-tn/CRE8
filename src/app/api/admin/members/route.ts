import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('members')
      .select('*, membership_dues(*), invite_code:invite_codes!members_invite_code_id_fkey(*)', { count: 'exact' })

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    if (filter === 'active') {
      query = query.eq('is_active', true)
    } else if (filter === 'inactive') {
      query = query.eq('is_active', false)
    } else if (filter === 'admin') {
      query = query.eq('is_admin', true)
    }

    // Map frontend sort keys to database columns
    const sortColumnMap: Record<string, string> = {
      member: 'first_name',
      truck: 'truck_make',
      joined: 'created_at',
      account: 'is_active',
      dues: 'created_at', // Will be sorted client-side for dues status
    }
    const sortColumn = sortColumnMap[sortBy] || sortBy

    const { data: members, count } = await query
      .order(sortColumn, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    // Fetch member_media for all members (first image per member)
    const memberIds = (members || []).map(m => m.id)
    const { data: allMedia } = await supabaseAdmin
      .from('member_media')
      .select('member_id, url, type')
      .in('member_id', memberIds)
      .eq('type', 'image')
      .order('created_at', { ascending: false })

    // Group media by member_id (take first/most recent per member)
    const mediaByMember: Record<string, { url: string }[]> = {}
    allMedia?.forEach(m => {
      if (!mediaByMember[m.member_id]) {
        mediaByMember[m.member_id] = []
      }
      mediaByMember[m.member_id].push({ url: m.url })
    })

    // Remove password hashes and add media
    const sanitizedMembers = (members || []).map(({ password_hash, ...member }) => ({
      ...member,
      member_media: mediaByMember[member.id] || [],
    }))

    return NextResponse.json({
      members: sanitizedMembers,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // Prevent updating password through this endpoint
    delete updates.password_hash

    const { data: member, error } = await supabaseAdmin
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating member:', error)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    const { password_hash, ...memberData } = member
    return NextResponse.json({ member: memberData })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // First verify the member exists and is deactivated
    const { data: member, error: fetchError } = await supabaseAdmin
      .from('members')
      .select('id, is_active, first_name, last_name, email')
      .eq('id', id)
      .single()

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active member. Deactivate first.' },
        { status: 400 }
      )
    }

    // Delete all related data in order (respecting foreign key constraints)
    // 1. Delete member media
    await supabaseAdmin
      .from('member_media')
      .delete()
      .eq('member_id', id)

    // 2. Delete fleet gallery entries
    await supabaseAdmin
      .from('fleet_gallery')
      .delete()
      .eq('member_id', id)

    // 3. Delete event RSVPs
    await supabaseAdmin
      .from('event_rsvps')
      .delete()
      .eq('member_id', id)

    // 4. Delete sessions
    await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('member_id', id)

    // 5. Delete email logs
    await supabaseAdmin
      .from('email_logs')
      .delete()
      .eq('member_id', id)

    // 6. Delete membership dues
    await supabaseAdmin
      .from('membership_dues')
      .delete()
      .eq('member_id', id)

    // 7. Get orders to delete order items first
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('member_id', id)

    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id)

      // Delete order items
      await supabaseAdmin
        .from('order_items')
        .delete()
        .in('order_id', orderIds)

      // Delete orders
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('member_id', id)
    }

    // 8. Update invite codes to remove used_by reference
    await supabaseAdmin
      .from('invite_codes')
      .update({ used_by: null })
      .eq('used_by', id)

    // 9. Finally delete the member
    const { error: deleteError } = await supabaseAdmin
      .from('members')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting member:', deleteError)
      return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Member ${member.first_name} ${member.last_name} and all related data deleted permanently.`
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}
