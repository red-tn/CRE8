'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import {
  CreditCard,
  Calendar,
  LogOut,
  Truck,
  CheckCircle,
  AlertCircle,
  User,
  Camera,
  X,
  Check,
  HelpCircle,
  XCircle,
  MapPin,
  Package,
  ExternalLink,
} from 'lucide-react'
import { formatDate, formatCurrency, getDuesStatus, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { MembershipDues, Event, EventRSVP, MemberMedia, Order } from '@/types'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { member, isLoading, checkAuth, logout } = useAuthStore()

  const [dues, setDues] = useState<MembershipDues | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<(Event & { rsvp?: EventRSVP })[]>([])
  const [isPayingDues, setIsPayingDues] = useState(false)
  const [showDuesSuccess, setShowDuesSuccess] = useState(false)
  const [truckPhoto, setTruckPhoto] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<(Event & { rsvp?: EventRSVP }) | null>(null)
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false)
  const [guestCount, setGuestCount] = useState(0)
  const [orders, setOrders] = useState<(Order & { items?: Order['items'] })[]>([])

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
      const [duesRes, eventsRes, mediaRes, ordersRes] = await Promise.all([
        fetch('/api/member/dues'),
        fetch('/api/member/events'),
        fetch('/api/member/media'),
        fetch('/api/member/orders'),
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

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
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

  const handleOpenRsvpModal = (event: Event & { rsvp?: EventRSVP }) => {
    setSelectedEvent(event)
    setGuestCount(event.rsvp?.guests || 0)
  }

  const handleRsvp = async (status: 'attending' | 'maybe' | 'not_attending') => {
    if (!selectedEvent) return

    setIsSubmittingRsvp(true)
    try {
      const res = await fetch('/api/member/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          status,
          guests: guestCount,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Update the events list with the new RSVP
        setUpcomingEvents(upcomingEvents.map(e =>
          e.id === selectedEvent.id ? { ...e, rsvp: data.rsvp } : e
        ))
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error saving RSVP:', error)
    } finally {
      setIsSubmittingRsvp(false)
    }
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

        {/* New Member Photo Prompt */}
        {!truckPhoto && (
          <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Show Off Your Build!</h3>
                <p className="text-zinc-400 text-sm">
                  Add photos to your Truck Library to be featured in the fleet gallery and on your member profile.
                  Let the crew see what you&apos;re rolling in!
                </p>
              </div>
              <Link href="/dashboard/profile" className="flex-shrink-0">
                <Button>
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-white overflow-hidden flex items-center justify-center">
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

          <div className="flex gap-2 sm:gap-4 flex-wrap">
            {member.is_admin && (
              <Link href="/admin">
                <Button variant="secondary">Admin Panel</Button>
              </Link>
            )}
            <Link href="/dashboard/profile">
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </Link>
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
                  <CreditCard className="w-5 h-5 text-white" />
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
                  <AlertCircle className="w-12 h-12 text-white mx-auto mb-4" />
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
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-zinc-400">Exclusive events access</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-zinc-400">Member merch pricing</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-zinc-400">Fleet gallery feature</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-zinc-400">Priority registration</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* My Orders */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-white" />
                My Orders
              </h2>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-zinc-500 text-sm">No orders yet</p>
                  <Link href="/shop">
                    <Button variant="outline" size="sm" className="mt-3">
                      Browse Shop
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className={`space-y-4 ${orders.length > 2 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
                  {orders.map((order) => (
                    <div key={order.id} className="bg-zinc-800 p-4 border border-zinc-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-zinc-500">{formatDate(order.created_at)}</p>
                          <code className="text-xs font-mono text-zinc-400">#{order.id.slice(0, 8)}</code>
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
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="text-sm text-zinc-400 mb-2">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.product_name}
                              {item.size && ` (${item.size})`}
                              {item.quantity > 1 && ` x${item.quantity}`}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tracking Info */}
                      {order.tracking_number && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">Tracking Number</p>
                              <code className="text-sm bg-zinc-900 px-2 py-1">{order.tracking_number}</code>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://www.fedex.com/fedextrack/?trknbr=${order.tracking_number}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Track
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Status message for shipped items without tracking */}
                      {order.status === 'shipped' && !order.tracking_number && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <p className="text-sm text-amber-500">Your order has shipped! Tracking info coming soon.</p>
                        </div>
                      )}

                      {/* Status message for paid items */}
                      {order.status === 'paid' && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <p className="text-sm text-zinc-400">Order confirmed - preparing for shipment</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Truck Info */}
          <Card className="overflow-hidden">
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-white" />
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
                  <Calendar className="w-5 h-5 text-white" />
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
                      className="flex items-center gap-4 p-3 bg-zinc-800/50 border border-zinc-800 hover:border-white/50 transition-colors cursor-pointer"
                      onClick={() => handleOpenRsvpModal(event)}
                    >
                      <div className="w-12 h-12 bg-white text-black flex flex-col items-center justify-center text-xs font-bold">
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
                        <Badge variant={event.rsvp.status === 'attending' ? 'success' : event.rsvp.status === 'maybe' ? 'default' : 'danger'}>
                          {event.rsvp.status === 'attending' ? 'Going' : event.rsvp.status === 'maybe' ? 'Maybe' : 'Not Going'}
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenRsvpModal(event); }}>RSVP</Button>
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

      {/* RSVP Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {new Date(selectedEvent.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {selectedEvent.start_time && ` at ${formatTime(selectedEvent.start_time)}`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 text-white" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Bringing guests?
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(0, guestCount - 1))}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{guestCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-zinc-500 text-sm">additional guest{guestCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3">
                    Your response
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleRsvp('attending')}
                      disabled={isSubmittingRsvp}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        selectedEvent.rsvp?.status === 'attending'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-zinc-700 hover:border-green-500/50'
                      }`}
                    >
                      <Check className="w-6 h-6 text-green-500" />
                      <span className="text-sm font-medium">Going</span>
                    </button>
                    <button
                      onClick={() => handleRsvp('maybe')}
                      disabled={isSubmittingRsvp}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        selectedEvent.rsvp?.status === 'maybe'
                          ? 'border-white bg-white/10'
                          : 'border-zinc-700 hover:border-white/50'
                      }`}
                    >
                      <HelpCircle className="w-6 h-6 text-white" />
                      <span className="text-sm font-medium">Maybe</span>
                    </button>
                    <button
                      onClick={() => handleRsvp('not_attending')}
                      disabled={isSubmittingRsvp}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        selectedEvent.rsvp?.status === 'not_attending'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-zinc-700 hover:border-red-500/50'
                      }`}
                    >
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="text-sm font-medium">Can&apos;t Go</span>
                    </button>
                  </div>
                </div>

                {isSubmittingRsvp && (
                  <div className="text-center text-zinc-500">Saving...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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
