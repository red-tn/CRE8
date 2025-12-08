import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/types'
import { ProductGrid } from './ProductGrid'

export const metadata = {
  title: 'Shop | CRE8 Truck Club',
  description: 'Shop CRE8 Truck Club merchandise - apparel, accessories, and exclusive member-only gear.',
}

// Revalidate every 60 seconds to pick up product changes
export const revalidate = 60

async function getProducts() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (!products) return []

  // Fetch variants for all products
  const productIds = products.map(p => p.id)
  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('*')
    .in('product_id', productIds)
    .eq('is_active', true)

  // Attach variants to products
  return products.map(product => ({
    ...product,
    variants: variants?.filter(v => v.product_id === product.id) || []
  })) as Product[]
}

export default async function ShopPage() {
  const products = await getProducts()

  const categories = [...new Set(products.map(p => p.category))]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-amber-500">SHOP</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Rep the crown. Members get exclusive pricing on all gear.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 bg-black min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<div className="text-center text-zinc-500 py-12">Loading products...</div>}>
            <ProductGrid products={products} categories={categories} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
