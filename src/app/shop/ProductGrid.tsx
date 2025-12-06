'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ShoppingBag } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  categories: string[]
}

export function ProductGrid({ products, categories }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showMembersOnly, setShowMembersOnly] = useState(false)

  const filteredProducts = products.filter(product => {
    if (activeCategory && product.category !== activeCategory) return false
    if (showMembersOnly && !product.is_members_only) return false
    return true
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeCategory === null
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeCategory === category
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMembersOnly}
            onChange={(e) => setShowMembersOnly(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm text-zinc-400">Members Only</span>
        </label>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No products found</h3>
          <p className="text-zinc-500">
            Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  )
}
