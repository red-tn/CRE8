'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Ticket, Plus, Copy, Trash2, Check, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { InviteCode, Member } from '@/types'

interface CodeWithMembers extends InviteCode {
  members?: Member[]
  isLoadingMembers?: boolean
}

export default function AdminInviteCodesPage() {
  const [codes, setCodes] = useState<CodeWithMembers[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [newCode, setNewCode] = useState({
    maxUses: '1',
    expiresAt: '',
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/invite-codes')
      if (res.ok) {
        const data = await res.json()
        setCodes(data.codes)
      }
    } catch (error) {
      console.error('Error fetching invite codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMembersForCode = async (codeId: string) => {
    // Mark as loading
    setCodes(prev => prev.map(c =>
      c.id === codeId ? { ...c, isLoadingMembers: true } : c
    ))

    try {
      const res = await fetch(`/api/admin/invite-codes?codeId=${codeId}`)
      if (res.ok) {
        const data = await res.json()
        setCodes(prev => prev.map(c =>
          c.id === codeId ? { ...c, members: data.members, isLoadingMembers: false } : c
        ))
      }
    } catch (error) {
      console.error('Error fetching members for code:', error)
      setCodes(prev => prev.map(c =>
        c.id === codeId ? { ...c, isLoadingMembers: false } : c
      ))
    }
  }

  const toggleExpand = (codeId: string) => {
    if (expandedId === codeId) {
      setExpandedId(null)
    } else {
      setExpandedId(codeId)
      // Fetch members if not already loaded
      const code = codes.find(c => c.id === codeId)
      if (code && !code.members && code.current_uses > 0) {
        fetchMembersForCode(codeId)
      }
    }
  }

  const createCode = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxUses: parseInt(newCode.maxUses) || 1,
          expiresAt: newCode.expiresAt || null,
        }),
      })

      if (res.ok) {
        setNewCode({ maxUses: '1', expiresAt: '' })
        fetchCodes()
      }
    } catch (error) {
      console.error('Error creating invite code:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const deleteCode = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invite-codes?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchCodes()
      }
    } catch (error) {
      console.error('Error deleting invite code:', error)
    }
  }

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black">
          <span className="text-white">INVITE CODES</span>
        </h1>
      </div>

      {/* Create New Code */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold">Create New Invite Code</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="w-full sm:w-32">
              <Input
                label="Max Uses"
                type="number"
                min="1"
                value={newCode.maxUses}
                onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
              />
            </div>
            <div className="w-full sm:w-48">
              <Input
                label="Expires (optional)"
                type="date"
                value={newCode.expiresAt}
                onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
              />
            </div>
            <Button onClick={createCode} isLoading={isCreating} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Generate Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500">Loading...</div>
          ) : codes.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>No invite codes yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Code</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Uses</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Expires</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Status</th>
                      <th className="text-left p-4 text-sm font-bold text-zinc-400">Created</th>
                      <th className="text-right p-4 text-sm font-bold text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => {
                      const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                      const isUsedUp = code.current_uses >= code.max_uses
                      const isExpanded = expandedId === code.id

                      return (
                        <>
                          <tr key={code.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                            <td className="p-4">
                              <code className="bg-zinc-800 px-3 py-1 text-white font-mono">
                                {code.code}
                              </code>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => toggleExpand(code.id)}
                                className="flex items-center gap-2 hover:text-white transition-colors"
                                disabled={code.current_uses === 0}
                              >
                                {code.current_uses} / {code.max_uses}
                                {code.current_uses > 0 && (
                                  isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )
                                )}
                              </button>
                            </td>
                            <td className="p-4 text-zinc-400">
                              {code.expires_at ? formatDate(code.expires_at) : 'Never'}
                            </td>
                            <td className="p-4">
                              {!code.is_active ? (
                                <Badge variant="danger">Disabled</Badge>
                              ) : isExpired ? (
                                <Badge variant="danger">Expired</Badge>
                              ) : isUsedUp ? (
                                <Badge variant="warning">Used Up</Badge>
                              ) : (
                                <Badge variant="success">Active</Badge>
                              )}
                            </td>
                            <td className="p-4 text-zinc-400">
                              {formatDate(code.created_at)}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyCode(code.code, code.id)}
                                >
                                  {copiedId === code.id ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCode(code.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {/* Expanded members row */}
                          {isExpanded && (
                            <tr key={`${code.id}-members`} className="bg-zinc-900/50">
                              <td colSpan={6} className="p-4">
                                <div className="pl-4 border-l-2 border-zinc-700">
                                  <h4 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Members who used this code
                                  </h4>
                                  {code.isLoadingMembers ? (
                                    <p className="text-zinc-500 text-sm">Loading...</p>
                                  ) : code.members && code.members.length > 0 ? (
                                    <div className="space-y-2">
                                      {code.members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
                                          {member.truck_photo_url || member.profile_photo_url ? (
                                            <img
                                              src={member.truck_photo_url || member.profile_photo_url}
                                              alt=""
                                              className="w-8 h-8 object-cover"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 bg-zinc-700 flex items-center justify-center text-white text-sm font-bold">
                                              {member.first_name[0]}
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                              {member.first_name} {member.last_name}
                                            </p>
                                            <p className="text-xs text-zinc-500 truncate">{member.email}</p>
                                          </div>
                                          <div className="text-xs text-zinc-500">
                                            {member.truck_make && (
                                              <span className="mr-3">
                                                {member.truck_year} {member.truck_make}
                                              </span>
                                            )}
                                            <span>Joined {formatDate(member.created_at)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-zinc-500 text-sm">No members found</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-zinc-800">
                {codes.map((code) => {
                  const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                  const isUsedUp = code.current_uses >= code.max_uses
                  const isExpanded = expandedId === code.id

                  return (
                    <div key={code.id} className="p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <code className="bg-zinc-800 px-3 py-1 text-white font-mono text-sm">
                          {code.code}
                        </code>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(code.code, code.id)}
                          >
                            {copiedId === code.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCode(code.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {!code.is_active ? (
                          <Badge variant="danger">Disabled</Badge>
                        ) : isExpired ? (
                          <Badge variant="danger">Expired</Badge>
                        ) : isUsedUp ? (
                          <Badge variant="warning">Used Up</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                      <div className="text-sm text-zinc-400 mb-2">
                        <button
                          onClick={() => toggleExpand(code.id)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                          disabled={code.current_uses === 0}
                        >
                          Uses: {code.current_uses} / {code.max_uses}
                          {code.current_uses > 0 && (
                            isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          )}
                        </button>
                        <span className="mx-2">•</span>
                        <span>Expires: {code.expires_at ? formatDate(code.expires_at) : 'Never'}</span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        Created {formatDate(code.created_at)}
                      </div>

                      {/* Expanded members */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                          <h4 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Members who used this code
                          </h4>
                          {code.isLoadingMembers ? (
                            <p className="text-zinc-500 text-sm">Loading...</p>
                          ) : code.members && code.members.length > 0 ? (
                            <div className="space-y-2">
                              {code.members.map((member) => (
                                <div key={member.id} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
                                  {member.truck_photo_url || member.profile_photo_url ? (
                                    <img
                                      src={member.truck_photo_url || member.profile_photo_url}
                                      alt=""
                                      className="w-8 h-8 object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-zinc-700 flex items-center justify-center text-white text-sm font-bold">
                                      {member.first_name[0]}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {member.first_name} {member.last_name}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">
                                      {member.truck_make && `${member.truck_year} ${member.truck_make} • `}
                                      {formatDate(member.created_at)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-zinc-500 text-sm">No members found</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
