'use client'

import { useState, useMemo } from 'react'
import { Product, ProductVariant } from '@/types'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShoppingCart, Lock, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes.length > 0 ? product.sizes[0] : undefined
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors.length > 0 ? product.colors[0] : undefined
  )
  const [isAdded, setIsAdded] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const member = useAuthStore((state) => state.member)

  const displayPrice = member && product.member_price ? product.member_price : product.price
  const hasDiscount = member && product.member_price && product.member_price < product.price

  // Check variant stock - use variant if exists, otherwise fall back to base stock
  const hasVariants = product.variants && product.variants.length > 0

  const getVariantStock = (size?: string, color?: string): number => {
    if (!hasVariants) {
      return product.stock_quantity
    }
    // Try to find matching variant
    const variant = product.variants?.find(v =>
      (v.size || null) === (size || null) &&
      (v.color || null) === (color || null)
    )
    // If variant exists for this combo, use its stock; otherwise use base stock
    if (variant) {
      return variant.stock_quantity
    }
    // No variant for this combo - use base product stock
    return product.stock_quantity
  }

  const currentStock = useMemo(() => {
    return getVariantStock(selectedSize, selectedColor)
  }, [selectedSize, selectedColor, product.variants])

  const isSoldOut = currentStock <= 0

  // Check if a specific size is sold out (for all colors or if no colors)
  const isSizeSoldOut = (size: string): boolean => {
    if (product.colors.length === 0) {
      return getVariantStock(size, undefined) <= 0
    }
    // Check if any color has stock for this size
    return !product.colors.some(color => getVariantStock(size, color) > 0)
  }

  // Check if a specific color is sold out (for current size)
  const isColorSoldOut = (color: string): boolean => {
    return getVariantStock(selectedSize, color) <= 0
  }

  const handleAddToCart = () => {
    if (product.is_members_only && !member) return
    if (isSoldOut) return

    addItem(product, 1, selectedSize, selectedColor)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-white/50 transition-all duration-300 group h-full flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden flex-shrink-0">
        {product.images?.[0] || product.image_url ? (
          <img
            src={product.images?.[0] || product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-zinc-700" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_members_only && (
            <Badge variant="amber" className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Members Only
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="success">Member Price</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Fixed height header area */}
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-zinc-500 text-sm line-clamp-2 min-h-[2.5rem]">{product.description}</p>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <span className={`text-xs font-bold ${currentStock > 5 ? 'text-green-500' : currentStock > 0 ? 'text-white' : 'text-red-500'}`}>
            {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Size selector - fixed height area (only for apparel/hats) */}
        <div className="mb-4 min-h-[3.5rem]">
          {product.sizes.length > 0 && (
            <>
              <p className="text-xs text-zinc-500 mb-2">
                {product.category === 'hats' ? 'Style/Size' : 'Size'}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => {
                  const soldOut = isSizeSoldOut(size)
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={soldOut}
                      className={`px-3 py-1 text-xs font-bold transition-colors relative ${
                        selectedSize === size
                          ? 'bg-white text-black'
                          : soldOut
                          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Color selector - fixed height area */}
        <div className="mb-4 min-h-[3.5rem]">
          {product.colors.length > 0 && (
            <>
              <p className="text-xs text-zinc-500 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => {
                  const soldOut = isColorSoldOut(color)
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={soldOut}
                      className={`px-3 py-1 text-xs font-bold transition-colors ${
                        selectedColor === color
                          ? 'bg-white text-black'
                          : soldOut
                          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Add to Cart */}
        {product.is_members_only && !member ? (
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Login to Purchase
            </Button>
          </Link>
        ) : isSoldOut ? (
          <Button disabled className="w-full opacity-50 cursor-not-allowed">
            Sold Out
          </Button>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="w-full"
            variant={isAdded ? 'secondary' : 'primary'}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
