'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const member = useAuthStore((state) => state.member)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCheckout = async () => {
    if (items.length === 0) return

    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  const subtotal = getTotal(!!member)

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">
            YOUR <span className="text-white">CART</span>
          </h1>
          <Link href="/shop" className="text-white hover:text-zinc-200 flex items-center gap-2 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const price = member && item.product.member_price
                  ? item.product.member_price
                  : item.product.price

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                    className="bg-zinc-900 border border-zinc-800 p-4 flex gap-4"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-zinc-800 flex-shrink-0">
                      {item.product.images?.[0] || item.product.image_url ? (
                        <img
                          src={item.product.images?.[0] || item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{item.product.name}</h3>
                      <div className="flex gap-2 mt-1 text-sm text-zinc-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <div className="mt-2 text-white font-bold">
                        {formatCurrency(price)}
                        {member && item.product.member_price && (
                          <span className="text-zinc-500 text-xs ml-2">Member Price</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.product.id, item.size, item.color)}
                        className="text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)}
                          className="w-8 h-8 bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <button
                onClick={clearCart}
                className="text-sm text-zinc-500 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 border border-zinc-800 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span className="text-zinc-500">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax</span>
                    <span className="text-zinc-500">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 flex justify-between text-lg font-bold">
                    <span>Subtotal</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                {member && (
                  <p className="text-green-500 text-sm mb-4">
                    Member pricing applied!
                  </p>
                )}

                <p className="text-zinc-500 text-sm mb-4">
                  Ships via FedEx. Rates calculated at checkout.
                </p>

                <Button
                  onClick={handleCheckout}
                  isLoading={isCheckingOut}
                  className="w-full"
                  size="lg"
                >
                  Checkout
                </Button>

                <p className="text-zinc-600 text-xs text-center mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-zinc-500 mb-8">Add some gear to get started.</p>
            <Link href="/shop">
              <Button size="lg">Shop Now</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
