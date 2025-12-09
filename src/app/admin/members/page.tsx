'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Search, Users, Check, X, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Member } from '@/types'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-white">MEMBERS</span>
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="default">{members.length} total</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
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
            <div className="flex gap-2">
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
                        <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-bold">
                          {member.first_name[0]}
                        </div>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
