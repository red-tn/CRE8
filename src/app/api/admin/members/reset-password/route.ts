import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { sendEmail } from '@/lib/sendgrid'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Get member info
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id, email, first_name')
      .eq('id', memberId)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store reset token
    await supabaseAdmin.from('password_resets').upsert({
      member_id: member.id,
      token: resetToken,
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'member_id' })

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    await sendEmail({
      to: member.email,
      subject: 'CRE8 Truck Club - Password Reset',
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #fff; text-align: center; font-size: 32px; margin-bottom: 20px; letter-spacing: 2px;">
              CRE8 TRUCK CLUB
            </h1>
            <h2 style="color: #a1a1aa; text-align: center;">Password Reset</h2>
            <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
              Hey ${member.first_name},
            </p>
            <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
              An admin has initiated a password reset for your account. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #fff; color: #000; padding: 15px 40px; text-decoration: none; font-weight: bold; font-size: 18px;">
                RESET PASSWORD
              </a>
            </div>
            <p style="color: #71717a; font-size: 14px;">
              This link will expire in 24 hours.
            </p>
            <p style="color: #71717a; font-size: 14px; text-align: center; margin-top: 40px;">
              CRE8 Truck Club
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: `Password reset email sent to ${member.email}` })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
