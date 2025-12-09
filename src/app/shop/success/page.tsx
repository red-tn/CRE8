'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    // Clear cart after successful purchase
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-black mb-4">
          ORDER <span className="text-white">CONFIRMED</span>
        </h1>

        <p className="text-zinc-400 mb-8">
          Thanks for your order! We&apos;ll get your gear shipped out ASAP.
          Check your email for confirmation and tracking info.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
          <Package className="w-8 h-8 text-white mx-auto mb-4" />
          <p className="text-sm text-zinc-500">
            Order confirmation has been sent to your email.
            You&apos;ll receive tracking information once your order ships.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}