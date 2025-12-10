import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { sendEmail, getTestEmail } from '@/lib/sendgrid'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const testEmail = getTestEmail()
    const result = await sendEmail({
      to: email,
      subject: testEmail.subject,
      html: testEmail.html,
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: `Test email sent to ${email}` })
    } else {
      console.error('Email send failed:', result.error)
      return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 })
    }
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
