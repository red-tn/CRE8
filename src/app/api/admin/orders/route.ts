import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { sendEmail, getShippingNotificationEmail } from '@/lib/sendgrid'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const memberId = searchParams.get('member_id') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = memberId ? 100 : 20 // Get more results when filtering by member
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('orders')
      .select('*, member:members(first_name, last_name, email), order_items(*)', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    if (memberId) {
      query = query.eq('member_id', memberId)
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
    const { id, status, tracking_number, notes, send_shipping_email } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Get current order with items and member info
    const { data: currentOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*), member:members(first_name, last_name, email)')
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

    // Send shipping notification email if requested
    if (send_shipping_email && tracking_number) {
      try {
        const customerEmail = (currentOrder.member as { email?: string } | null)?.email || currentOrder.guest_email
        const customerName = (currentOrder.member as { first_name?: string; last_name?: string } | null)
          ? `${(currentOrder.member as { first_name: string }).first_name} ${(currentOrder.member as { last_name: string }).last_name}`
          : currentOrder.guest_name || 'Customer'

        if (customerEmail) {
          const trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${tracking_number}`
          const items = (currentOrder.order_items || []).map((item: { product_name: string; quantity: number; size?: string; color?: string; unit_price: number; total_price: number }) => ({
            product_name: item.product_name,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }))

          const emailContent = getShippingNotificationEmail(
            currentOrder.id,
            customerName,
            tracking_number,
            trackingUrl,
            items,
            currentOrder.shipping_address as { name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } | null
          )

          await sendEmail({
            to: customerEmail,
            subject: emailContent.subject,
            html: emailContent.html,
          })
          console.log(`Shipping notification sent to ${customerEmail}`)
        }
      } catch (emailError) {
        console.error('Failed to send shipping notification:', emailError)
        // Don't fail the request if email fails
      }
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
