'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Package, Eye, X, Truck, Printer, MapPin, Copy } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Order } from '@/types'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isSavingTracking, setIsSavingTracking] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/orders?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      })

      if (res.ok) {
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
        }
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const saveTrackingNumber = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return
    setIsSavingTracking(true)

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          tracking_number: trackingNumber.trim(),
          status: 'shipped' // Auto-update status to shipped when tracking is added
        }),
      })

      if (res.ok) {
        fetchOrders()
        setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber.trim(), status: 'shipped' })
        alert('Tracking number saved!')
      }
    } catch (error) {
      console.error('Error saving tracking:', error)
      alert('Failed to save tracking number')
    } finally {
      setIsSavingTracking(false)
    }
  }

  const copyAddressToClipboard = () => {
    if (!selectedOrder?.shipping_address) return
    const addr = selectedOrder.shipping_address
    const text = `${addr.name}
${addr.line1}${addr.line2 ? '\n' + addr.line2 : ''}
${addr.city}, ${addr.state} ${addr.postal_code}
${addr.country || 'USA'}`
    navigator.clipboard.writeText(text)
    alert('Address copied to clipboard!')
  }

  const openFedExShipManager = () => {
    // FedEx Ship Manager URL - users will need to be logged in
    window.open('https://www.fedex.com/shipping/shipEntryAction.do', '_blank')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'shipped':
        return <Badge variant="amber">Shipped</Badge>
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>
      case 'refunded':
        return <Badge variant="danger">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-white">ORDERS</span>
        </h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex gap-2">
            {['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status || 'All'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Order ID</p>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Date</p>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Total</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(selectedOrder.total)}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-bold mb-2">Customer</h3>
                  <p>{(selectedOrder as Order & { member?: { first_name: string; last_name: string; email: string } }).member
                    ? `${(selectedOrder as Order & { member: { first_name: string; last_name: string; email: string } }).member.first_name} ${(selectedOrder as Order & { member: { first_name: string; last_name: string; email: string } }).member.last_name}`
                    : selectedOrder.guest_name}</p>
                  <p className="text-zinc-500">
                    {(selectedOrder as Order & { member?: { email: string } }).member?.email || selectedOrder.guest_email}
                  </p>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div className="bg-zinc-800 p-4 border border-zinc-700">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Shipping Address
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={copyAddressToClipboard} title="Copy address">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={openFedExShipManager} title="Open FedEx Ship Manager">
                          <Printer className="w-4 h-4 mr-1" />
                          FedEx
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-white">{selectedOrder.shipping_address.name}</p>
                      <p>{selectedOrder.shipping_address.line1}</p>
                      {selectedOrder.shipping_address.line2 && (
                        <p>{selectedOrder.shipping_address.line2}</p>
                      )}
                      <p>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{' '}
                        {selectedOrder.shipping_address.postal_code}
                      </p>
                      <p>{selectedOrder.shipping_address.country || 'United States'}</p>
                    </div>
                  </div>
                )}

                {/* Tracking Number */}
                <div className="bg-zinc-800 p-4 border border-zinc-700">
                  <h3 className="font-bold flex items-center gap-2 mb-3">
                    <Truck className="w-4 h-4" />
                    Shipping & Tracking
                  </h3>
                  {selectedOrder.tracking_number ? (
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-400">Tracking Number:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-zinc-900 px-3 py-2 font-mono text-sm flex-1">
                          {selectedOrder.tracking_number}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.tracking_number || '')
                            alert('Tracking number copied!')
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(`https://www.fedex.com/fedextrack/?trknbr=${selectedOrder.tracking_number}`, '_blank')}
                        >
                          Track
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-400">Add tracking number to mark as shipped:</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={saveTrackingNumber}
                          isLoading={isSavingTracking}
                          disabled={!trackingNumber.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between bg-zinc-800 p-3">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-zinc-500">
                            Qty: {item.quantity}
                            {item.size && ` • Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                          </p>
                        </div>
                        <p className="font-bold">{formatCurrency(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <h3 className="font-bold mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                    {selectedOrder.status !== 'refunded' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to refund this order? This will process a refund through Stripe.')) {
                            updateOrderStatus(selectedOrder.id, 'refunded')
                          }
                        }}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                  {selectedOrder.status === 'refunded' && (
                    <p className="text-sm text-red-400 mt-2">This order has been refunded.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>No orders found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Order</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Customer</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Date</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Total</th>
                  <th className="text-left p-4 text-sm font-bold text-zinc-400">Status</th>
                  <th className="text-right p-4 text-sm font-bold text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <code className="text-sm font-mono text-zinc-400">
                        {order.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="p-4">
                      {(order as Order & { member?: { first_name: string; last_name: string } }).member
                        ? `${(order as Order & { member: { first_name: string; last_name: string } }).member.first_name} ${(order as Order & { member: { first_name: string; last_name: string } }).member.last_name}`
                        : order.guest_name || 'Guest'}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setTrackingNumber(order.tracking_number || '')
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
