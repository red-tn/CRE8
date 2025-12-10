import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find member
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !member) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if active
    if (!member.is_active) {
      return NextResponse.json(
        { error: 'Your account has been deactivated' },
        { status: 403 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, member.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session
    await createSession(member.id)

    // Remove password_hash from response
    const { password_hash, ...memberData } = member

    return NextResponse.json({
      success: true,
      member: memberData,
    })
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : error)
    console.error('Login error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
