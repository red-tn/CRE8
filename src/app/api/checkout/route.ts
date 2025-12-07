import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Get current session to check if member
    const session = await getSession()
    const isMember = !!session?.member

    // Fetch products from database
    const productIds = items.map((item: { productId: string }) => item.productId)
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 })
    }

    // Fetch variants for products
    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)
      .eq('is_active', true)

    // Check for members-only products
    const membersOnlyProducts = products.filter(p => p.is_members_only)
    if (membersOnlyProducts.length > 0 && !isMember) {
      return NextResponse.json(
        { error: 'Some items are for members only. Please login to purchase.' },
        { status: 403 }
      )
    }

    // Validate stock for each item
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) continue

      const productVariants = variants?.filter(v => v.product_id === item.productId) || []
      const hasVariants = productVariants.length > 0

      if (hasVariants) {
        // Check variant stock
        const variant = productVariants.find(v =>
          (v.size || null) === (item.size || null) &&
          (v.color || null) === (item.color || null)
        )
        if (!variant) {
          return NextResponse.json(
            { error: `${product.name} (${[item.size, item.color].filter(Boolean).join(', ')}) is no longer available` },
            { status: 400 }
          )
        }
        if (variant.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name} (${[item.size, item.color].filter(Boolean).join(', ')}). Only ${variant.stock_quantity} available.` },
            { status: 400 }
          )
        }
      } else {
        // Check base product stock
        if (product.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name}. Only ${product.stock_quantity} available.` },
            { status: 400 }
          )
        }
      }
    }

    // Build line items for Stripe
    const lineItems = items.map((item: { productId: string; quantity: number; size?: string; color?: string }) => {
      const product = products.find(p => p.id === item.productId)
      if (!product) throw new Error(`Product ${item.productId} not found`)

      const price = isMember && product.member_price ? product.member_price : product.price

      const description = [
        item.size && `Size: ${item.size}`,
        item.color && `Color: ${item.color}`,
      ].filter(Boolean).join(', ')

      // Only include image if it's a valid absolute URL
      const hasValidImage = product.image_url &&
        (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: description || product.description || undefined,
            ...(hasValidImage && { images: [product.image_url] }),
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      }
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    console.log('APP URL:', appUrl)

    if (!appUrl) {
      return NextResponse.json({ error: 'APP_URL not configured' }, { status: 500 })
    }

    // Create Stripe checkout session with FedEx shipping options
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 899, currency: 'usd' },
            display_name: 'FedEx Ground',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1499, currency: 'usd' },
            display_name: 'FedEx Express Saver',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 2499, currency: 'usd' },
            display_name: 'FedEx 2Day',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 3999, currency: 'usd' },
            display_name: 'FedEx Overnight',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 1 },
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        member_id: session?.member?.id || '',
        items: JSON.stringify(items),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    )
  }
}
