'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import {
  Crown,
  CreditCard,
  Calendar,
  LogOut,
  Truck,
  CheckCircle,
  AlertCircle,
  User,
  Camera,
} from 'lucide-react'
import { formatDate, formatCurrency, getDuesStatus } from '@/lib/utils'
import Link from 'next/link'
import { MembershipDues, Event, EventRSVP, MemberMedia } from '@/types'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { member, isLoading, checkAuth, logout } = useAuthStore()

  const [dues, setDues] = useState<MembershipDues | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<(Event & { rsvp?: EventRSVP })[]>([])
  const [isPayingDues, setIsPayingDues] = useState(false)
  const [showDuesSuccess, setShowDuesSuccess] = useState(false)
  const [truckPhoto, setTruckPhoto] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !member) {
      router.push('/login')
    }
  }, [isLoading, member, router])

  useEffect(() => {
    if (searchParams.get('dues') === 'success') {
      setShowDuesSuccess(true)
      setTimeout(() => setShowDuesSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (member) {
      fetchDashboardData()
    }
  }, [member])

  const fetchDashboardData = async () => {
    try {
      const [duesRes, eventsRes, mediaRes] = await Promise.all([
        fetch('/api/member/dues'),
        fetch('/api/member/events'),
        fetch('/api/member/media'),
      ])

      if (duesRes.ok) {
        const duesData = await duesRes.json()
        setDues(duesData.dues)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setUpcomingEvents(eventsData.events)
      }

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json()
        // Get first image as truck photo (most recent)
        const firstImage = mediaData.media?.find((m: MemberMedia) => m.type === 'image')
        if (firstImage) {
          setTruckPhoto(firstImage.url)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handlePayDues = async () => {
    setIsPayingDues(true)
    try {
      const response = await fetch('/api/checkout/dues', { method: 'POST' })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start payment')
      }
    } catch (error) {
      console.error('Error paying dues:', error)
      alert('Something went wrong')
    } finally {
      setIsPayingDues(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!member) {
    return null
  }

  const duesStatus = dues ? getDuesStatus(dues.period_end) : null

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showDuesSuccess && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Dues paid successfully! Your membership is now active.
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-amber-500 overflow-hidden flex items-center justify-center">
              {member.profile_photo_url ? (
                <img
                  src={member.profile_photo_url}
                  alt={member.first_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-zinc-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black">
                Welcome, {member.first_name}
              </h1>
              <p className="text-zinc-500">Member since {formatDate(member.created_at)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            {member.is_admin && (
              <Link href="/admin">
                <Button variant="secondary">Admin Panel</Button>
              </Link>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dues Status Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  Membership Dues
                </h2>
                {duesStatus && (
                  <Badge
                    variant={
                      duesStatus === 'current'
                        ? 'success'
                        : duesStatus === 'due_soon'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {duesStatus === 'current' && 'Active'}
                    {duesStatus === 'due_soon' && 'Due Soon'}
                    {duesStatus === 'overdue' && 'Overdue'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {dues && dues.status === 'paid' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Amount Paid</span>
                    <span className="font-bold">{formatCurrency(dues.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Period</span>
                    <span>
                      {formatDate(dues.period_start)} - {formatDate(dues.period_end)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Paid</span>
                    </div>
                  </div>

                  {duesStatus !== 'current' && (
                    <Button onClick={handlePayDues} isLoading={isPayingDues} className="w-full mt-4">
                      Renew Membership - $50
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">No Active Membership</h3>
                  <p className="text-zinc-500 mb-6">
                    Pay your dues to unlock all member benefits.
                  </p>
                  <Button onClick={handlePayDues} isLoading={isPayingDues} size="lg">
                    Pay Dues - $50/year
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Member Benefits */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold">Member Benefits</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-zinc-400">Exclusive events access</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-zinc-400">Member merch pricing</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-zinc-400">Fleet gallery feature</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-zinc-400">Priority registration</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Truck Info */}
          <Card className="overflow-hidden">
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                Your Truck
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              {/* Truck Photo */}
              <div className="aspect-video bg-zinc-800 relative group">
                {truckPhoto ? (
                  <img
                    src={truckPhoto}
                    alt={member.truck_make ? `${member.truck_year} ${member.truck_make} ${member.truck_model}` : 'Your truck'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                    <Camera className="w-12 h-12 mb-2" />
                    <p className="text-sm">No photo yet</p>
                  </div>
                )}
                {/* Overlay with truck info */}
                {member.truck_make && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-lg font-bold text-white">
                      {member.truck_year} {member.truck_make}
                    </p>
                    <p className="text-zinc-300 text-sm">{member.truck_model}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4">
                {!member.truck_make && (
                  <p className="text-zinc-500 text-sm mb-3">Add your truck info to show off your build!</p>
                )}
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    {member.truck_make ? 'Edit Truck Info & Photos' : 'Add Truck Info'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Upcoming Events
                </h2>
                <Link href="/events">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-3 bg-zinc-800/50 border border-zinc-800"
                    >
                      <div className="w-12 h-12 bg-amber-500 text-black flex flex-col items-center justify-center text-xs font-bold">
                        <span>
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg">{new Date(event.event_date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{event.title}</p>
                        <p className="text-sm text-zinc-500">{event.location}</p>
                      </div>
                      {event.rsvp ? (
                        <Badge variant="success">RSVP&apos;d</Badge>
                      ) : (
                        <Button variant="outline" size="sm">RSVP</Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
