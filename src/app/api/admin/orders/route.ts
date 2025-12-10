import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('orders')
      .select('*, member:members(first_name, last_name, email), order_items(*)', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, status, tracking_number, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Get current order to check payment intent
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (status) updates.status = status
    if (tracking_number !== undefined) updates.tracking_number = tracking_number
    if (notes !== undefined) updates.notes = notes

    // Handle refund if status is changing to refunded
    if (status === 'refunded' && currentOrder.status !== 'refunded') {
      if (currentOrder.stripe_payment_intent_id) {
        try {
          await stripe.refunds.create({
            payment_intent: currentOrder.stripe_payment_intent_id,
          })
        } catch (stripeError) {
          console.error('Stripe refund error:', stripeError)
          return NextResponse.json({ error: 'Failed to process refund in Stripe' }, { status: 500 })
        }
      }
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
