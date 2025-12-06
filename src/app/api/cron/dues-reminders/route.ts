import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getDuesReminderEmail } from '@/lib/sendgrid'

// This endpoint should be called by a cron job (e.g., Vercel Cron or external service)
// Set up a cron job to hit this endpoint daily
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (set this in your environment variables)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get members with dues expiring in the next 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: expiringDues } = await supabaseAdmin
      .from('membership_dues')
      .select('*, member:members(*)')
      .eq('status', 'paid')
      .lte('period_end', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('period_end', new Date().toISOString().split('T')[0])

    if (!expiringDues || expiringDues.length === 0) {
      return NextResponse.json({ message: 'No reminders to send', sent: 0 })
    }

    let sentCount = 0
    const errors: string[] = []

    for (const dues of expiringDues) {
      const member = dues.member
      if (!member || !member.is_active) continue

      // Check if we already sent a reminder recently (within last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentEmail } = await supabaseAdmin
        .from('email_logs')
        .select('id')
        .eq('member_id', member.id)
        .eq('email_type', 'dues_reminder')
        .gte('created_at', sevenDaysAgo.toISOString())
        .limit(1)
        .single()

      if (recentEmail) continue

      try {
        const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?pay_dues=1`
        const dueDate = new Date(dues.period_end).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })

        const emailContent = getDuesReminderEmail(member.first_name, dueDate, paymentLink)

        const result = await sendEmail({
          to: member.email,
          subject: emailContent.subject,
          html: emailContent.html,
        })

        await supabaseAdmin.from('email_logs').insert({
          member_id: member.id,
          email_type: 'dues_reminder',
          recipient_email: member.email,
          subject: emailContent.subject,
          status: result.success ? 'sent' : 'failed',
          error_message: result.success ? null : JSON.stringify(result.error),
        })

        if (result.success) {
          sentCount++
        } else {
          errors.push(`Failed to send to ${member.email}`)
        }
      } catch (err) {
        errors.push(`Error for ${member.email}: ${(err as Error).message}`)
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} reminder emails`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 })
  }
}
