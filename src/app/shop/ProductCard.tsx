'use client'

import { useState } from 'react'
import { Product } from '@/types'
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

  const handleAddToCart = () => {
    if (product.is_members_only && !member) return

    addItem(product, 1, selectedSize, selectedColor)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
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
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-black text-amber-500">
            {formatCurrency(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-zinc-500 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Size selector */}
        {product.sizes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-xs font-bold transition-colors ${
                    selectedSize === size
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color selector */}
        {product.colors.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-zinc-500 mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 text-xs font-bold transition-colors ${
                    selectedColor === color
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart */}
        {product.is_members_only && !member ? (
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Login to Purchase
            </Button>
          </Link>
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
