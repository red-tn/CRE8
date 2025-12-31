'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Calendar, ShoppingBag, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DuesPopupProps {
  onPayDues: () => void
  isLoading?: boolean
}

export function DuesPopup({ onPayDues, isLoading }: DuesPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Small delay to allow page to load first
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white text-black p-6 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-black">ACTIVATE YOUR MEMBERSHIP</h2>
          <p className="text-zinc-600 mt-1">$50/year unlocks everything</p>
        </div>

        {/* Benefits */}
        <div className="p-6">
          <h3 className="text-white font-bold mb-4 text-center">PAID MEMBER BENEFITS:</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-zinc-800 border border-zinc-700">
              <Calendar className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Exclusive Events Access</p>
                <p className="text-zinc-400 text-sm">Member-only meets, cruises, and gatherings</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-zinc-800 border border-zinc-700">
              <ShoppingBag className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Member Merch Pricing</p>
                <p className="text-zinc-400 text-sm">Discounted prices on all CRE8 gear</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-zinc-800 border border-zinc-700">
              <Truck className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Fleet Gallery Feature</p>
                <p className="text-zinc-400 text-sm">Your truck showcased on our website</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-zinc-800 border border-zinc-700">
              <Users className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Priority Registration</p>
                <p className="text-zinc-400 text-sm">First dibs on popular events</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={onPayDues}
              isLoading={isLoading}
              className="w-full text-lg py-4"
              size="lg"
            >
              PAY DUES - $50/YEAR
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full text-zinc-500 hover:text-zinc-300 text-sm py-2 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
