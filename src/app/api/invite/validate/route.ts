import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Check if invite code exists and is active
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { valid: false, error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Invite code has expired' },
        { status: 400 }
      )
    }

    // Check if invite has remaining uses
    if (invite.current_uses >= invite.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'Invite code has reached maximum uses' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Invite validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
