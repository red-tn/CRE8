import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || ''
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

    const { data: members, count } = await query
      .order('created_at', { ascending: false })
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
