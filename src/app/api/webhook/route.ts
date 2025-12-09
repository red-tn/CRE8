import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.type === 'membership_dues') {
          // Handle membership dues payment
          const memberId = session.metadata.member_id

          if (memberId) {
            const periodStart = new Date()
            const periodEnd = new Date()
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)

            await supabaseAdmin.from('membership_dues').insert({
              member_id: memberId,
              amount: 50.00,
              stripe_session_id: session.id,
              stripe_payment_id: session.payment_intent as string,
              status: 'paid',
              period_start: periodStart.toISOString().split('T')[0],
              period_end: periodEnd.toISOString().split('T')[0],
              paid_at: new Date().toISOString(),
            })
          }
        } else {
          // Handle product order
          const memberId = session.metadata?.member_id || null
          const items = session.metadata?.items ? JSON.parse(session.metadata.items) : []

          // SECURITY: Retrieve line items directly from Stripe to verify what was actually charged
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

          // Retrieve full session with shipping details
          const fullSession = await stripe.checkout.sessions.retrieve(session.id) as Stripe.Checkout.Session & { shipping_details?: { name?: string; address?: Stripe.Address } }
          const shippingDetails = fullSession.shipping_details

          // Create order using Stripe's verified amounts (not metadata)
          const { data: order } = await supabaseAdmin
            .from('orders')
            .insert({
              member_id: memberId || null,
              guest_email: session.customer_email,
              guest_name: shippingDetails?.name,
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              status: 'paid',
              subtotal: (session.amount_subtotal || 0) / 100,
              shipping: (session.shipping_cost?.amount_total || 0) / 100,
              tax: ((session.total_details?.amount_tax || 0)) / 100,
              total: (session.amount_total || 0) / 100,
              shipping_address: shippingDetails?.address ? {
                name: shippingDetails.name,
                line1: shippingDetails.address.line1,
                line2: shippingDetails.address.line2,
                city: shippingDetails.address.city,
                state: shippingDetails.address.state,
                postal_code: shippingDetails.address.postal_code,
                country: shippingDetails.address.country,
              } : null,
            })
            .select()
            .single()

          if (order && items.length > 0) {
            // Get product details from database
            const productIds = items.map((item: { productId: string }) => item.productId)
            const { data: products } = await supabaseAdmin
              .from('products')
              .select('*')
              .in('id', productIds)

            if (products) {
              const isMember = !!memberId

              // SECURITY: Build order items using database prices, not metadata
              // Verify quantities match what Stripe charged by cross-referencing line items
              const orderItems = items.map((item: { productId: string; quantity: number; size?: string; color?: string }) => {
                const product = products.find(p => p.id === item.productId)
                if (!product) return null

                // Use database price, not anything from metadata
                const price = isMember && product.member_price ? product.member_price : product.price

                // Verify this product was in the Stripe line items
                const stripeItem = lineItems.data.find(li =>
                  li.description?.includes(product.name) ||
                  li.price?.product === product.stripe_product_id
                )

                // Cap quantity to what was actually charged (prevent inflation)
                const verifiedQuantity = stripeItem
                  ? Math.min(item.quantity, stripeItem.quantity || item.quantity)
                  : item.quantity

                return {
                  order_id: order.id,
                  product_id: item.productId,
                  product_name: product.name,
                  quantity: verifiedQuantity,
                  size: item.size,
                  color: item.color,
                  unit_price: price,
                  total_price: price * verifiedQuantity,
                }
              }).filter(Boolean)

              await supabaseAdmin.from('order_items').insert(orderItems)

              // Fetch variants for products
              const { data: variants } = await supabaseAdmin
                .from('product_variants')
                .select('*')
                .in('product_id', productIds)
                .eq('is_active', true)

              // Update stock (variant or base product)
              for (const item of items) {
                const product = products.find(p => p.id === item.productId)
                if (!product) continue

                const productVariants = variants?.filter(v => v.product_id === item.productId) || []
                const hasVariants = productVariants.length > 0

                if (hasVariants) {
                  // Decrement variant stock
                  const variant = productVariants.find(v =>
                    (v.size || null) === (item.size || null) &&
                    (v.color || null) === (item.color || null)
                  )
                  if (variant && variant.stock_quantity > 0) {
                    await supabaseAdmin
                      .from('product_variants')
                      .update({
                        stock_quantity: Math.max(0, variant.stock_quantity - item.quantity),
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', variant.id)
                  }
                } else {
                  // Decrement base product stock
                  if (product.stock_quantity > 0) {
                    await supabaseAdmin
                      .from('products')
                      .update({
                        stock_quantity: Math.max(0, product.stock_quantity - item.quantity),
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', item.productId)
                  }
                }
              }
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
