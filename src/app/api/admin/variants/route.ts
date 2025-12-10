import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

// Helper to recalculate product stock from variants
async function recalculateProductStock(productId: string) {
  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('stock_quantity')
    .eq('product_id', productId)
    .eq('is_active', true)

  const totalStock = variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0

  await supabaseAdmin
    .from('products')
    .update({ stock_quantity: totalStock })
    .eq('id', productId)
}

// GET - Fetch variants for a product
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const productId = request.nextUrl.searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const { data: variants, error } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('size', { ascending: true })
      .order('color', { ascending: true })

    if (error) throw error

    return NextResponse.json({ variants })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching variants:', error)
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 })
  }
}

// POST - Create a new variant
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { productId, size, color, stockQuantity, priceAdjustment, sku, imageUrl } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const { data: variant, error } = await supabaseAdmin
      .from('product_variants')
      .insert({
        product_id: productId,
        size: size || null,
        color: color || null,
        stock_quantity: stockQuantity || 0,
        price_adjustment: priceAdjustment || 0,
        sku: sku || null,
        image_url: imageUrl || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This size/color combination already exists' }, { status: 400 })
      }
      throw error
    }

    // Recalculate product stock from variants
    await recalculateProductStock(productId)

    return NextResponse.json({ variant })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating variant:', error)
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 })
  }
}

// PUT - Update a variant
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, stockQuantity, priceAdjustment, sku, isActive, imageUrl } = body

    if (!id) {
      return NextResponse.json({ error: 'Variant ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (stockQuantity !== undefined) updateData.stock_quantity = stockQuantity
    if (priceAdjustment !== undefined) updateData.price_adjustment = priceAdjustment
    if (sku !== undefined) updateData.sku = sku
    if (isActive !== undefined) updateData.is_active = isActive
    if (imageUrl !== undefined) updateData.image_url = imageUrl

    const { data: variant, error } = await supabaseAdmin
      .from('product_variants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Recalculate product stock from variants
    if (variant?.product_id) {
      await recalculateProductStock(variant.product_id)
    }

    return NextResponse.json({ variant })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating variant:', error)
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 })
  }
}

// DELETE - Delete a variant
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Variant ID required' }, { status: 400 })
    }

    // Get product_id before deleting
    const { data: variant } = await supabaseAdmin
      .from('product_variants')
      .select('product_id')
      .eq('id', id)
      .single()

    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Recalculate product stock from remaining variants
    if (variant?.product_id) {
      await recalculateProductStock(variant.product_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting variant:', error)
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 })
  }
}
