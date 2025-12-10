'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Users, DollarSign, ShoppingBag, Calendar, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ExpiringMember {
  id: string
  name: string
  email: string
  expiresAt: string
}

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  pendingOrders: number
  upcomingEvents: number
  expiringSoon: number
  expiringMembers: ExpiringMember[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExpiringMembers, setShowExpiringMembers] = useState(false)
  const [isSendingReminders, setIsSendingReminders] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendDuesReminders = async () => {
    if (!confirm('Send dues reminder emails to members with expiring memberships?')) return

    setIsSendingReminders(true)
    try {
      const res = await fetch('/api/admin/send-reminders', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || `Sent ${data.sent} reminder emails`)
      } else {
        alert(data.error || 'Failed to send reminders')
      }
    } catch (error) {
      console.error('Error sending reminders:', error)
      alert('Failed to send reminders')
    } finally {
      setIsSendingReminders(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse text-zinc-500">Loading dashboard...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">
        ADMIN <span className="text-white">DASHBOARD</span>
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm">Total Members</p>
                <p className="text-3xl font-black">{stats?.totalMembers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-green-500 text-sm mt-2">
              {stats?.activeMembers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-black">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-zinc-500 text-sm mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm">Pending Orders</p>
                <p className="text-3xl font-black">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <Link href="/admin/orders">
              <p className="text-white text-sm mt-2 hover:text-zinc-200">
                View orders →
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm">Upcoming Events</p>
                <p className="text-3xl font-black">{stats?.upcomingEvents || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <Link href="/admin/events">
              <p className="text-white text-sm mt-2 hover:text-zinc-200">
                Manage events →
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-white" />
                  Memberships Expiring Soon (30 days)
                </p>
                <p className="text-3xl font-black">{stats?.expiringSoon || 0}</p>
              </div>
              <div className="flex gap-2">
                {(stats?.expiringSoon || 0) > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExpiringMembers(!showExpiringMembers)}
                  >
                    {showExpiringMembers ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={sendDuesReminders}
                  isLoading={isSendingReminders}
                  disabled={(stats?.expiringSoon || 0) === 0}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminders
                </Button>
              </div>
            </div>
            {showExpiringMembers && stats?.expiringMembers && stats.expiringMembers.length > 0 && (
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <p className="text-sm text-zinc-400 mb-2">Members who will receive reminders:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.expiringMembers.map((member) => (
                    <div key={member.id} className="flex justify-between items-center text-sm bg-zinc-800/50 px-3 py-2">
                      <div>
                        <span className="text-white font-medium">{member.name}</span>
                        <span className="text-zinc-500 ml-2">{member.email}</span>
                      </div>
                      <span className="text-yellow-500 text-xs">
                        Expires {new Date(member.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/invite-codes">
          <Card hover className="cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-bold">Create Invite Code</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products">
          <Card hover className="cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-bold">Add Product</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/events">
          <Card hover className="cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-bold">Create Event</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/members">
          <Card hover className="cursor-pointer">
            <CardContent className="py-6 text-center">
              <p className="font-bold">View Members</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
