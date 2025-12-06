import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()

    const { data: dues } = await supabaseAdmin
      .from('membership_dues')
      .select('*')
      .eq('member_id', session.member.id)
      .eq('status', 'paid')
      .order('period_end', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ dues })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching dues:', error)
    return NextResponse.json({ dues: null })
  }
}
