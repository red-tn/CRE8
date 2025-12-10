import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!products) {
      return NextResponse.json({ products: [] })
    }

    // Fetch all variants for these products
    const productIds = products.map(p => p.id)
    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .in('product_id', productIds)
      .eq('is_active', true)

    // Calculate total stock from variants for each product
    const productsWithStock = products.map(product => {
      const productVariants = variants?.filter(v => v.product_id === product.id) || []
      const hasVariants = productVariants.length > 0

      // If has variants, calculate total from variants; otherwise use base stock
      const calculatedStock = hasVariants
        ? productVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
        : product.stock_quantity

      return {
        ...product,
        stock_quantity: calculatedStock,
        has_variants: hasVariants,
        variant_count: productVariants.length,
      }
    })

    return NextResponse.json({ products: productsWithStock })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const {
      name,
      description,
      price,
      memberPrice,
      imageUrl,
      images,
      category,
      sizes,
      colors,
      stockQuantity,
      isMembersOnly,
    } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price required' }, { status: 400 })
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        member_price: memberPrice ? parseFloat(memberPrice) : null,
        image_url: imageUrl || null,
        images: images || [],
        category: category || 'general',
        sizes: sizes || [],
        colors: colors || [],
        stock_quantity: stockQuantity || 0,
        is_members_only: isMembersOnly || false,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Check if product has variants
    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('stock_quantity')
      .eq('product_id', id)
      .eq('is_active', true)

    const hasVariants = variants && variants.length > 0

    // Convert field names
    const dbUpdates: Record<string, unknown> = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.price !== undefined) dbUpdates.price = parseFloat(updates.price)
    if (updates.memberPrice !== undefined) dbUpdates.member_price = updates.memberPrice ? parseFloat(updates.memberPrice) : null
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
    if (updates.images !== undefined) dbUpdates.images = updates.images
    if (updates.category !== undefined) dbUpdates.category = updates.category
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors
    if (updates.isMembersOnly !== undefined) dbUpdates.is_members_only = updates.isMembersOnly
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    // Only update base stock if there are no variants
    if (updates.stockQuantity !== undefined && !hasVariants) {
      dbUpdates.stock_quantity = updates.stockQuantity
    }

    // If has variants, calculate and store total from variants
    if (hasVariants) {
      const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
      dbUpdates.stock_quantity = totalStock
    }

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    if (permanent) {
      // Permanently delete - first delete variants, then product
      await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('product_id', id)

      await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id)
    } else {
      // Soft delete - just deactivate
      await supabaseAdmin
        .from('products')
        .update({ is_active: false })
        .eq('id', id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
