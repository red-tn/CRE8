'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Search, Users, Check, X, Shield, Pencil, KeyRound, ShoppingBag, Eye, Package } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Member, MembershipDues, Order, TRUCK_MAKES, TRUCK_MODELS, TruckMake } from '@/types'

interface MemberWithDues extends Member {
  membership_dues?: MembershipDues[]
}

// Helper function to get dues status
function getDuesStatus(member: MemberWithDues): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } {
  const dues = member.membership_dues
  if (!dues || dues.length === 0) {
    return { label: 'Unpaid', variant: 'danger' }
  }

  // Find the most recent paid dues
  const paidDues = dues.filter(d => d.status === 'paid').sort((a, b) =>
    new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
  )[0]

  if (!paidDues) {
    return { label: 'Unpaid', variant: 'danger' }
  }

  const now = new Date()
  const expiresDate = new Date(paidDues.period_end)
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { label: 'Expired', variant: 'danger' }
  } else if (daysUntilExpiry <= 30) {
    return { label: `${daysUntilExpiry}d left`, variant: 'warning' }
  } else {
    return { label: 'Paid', variant: 'success' }
  }
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberWithDues[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    truck_year: '',
    truck_make: '' as TruckMake | '',
    truck_model: '',
    instagram_handle: '',
    bio: '',
    receive_order_notifications: false,
  })
  const [memberOrders, setMemberOrders] = useState<(Order & { order_items?: Order['items'] })[]>([])
  const [selectedMemberForOrders, setSelectedMemberForOrders] = useState<Member | null>(null)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [search, filter])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filter) params.set('filter', filter)

      const res = await fetch(`/api/admin/members?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMemberOrders = async (member: Member) => {
    setSelectedMemberForOrders(member)
    setIsLoadingOrders(true)
    try {
      const res = await fetch(`/api/admin/orders?member_id=${member.id}`)
      if (res.ok) {
        const data = await res.json()
        // Map order_items to items
        const mappedOrders = data.orders.map((order: Order & { order_items?: Order['items'] }) => ({
          ...order,
          items: order.order_items || [],
        }))
        setMemberOrders(mappedOrders)
      }
    } catch (error) {
      console.error('Error fetching member orders:', error)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const toggleActive = async (member: Member) => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, is_active: !member.is_active }),
      })

      if (res.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error updating member:', error)
    }
  }

  const toggleAdmin = async (member: Member) => {
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, is_admin: !member.is_admin }),
      })

      if (res.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error updating member:', error)
    }
  }

  const resetPassword = async (member: Member) => {
    if (!confirm(`Send password reset email to ${member.email}?`)) return

    try {
      const res = await fetch('/api/admin/members/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || 'Password reset email sent!')
      } else {
        alert(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to send reset email')
    }
  }

  const startEdit = (member: Member) => {
    setEditingMember(member)
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      truck_year: member.truck_year?.toString() || '',
      truck_make: member.truck_make || '',
      truck_model: member.truck_model || '',
      instagram_handle: member.instagram_handle || '',
      bio: member.bio || '',
      receive_order_notifications: member.receive_order_notifications || false,
    })
  }

  const handleSave = async () => {
    if (!editingMember) return
    setIsSaving(true)

    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMember.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          truck_year: formData.truck_year ? parseInt(formData.truck_year) : null,
          truck_make: formData.truck_make || null,
          truck_model: formData.truck_model || null,
          instagram_handle: formData.instagram_handle || null,
          bio: formData.bio || null,
          receive_order_notifications: formData.receive_order_notifications,
        }),
      })

      if (res.ok) {
        setEditingMember(null)
        fetchMembers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update member')
      }
    } catch (error) {
      console.error('Error updating member:', error)
      alert('Failed to update member')
    } finally {
      setIsSaving(false)
    }
  }

  const availableModels = formData.truck_make ? TRUCK_MODELS[formData.truck_make as TruckMake] : []

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">
          <span className="text-white">MEMBERS</span>
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="default">{members.length} total</Badge>
        </div>
      </div>

      {/* Member Orders Modal */}
      {selectedMemberForOrders && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Orders for {selectedMemberForOrders.first_name} {selectedMemberForOrders.last_name}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">{selectedMemberForOrders.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMemberForOrders(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="text-center py-8 text-zinc-500">Loading orders...</div>
              ) : memberOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-500">No orders found for this member</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memberOrders.map((order) => (
                    <div key={order.id} className="bg-zinc-800 p-4 border border-zinc-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <code className="text-sm font-mono text-zinc-400">{order.id.slice(0, 8)}</code>
                          <p className="text-sm text-zinc-500 mt-1">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{formatCurrency(order.total)}</p>
                          <Badge
                            variant={
                              order.status === 'delivered' ? 'success' :
                              order.status === 'shipped' ? 'amber' :
                              order.status === 'paid' ? 'success' :
                              order.status === 'cancelled' || order.status === 'refunded' ? 'danger' :
                              'default'
                            }
                            className="mt-1"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-zinc-700 pt-3 mt-3">
                          <p className="text-xs text-zinc-500 mb-2">Items:</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-zinc-400">
                                {item.product_name}
                                {item.size && ` (${item.size})`}
                                {item.color && ` - ${item.color}`}
                                {' '}x{item.quantity}
                              </span>
                              <span className="text-zinc-400">{formatCurrency(item.total_price)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {order.tracking_number && (
                        <div className="border-t border-zinc-700 pt-3 mt-3">
                          <p className="text-xs text-zinc-500 mb-1">Tracking:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-zinc-900 px-2 py-1">{order.tracking_number}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://www.fedex.com/fedextrack/?trknbr=${order.tracking_number}`, '_blank')}
                            >
                              Track
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Edit Member</h2>
                  {editingMember.invite_code && (
                    <p className="text-sm text-zinc-500 mt-1">
                      Signed up with code: <code className="bg-zinc-800 px-2 py-0.5 text-white font-mono">{editingMember.invite_code.code}</code>
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingMember(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Truck Year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.truck_year}
                    onChange={(e) => setFormData({ ...formData, truck_year: e.target.value })}
                  />
                  <Select
                    label="Truck Make"
                    value={formData.truck_make}
                    onChange={(e) => setFormData({ ...formData, truck_make: e.target.value as TruckMake | '', truck_model: '' })}
                  >
                    <option value="">Select Make</option>
                    {TRUCK_MAKES.map((make) => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </Select>
                  <Select
                    label="Truck Model"
                    value={formData.truck_model}
                    onChange={(e) => setFormData({ ...formData, truck_model: e.target.value })}
                    disabled={!formData.truck_make}
                  >
                    <option value="">Select Model</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </Select>
                </div>
                <Input
                  label="Instagram Handle"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                  placeholder="@username"
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors duration-200"
                    placeholder="Member bio..."
                  />
                </div>

                {/* Order Notifications - Only show for admins */}
                {editingMember?.is_admin && (
                  <div className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-700">
                    <input
                      type="checkbox"
                      id="receive_order_notifications"
                      checked={formData.receive_order_notifications}
                      onChange={(e) => setFormData({ ...formData, receive_order_notifications: e.target.checked })}
                      className="w-5 h-5 rounded border-zinc-600 bg-zinc-900 text-white focus:ring-white focus:ring-offset-zinc-900"
                    />
                    <label htmlFor="receive_order_notifications" className="text-sm">
                      <span className="font-medium text-white">Receive Order Notifications</span>
                      <p className="text-zinc-400 text-xs mt-0.5">Get email alerts when new orders are placed</p>
                    </label>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingMember(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === '' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('')}
              >
                All
              </Button>
              <Button
                variant={filter === 'active' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'inactive' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('inactive')}
              >
                Inactive
              </Button>
              <Button
                variant={filter === 'admin' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilter('admin')}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>No members found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Member</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Truck</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Joined</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Account</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Dues Status</th>
                      <th className="text-right p-4 text-sm font-bold text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {member.truck_photo_url || member.profile_photo_url ? (
                              <img
                                src={member.truck_photo_url || member.profile_photo_url}
                                alt={`${member.first_name}'s vehicle`}
                                className="w-10 h-10 object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-bold">
                                {member.first_name[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-bold">
                                {member.first_name} {member.last_name}
                                {member.is_admin && (
                                  <Shield className="w-4 h-4 text-green-500 inline ml-2" />
                                )}
                              </p>
                              <p className="text-sm text-zinc-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {member.truck_make ? (
                            <span>
                              {member.truck_year} {member.truck_make} {member.truck_model}
                            </span>
                          ) : (
                            <span className="text-zinc-600">Not set</span>
                          )}
                        </td>
                        <td className="p-4 text-zinc-400">
                          {formatDate(member.created_at)}
                        </td>
                        <td className="p-4">
                          <Badge variant={member.is_active ? 'success' : 'danger'}>
                            {member.is_active ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {(() => {
                            const duesStatus = getDuesStatus(member)
                            return (
                              <Badge variant={duesStatus.variant}>
                                {duesStatus.label}
                              </Badge>
                            )
                          })()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(member)}
                              title="Edit member"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetPassword(member)}
                              title="Send password reset"
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchMemberOrders(member)}
                              title="View orders"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAdmin(member)}
                              title={member.is_admin ? 'Remove admin' : 'Make admin'}
                            >
                              <Shield className={`w-4 h-4 ${member.is_admin ? 'text-green-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(member)}
                              title={member.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {member.is_active ? (
                                <X className="w-4 h-4 text-red-500" />
                              ) : (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-zinc-800">
                {members.map((member) => (
                  <div key={member.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {member.truck_photo_url || member.profile_photo_url ? (
                          <img
                            src={member.truck_photo_url || member.profile_photo_url}
                            alt={`${member.first_name}'s vehicle`}
                            className="w-10 h-10 object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-bold flex-shrink-0">
                            {member.first_name[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">
                            {member.first_name} {member.last_name}
                            {member.is_admin && (
                              <Shield className="w-4 h-4 text-green-500 inline ml-2" />
                            )}
                          </p>
                          <p className="text-sm text-zinc-500 truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Badge variant={member.is_active ? 'success' : 'danger'}>
                          {member.is_active ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {(() => {
                          const duesStatus = getDuesStatus(member)
                          return (
                            <Badge variant={duesStatus.variant}>
                              {duesStatus.label}
                            </Badge>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400 mb-3">
                      {member.truck_make ? (
                        <span>{member.truck_year} {member.truck_make} {member.truck_model}</span>
                      ) : (
                        <span className="text-zinc-600">No truck info</span>
                      )}
                      <span className="mx-2">•</span>
                      <span>Joined {formatDate(member.created_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(member)}
                        className="flex-1"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetPassword(member)}
                        title="Send password reset"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchMemberOrders(member)}
                        title="View orders"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdmin(member)}
                        title={member.is_admin ? 'Remove admin' : 'Make admin'}
                      >
                        <Shield className={`w-4 h-4 ${member.is_admin ? 'text-green-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(member)}
                        title={member.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {member.is_active ? (
                          <X className="w-4 h-4 text-red-500" />
                        ) : (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
