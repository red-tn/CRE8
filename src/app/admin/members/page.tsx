'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Search, Users, Check, X, Shield, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Member, TRUCK_MAKES, TRUCK_MODELS, TruckMake } from '@/types'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
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
  })

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
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Status</th>
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
                                  <Shield className="w-4 h-4 text-white inline ml-2" />
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
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
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
                              onClick={() => toggleAdmin(member)}
                              title={member.is_admin ? 'Remove admin' : 'Make admin'}
                            >
                              <Shield className={`w-4 h-4 ${member.is_admin ? 'text-white' : ''}`} />
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
                              <Shield className="w-4 h-4 text-white inline ml-2" />
                            )}
                          </p>
                          <p className="text-sm text-zinc-500 truncate">{member.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.is_active ? 'success' : 'danger'} className="flex-shrink-0">
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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
                        onClick={() => toggleAdmin(member)}
                        title={member.is_admin ? 'Remove admin' : 'Make admin'}
                      >
                        <Shield className={`w-4 h-4 ${member.is_admin ? 'text-white' : ''}`} />
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
