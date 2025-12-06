'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Ticket, Plus, Copy, Trash2, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { InviteCode } from '@/types'

export default function AdminInviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-amber-500">INVITE CODES</span>
        </h1>
      </div>

      {/* Create New Code */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold">Create New Invite Code</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-32">
              <Input
                label="Max Uses"
                type="number"
                min="1"
                value={newCode.maxUses}
                onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
              />
            </div>
            <div className="w-48">
              <Input
                label="Expires (optional)"
                type="date"
                value={newCode.expiresAt}
                onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
              />
            </div>
            <Button onClick={createCode} isLoading={isCreating}>
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

                  return (
                    <tr key={code.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-4">
                        <code className="bg-zinc-800 px-3 py-1 text-amber-500 font-mono">
                          {code.code}
                        </code>
                      </td>
                      <td className="p-4">
                        {code.current_uses} / {code.max_uses}
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
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
