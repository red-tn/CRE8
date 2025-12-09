'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Users, DollarSign, ShoppingBag, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  pendingOrders: number
  upcomingEvents: number
  expiringSoon: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
                  Memberships Expiring Soon
                </p>
                <p className="text-3xl font-black">{stats?.expiringSoon || 0}</p>
              </div>
              <Link href="/admin/members?filter=expiring">
                <Button variant="outline">Send Reminders</Button>
              </Link>
            </div>
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
