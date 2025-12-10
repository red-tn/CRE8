import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find valid reset token
    const { data: resetRecord } = await supabaseAdmin
      .from('password_resets')
      .select('member_id, expires_at')
      .eq('token', token)
      .single()

    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Check if expired
    if (new Date(resetRecord.expires_at) < new Date()) {
      await supabaseAdmin.from('password_resets').delete().eq('token', token)
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('members')
      .update({ password_hash: passwordHash })
      .eq('id', resetRecord.member_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    // Delete reset token
    await supabaseAdmin.from('password_resets').delete().eq('token', token)

    // Invalidate all existing sessions for this user
    await supabaseAdmin.from('sessions').delete().eq('member_id', resetRecord.member_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
