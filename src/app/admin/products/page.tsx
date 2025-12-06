'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { ShoppingBag, Plus, Pencil, Trash2, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    memberPrice: '',
    imageUrl: '',
    category: 'apparel',
    sizes: '',
    colors: '',
    stockQuantity: '0',
    isMembersOnly: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      memberPrice: '',
      imageUrl: '',
      category: 'apparel',
      sizes: '',
      colors: '',
      stockQuantity: '0',
      isMembersOnly: false,
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      memberPrice: product.member_price?.toString() || '',
      imageUrl: product.image_url || '',
      category: product.category,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stockQuantity: product.stock_quantity.toString(),
      isMembersOnly: product.is_members_only,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        memberPrice: formData.memberPrice || null,
        imageUrl: formData.imageUrl,
        category: formData.category,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        isMembersOnly: formData.isMembersOnly,
      }

      const res = await fetch('/api/admin/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-amber-500">PRODUCTS</span>
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                  <Input
                    label="Member Price (optional)"
                    type="number"
                    step="0.01"
                    value={formData.memberPrice}
                    onChange={(e) => setFormData({ ...formData, memberPrice: e.target.value })}
                  />
                </div>
                <Input
                  label="Image URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: 'apparel', label: 'Apparel' },
                    { value: 'accessories', label: 'Accessories' },
                    { value: 'stickers', label: 'Stickers' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <Input
                  label="Sizes (comma separated)"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="S, M, L, XL, 2XL"
                />
                <Input
                  label="Colors (comma separated)"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="Black, White, Gold"
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMembersOnly}
                    onChange={(e) => setFormData({ ...formData, isMembersOnly: e.target.checked })}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm">Members Only</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSaving} className="flex-1">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>No products yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Product</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Price</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Category</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Stock</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Status</th>
                  <th className="text-right p-4 text-sm font-bold text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{product.name}</p>
                          {product.is_members_only && (
                            <Badge variant="amber" className="mt-1">Members Only</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-amber-500 font-bold">{formatCurrency(product.price)}</p>
                        {product.member_price && (
                          <p className="text-sm text-zinc-500">
                            Member: {formatCurrency(product.member_price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 capitalize">{product.category}</td>
                    <td className="p-4">{product.stock_quantity}</td>
                    <td className="p-4">
                      <Badge variant={product.is_active ? 'success' : 'danger'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
