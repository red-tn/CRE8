import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Create Stripe checkout session for membership dues
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CRE8 Truck Club Annual Membership',
              description: 'One year membership to CRE8 Truck Club',
            },
            unit_amount: 5000, // $50.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?dues=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?dues=cancelled`,
      metadata: {
        type: 'membership_dues',
        member_id: session.member.id,
      },
      customer_email: session.member.email,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Dues checkout error:', error)
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
