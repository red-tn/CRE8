import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { generateInviteCode } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const codeId = searchParams.get('codeId')

    // If codeId is provided, get members who used this code
    if (codeId) {
      const { data: members } = await supabaseAdmin
        .from('members')
        .select('id, email, first_name, last_name, truck_year, truck_make, truck_model, created_at, truck_photo_url, profile_photo_url')
        .eq('invite_code_id', codeId)
        .order('created_at', { ascending: false })

      return NextResponse.json({ members: members || [] })
    }

    // Otherwise get all codes
    const { data: codes } = await supabaseAdmin
      .from('invite_codes')
      .select('*, created_by_member:members!invite_codes_created_by_fkey(first_name, last_name)')
      .order('created_at', { ascending: false })

    return NextResponse.json({ codes: codes || [] })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching invite codes:', error)
    return NextResponse.json({ error: 'Failed to fetch invite codes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()

    const body = await request.json()
    const { maxUses = 1, expiresAt } = body

    const code = generateInviteCode()

    const { data: inviteCode, error } = await supabaseAdmin
      .from('invite_codes')
      .insert({
        code,
        created_by: session.member.id,
        max_uses: maxUses,
        expires_at: expiresAt || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invite code:', error)
      return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
    }

    return NextResponse.json({ code: inviteCode })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
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
      .from('invite_codes')
      .update({ is_active: false })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete invite code' }, { status: 500 })
  }
}
