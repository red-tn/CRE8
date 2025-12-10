import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    // Get total members
    const { count: totalMembers } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true })

    // Get active members (with paid dues)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { count: activeMembers } = await supabaseAdmin
      .from('membership_dues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('period_end', new Date().toISOString().split('T')[0])

    // Get total revenue
    const { data: duesRevenue } = await supabaseAdmin
      .from('membership_dues')
      .select('amount')
      .eq('status', 'paid')

    const { data: ordersRevenue } = await supabaseAdmin
      .from('orders')
      .select('total')
      .eq('status', 'paid')

    const totalRevenue =
      (duesRevenue || []).reduce((sum, d) => sum + Number(d.amount), 0) +
      (ordersRevenue || []).reduce((sum, o) => sum + Number(o.total), 0)

    // Get pending orders
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['paid', 'pending'])

    // Get upcoming events
    const { count: upcomingEvents } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])

    // Get memberships expiring in 30 days with member details
    const { data: expiringDues, count: expiringSoon } = await supabaseAdmin
      .from('membership_dues')
      .select('*, member:members(id, first_name, last_name, email)', { count: 'exact' })
      .eq('status', 'paid')
      .lte('period_end', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('period_end', new Date().toISOString().split('T')[0])
      .order('period_end', { ascending: true })

    // Format expiring members for frontend
    const expiringMembers = (expiringDues || []).map(d => ({
      id: d.member?.id,
      name: `${d.member?.first_name} ${d.member?.last_name}`,
      email: d.member?.email,
      expiresAt: d.period_end,
    }))

    return NextResponse.json({
      totalMembers: totalMembers || 0,
      activeMembers: activeMembers || 0,
      totalRevenue,
      pendingOrders: pendingOrders || 0,
      upcomingEvents: upcomingEvents || 0,
      expiringSoon: expiringSoon || 0,
      expiringMembers,
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
