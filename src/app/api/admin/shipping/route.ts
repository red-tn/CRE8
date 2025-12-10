import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { createShipment, getServiceTypes } from '@/lib/fedex'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { orderId, weight, serviceType } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Get order with shipping address
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.shipping_address) {
      return NextResponse.json({ error: 'Order has no shipping address' }, { status: 400 })
    }

    const addr = order.shipping_address as {
      name?: string
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }

    // Create shipment with FedEx
    const shipment = await createShipment({
      recipientName: addr.name || order.guest_name || 'Customer',
      recipientStreet: addr.line1 || '',
      recipientStreet2: addr.line2,
      recipientCity: addr.city || '',
      recipientState: addr.state || '',
      recipientZip: addr.postal_code || '',
      recipientCountry: addr.country || 'US',
      weight: weight || 1,
      serviceType: serviceType || 'FEDEX_GROUND',
      reference: `Order #${order.id.slice(0, 8)}`,
    })

    // Update order with tracking number and mark as shipped
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: shipment.trackingNumber,
        status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      // Don't fail - we still have the label
    }

    return NextResponse.json({
      success: true,
      trackingNumber: shipment.trackingNumber,
      labelBase64: shipment.labelBase64,
    })
  } catch (error) {
    console.error('Shipping label error:', error)

    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create shipping label' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await requireAdmin()

    return NextResponse.json({
      serviceTypes: getServiceTypes(),
      shipFrom: {
        company: process.env.SHIP_FROM_COMPANY,
        street: process.env.SHIP_FROM_STREET,
        city: process.env.SHIP_FROM_CITY,
        state: process.env.SHIP_FROM_STATE,
        zip: process.env.SHIP_FROM_ZIP,
      },
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to get shipping info' }, { status: 500 })
  }
}
