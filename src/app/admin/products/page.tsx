'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Plus, Pencil, Trash2, X, Upload, Package } from 'lucide-react'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Product, ProductVariant } from '@/types'

// Constants for sizes and colors by category
const APPAREL_SIZES = ['S', 'M', 'L', 'XL', '2XL']
const HAT_STYLES = ['Snapback', 'Fitted']
const FITTED_SIZES = ['7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4', '7 7/8', '8']
const PRIMARY_COLORS = ['Black', 'White', 'Gray', 'Navy', 'Red', 'Gold', 'Green', 'Blue', 'Orange', 'Purple', 'Pink', 'Brown']

// Get available sizes based on category
const getSizesForCategory = (category: string): string[] => {
  switch (category) {
    case 'apparel':
      return APPAREL_SIZES
    case 'hats':
      return [...HAT_STYLES, ...FITTED_SIZES]
    case 'accessories':
    case 'stickers':
    default:
      return []
  }
}

// Check if category needs sizes
const categoryNeedsSizes = (category: string): boolean => {
  return category === 'apparel' || category === 'hats'
}

// Generate SKU from product name
const generateSKU = (name: string, suffix: string = '01'): string => {
  const words = name.trim().split(/\s+/)
  let abbrev = ''
  if (words.length === 1) {
    abbrev = words[0].substring(0, 4).toUpperCase()
  } else {
    abbrev = words.map(w => w[0]).join('').toUpperCase().substring(0, 4)
  }
  return `${abbrev}-CRE8-${suffix}`
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Variant management state
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [variantFormData, setVariantFormData] = useState({
    size: '',
    color: '',
    stockQuantity: '0',
    priceAdjustment: '0',
    sku: '',
  })
  const [isSavingVariant, setIsSavingVariant] = useState(false)
  const [customColor, setCustomColor] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    memberPrice: '',
    imageUrl: '',
    images: [] as string[],
    category: 'apparel',
    sizes: [] as string[],
    colors: [] as string[],
    stockQuantity: '0',
    isMembersOnly: false,
    sku: '',
  })
  const [customProductColor, setCustomProductColor] = useState('')

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
      images: [],
      category: 'apparel',
      sizes: [],
      colors: [],
      stockQuantity: '0',
      isMembersOnly: false,
      sku: '',
    })
    setCustomProductColor('')
    setEditingProduct(null)
    setShowForm(false)
    setVariants([])
    setShowVariantForm(false)
    resetVariantForm()
  }

  const startEdit = async (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      memberPrice: product.member_price?.toString() || '',
      imageUrl: product.image_url || '',
      images: product.images || [],
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      stockQuantity: product.stock_quantity.toString(),
      isMembersOnly: product.is_members_only,
      sku: '',
    })
    setCustomProductColor('')
    setShowForm(true)

    // Fetch variants for this product
    setIsLoadingVariants(true)
    try {
      const res = await fetch(`/api/admin/variants?productId=${product.id}`)
      if (res.ok) {
        const data = await res.json()
        setVariants(data.variants || [])
      }
    } catch (error) {
      console.error('Error fetching variants:', error)
    } finally {
      setIsLoadingVariants(false)
    }
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
        imageUrl: formData.imageUrl || formData.images[0] || null,
        images: formData.images,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
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
    if (!confirm('Are you sure you want to deactivate this product?')) return

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

  const permanentDeleteProduct = async (id: string) => {
    if (!confirm('PERMANENTLY DELETE this product? This cannot be undone!')) return
    if (!confirm('Are you absolutely sure? All variants and data will be lost forever.')) return

    try {
      const res = await fetch(`/api/admin/products?id=${id}&permanent=true`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error permanently deleting product:', error)
    }
  }

  // Variant management functions
  const resetVariantForm = () => {
    setVariantFormData({
      size: '',
      color: '',
      stockQuantity: '0',
      priceAdjustment: '0',
      sku: '',
    })
  }

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsSavingVariant(true)

    try {
      const res = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingProduct.id,
          size: variantFormData.size || null,
          color: variantFormData.color || null,
          stockQuantity: parseInt(variantFormData.stockQuantity) || 0,
          priceAdjustment: parseFloat(variantFormData.priceAdjustment) || 0,
          sku: variantFormData.sku || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setVariants([...variants, data.variant])
        setShowVariantForm(false)
        resetVariantForm()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create variant')
      }
    } catch (error) {
      console.error('Error creating variant:', error)
      alert('Failed to create variant')
    } finally {
      setIsSavingVariant(false)
    }
  }

  const updateVariantStock = async (variantId: string, newStock: number) => {
    try {
      const res = await fetch('/api/admin/variants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: variantId,
          stockQuantity: newStock,
        }),
      })

      if (res.ok) {
        setVariants(variants.map(v =>
          v.id === variantId ? { ...v, stock_quantity: newStock } : v
        ))
      }
    } catch (error) {
      console.error('Error updating variant:', error)
    }
  }

  const deleteVariant = async (variantId: string) => {
    if (!confirm('Delete this variant?')) return

    try {
      const res = await fetch(`/api/admin/variants?id=${variantId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setVariants(variants.filter(v => v.id !== variantId))
      }
    } catch (error) {
      console.error('Error deleting variant:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'products')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        const { url } = await res.json()
        setFormData({
          ...formData,
          images: [...formData.images, url],
          imageUrl: formData.imageUrl || url
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-white">PRODUCTS</span>
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
                  onChange={(e) => {
                    const newName = e.target.value
                    const newSku = newName ? generateSKU(newName) : ''
                    setFormData({ ...formData, name: newName, sku: newSku })
                  }}
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {/* SKU Display */}
                {formData.sku && (
                  <div className="bg-zinc-800 px-3 py-2 border border-zinc-700">
                    <span className="text-xs text-zinc-500">Auto-generated SKU: </span>
                    <span className="text-white font-mono">{formData.sku}</span>
                  </div>
                )}
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
                {/* Image Gallery Upload */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Product Images
                  </label>

                  {/* Image Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square bg-zinc-800 border border-zinc-700 overflow-hidden group">
                        <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...formData.images]
                                const temp = newImages[0]
                                newImages[0] = newImages[index]
                                newImages[index] = temp
                                setFormData({ ...formData, images: newImages, imageUrl: newImages[0] })
                              }}
                              className="p-1 bg-white text-black text-xs"
                              title="Set as primary"
                            >
                              ★
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index)
                              setFormData({
                                ...formData,
                                images: newImages,
                                imageUrl: newImages[0] || ''
                              })
                            }}
                            className="p-1 bg-red-500 text-white text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-white text-black text-xs px-1">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Upload Button */}
                    <label className={`aspect-square bg-zinc-800 border border-dashed border-zinc-600 hover:border-white flex flex-col items-center justify-center cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <span className="text-xs text-zinc-500">Uploading...</span>
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-zinc-500" />
                          <span className="text-xs text-zinc-500 mt-1">Add</span>
                        </>
                      )}
                    </label>
                  </div>

                  <p className="text-xs text-zinc-600">
                    First image is the primary. Click ★ to set as primary. Max 5MB each.
                  </p>
                </div>
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => {
                    const newCategory = e.target.value
                    // Clear sizes when category changes since size options differ
                    setFormData({ ...formData, category: newCategory, sizes: [] })
                  }}
                  options={[
                    { value: 'apparel', label: 'Apparel' },
                    { value: 'hats', label: 'Hats' },
                    { value: 'accessories', label: 'Accessories' },
                    { value: 'stickers', label: 'Stickers' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                {/* Size Checkboxes - only for apparel and hats */}
                {categoryNeedsSizes(formData.category) && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      {formData.category === 'hats' ? 'Hat Styles/Sizes' : 'Sizes'}
                    </label>
                    {formData.category === 'hats' && (
                      <p className="text-xs text-zinc-500 mb-2">Select Snapback for adjustable, or Fitted sizes</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {getSizesForCategory(formData.category).map((size) => (
                        <label key={size} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.sizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, sizes: [...formData.sizes, size] })
                              } else {
                                setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) })
                              }
                            }}
                            className="w-4 h-4 accent-white"
                          />
                          <span className="text-sm">{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Multi-Select */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Colors
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.colors.map((color) => (
                      <span
                        key={color}
                        className="bg-zinc-700 text-white px-2 py-1 text-sm flex items-center gap-1"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) })}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:border-white"
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !formData.colors.includes(e.target.value)) {
                          setFormData({ ...formData, colors: [...formData.colors, e.target.value] })
                        }
                      }}
                    >
                      <option value="">Add color...</option>
                      {PRIMARY_COLORS.filter(c => !formData.colors.includes(c)).map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={customProductColor}
                        onChange={(e) => setCustomProductColor(e.target.value)}
                        placeholder="Custom"
                        className="w-24 bg-zinc-800 border border-zinc-700 px-2 py-2 text-sm focus:outline-none focus:border-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (customProductColor.trim() && !formData.colors.includes(customProductColor.trim())) {
                            setFormData({ ...formData, colors: [...formData.colors, customProductColor.trim()] })
                            setCustomProductColor('')
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Input
                  label="Base Stock Quantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  disabled={variants.length > 0}
                />
                {variants.length > 0 && (
                  <p className="text-xs text-zinc-500 -mt-2">Stock is managed per variant below</p>
                )}

                {/* Variant Inventory Section - Only show when editing */}
                {editingProduct && (
                  <div className="border border-zinc-700 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white">Size/Color Inventory</h3>
                        <p className="text-xs text-zinc-500">Track stock per size and color combination</p>
                      </div>
                      {!showVariantForm && (
                        <Button
                          type="button"
                          onClick={() => {
                            // Auto-generate variant SKU based on product name
                            const baseSku = formData.sku || generateSKU(formData.name)
                            const variantNum = String(variants.length + 1).padStart(2, '0')
                            setVariantFormData({
                              ...variantFormData,
                              sku: `${baseSku.replace(/-\d+$/, '')}-${variantNum}`,
                              stockQuantity: '10',
                            })
                            setShowVariantForm(true)
                          }}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>

                    {/* Add Variant Form */}
                    {showVariantForm && (
                      <div className="bg-zinc-800 p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Size Dropdown - only show for categories that need sizes */}
                          {categoryNeedsSizes(formData.category) && (
                            <div>
                              <label className="block text-sm font-medium text-zinc-400 mb-1">
                                {formData.category === 'hats' ? 'Style/Size' : 'Size'}
                              </label>
                              <select
                                className="w-full bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:border-white"
                                value={variantFormData.size}
                                onChange={(e) => setVariantFormData({ ...variantFormData, size: e.target.value })}
                              >
                                <option value="">Select...</option>
                                {getSizesForCategory(formData.category).map((size) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {/* Color Dropdown */}
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Color</label>
                            <div className="flex gap-1">
                              <select
                                className="flex-1 bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:border-white"
                                value={variantFormData.color}
                                onChange={(e) => setVariantFormData({ ...variantFormData, color: e.target.value })}
                              >
                                <option value="">Select color...</option>
                                {PRIMARY_COLORS.map((color) => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                                {customColor && !PRIMARY_COLORS.includes(customColor) && (
                                  <option value={customColor}>{customColor}</option>
                                )}
                              </select>
                              <input
                                type="text"
                                value={customColor}
                                onChange={(e) => {
                                  setCustomColor(e.target.value)
                                  setVariantFormData({ ...variantFormData, color: e.target.value })
                                }}
                                placeholder="Custom"
                                className="w-20 bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm focus:outline-none focus:border-white"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            label="Stock"
                            type="number"
                            value={variantFormData.stockQuantity}
                            onChange={(e) => setVariantFormData({ ...variantFormData, stockQuantity: e.target.value })}
                          />
                          <Input
                            label="Price +/-"
                            type="number"
                            step="0.01"
                            value={variantFormData.priceAdjustment}
                            onChange={(e) => setVariantFormData({ ...variantFormData, priceAdjustment: e.target.value })}
                            placeholder="0"
                          />
                          <Input
                            label="SKU"
                            value={variantFormData.sku}
                            onChange={(e) => setVariantFormData({ ...variantFormData, sku: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setShowVariantForm(false); resetVariantForm(); setCustomColor(''); }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            isLoading={isSavingVariant}
                            onClick={handleVariantSubmit}
                          >
                            Add Variant
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Variants List */}
                    {isLoadingVariants ? (
                      <p className="text-sm text-zinc-500">Loading variants...</p>
                    ) : variants.length === 0 ? (
                      <p className="text-sm text-zinc-500">No variants yet. Base stock quantity will be used.</p>
                    ) : (
                      <div className="space-y-1">
                        {variants.map((variant) => (
                          <div key={variant.id} className="flex items-center gap-2 bg-zinc-800 p-2 text-sm">
                            <span className="flex-1">
                              {variant.size || '-'} / {variant.color || '-'}
                            </span>
                            <input
                              type="number"
                              value={variant.stock_quantity}
                              onChange={(e) => updateVariantStock(variant.id, parseInt(e.target.value) || 0)}
                              className="w-16 bg-zinc-700 border border-zinc-600 px-2 py-1 text-center text-sm"
                              min="0"
                            />
                            {variant.price_adjustment !== 0 && (
                              <span className={`text-xs ${variant.price_adjustment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {variant.price_adjustment > 0 ? '+' : ''}{formatCurrency(variant.price_adjustment)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteVariant(variant.id)}
                              className="text-red-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs text-zinc-500 pt-1">
                          Total: {variants.reduce((sum, v) => sum + v.stock_quantity, 0)} units
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMembersOnly}
                    onChange={(e) => setFormData({ ...formData, isMembersOnly: e.target.checked })}
                    className="w-4 h-4 accent-white"
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
              <Package className="w-12 h-12 mx-auto mb-4 text-white/50" />
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
                        <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center relative">
                          {product.image_url || (product.images && product.images.length > 0) ? (
                            <img src={product.images?.[0] || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Image src="/logo.png" alt="CRE8" width={40} height={20} className="h-6 w-auto opacity-50" />
                          )}
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-zinc-700 text-xs px-1 rounded">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{product.name}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {product.is_members_only && (
                              <Badge variant="amber">Members Only</Badge>
                            )}
                            {product.sizes?.length > 0 && (
                              <span className="text-xs text-zinc-500">{product.sizes.length} sizes</span>
                            )}
                            {product.colors?.length > 0 && (
                              <span className="text-xs text-zinc-500">{product.colors.length} colors</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-bold">{formatCurrency(product.price)}</p>
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
                        {product.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => permanentDeleteProduct(product.id)}
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
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
