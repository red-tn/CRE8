import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { hashPassword, createSession } from '@/lib/auth'
import { sendEmail, getWelcomeEmail } from '@/lib/sendgrid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      truckYear,
      truckMake,
      truckModel,
      instagram,
      inviteCode,
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !inviteCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate invite code
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite code has expired' },
        { status: 400 }
      )
    }

    // Check if invite has remaining uses
    if (invite.current_uses >= invite.max_uses) {
      return NextResponse.json(
        { error: 'Invite code has reached maximum uses' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingMember } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create member
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        truck_year: truckYear || null,
        truck_make: truckMake || null,
        truck_model: truckModel || null,
        instagram_handle: instagram || null,
        is_admin: false,
        is_active: true,
      })
      .select()
      .single()

    if (memberError || !member) {
      console.error('Member creation error:', memberError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Update invite code usage
    await supabaseAdmin
      .from('invite_codes')
      .update({
        current_uses: invite.current_uses + 1,
        used_by: invite.current_uses === 0 ? member.id : invite.used_by,
      })
      .eq('id', invite.id)

    // Create session
    await createSession(member.id)

    // Send welcome email
    const welcomeEmail = getWelcomeEmail(
      firstName,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )
    await sendEmail({
      to: email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    })

    // Log email
    await supabaseAdmin.from('email_logs').insert({
      member_id: member.id,
      email_type: 'welcome',
      recipient_email: email,
      subject: welcomeEmail.subject,
      status: 'sent',
    })

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
