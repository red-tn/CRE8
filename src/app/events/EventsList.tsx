'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, Users, Lock, X, Check, HelpCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { formatTime } from '@/lib/utils'
import { Event, EventRSVP } from '@/types'
import { useAuthStore } from '@/store/auth'

interface EventsListProps {
  events: Event[]
}

export function EventsList({ events }: EventsListProps) {
  const router = useRouter()
  const { member, checkAuth, isLoading: authLoading } = useAuthStore()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<Record<string, EventRSVP>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestCount, setGuestCount] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Fetch RSVPs for logged-in member
  useEffect(() => {
    if (member) {
      fetchRsvps()
    }
  }, [member])

  const fetchRsvps = async () => {
    try {
      const res = await fetch('/api/member/events')
      if (res.ok) {
        const data = await res.json()
        const rsvpMap: Record<string, EventRSVP> = {}
        data.events?.forEach((e: Event & { rsvp?: EventRSVP }) => {
          if (e.rsvp) {
            rsvpMap[e.id] = e.rsvp
          }
        })
        setRsvps(rsvpMap)
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error)
    }
  }

  const handleEventClick = (event: Event) => {
    // If members-only event and not logged in, redirect to signup
    if (event.is_members_only && !member) {
      router.push('/signup')
      return
    }

    // If logged in (for any event type), show RSVP modal
    if (member) {
      setSelectedEvent(event)
      setGuestCount(rsvps[event.id]?.guests || 0)
    }
  }

  const handleRsvp = async (status: 'attending' | 'maybe' | 'not_attending') => {
    if (!selectedEvent || !member) return

    setIsSubmitting(true)
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
        setRsvps({ ...rsvps, [selectedEvent.id]: data.rsvp })
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('Error saving RSVP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRsvpBadge = (eventId: string) => {
    const rsvp = rsvps[eventId]
    if (!rsvp) return null

    switch (rsvp.status) {
      case 'attending':
        return <Badge variant="success">Going</Badge>
      case 'maybe':
        return <Badge variant="default">Maybe</Badge>
      case 'not_attending':
        return <Badge variant="danger">Not Going</Badge>
    }
  }

  return (
    <>
      <div className="grid gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
              {/* Date Box */}
              <div className="flex-shrink-0 w-24 h-24 bg-amber-500 text-black flex flex-col items-center justify-center">
                <span className="text-sm font-bold uppercase">
                  {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-3xl font-black">
                  {new Date(event.event_date).getDate()}
                </span>
              </div>

              {/* Event Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <div className="flex gap-2">
                    {getRsvpBadge(event.id)}
                    {event.is_members_only && (
                      <Badge variant="amber" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Members Only
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-zinc-400 mb-4">{event.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.start_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>
                        {formatTime(event.start_time)}
                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                      </span>
                    </div>
                  )}
                  {event.max_attendees && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>Max {event.max_attendees} attendees</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Type */}
              <div className="flex-shrink-0 flex items-center">
                {!event.is_members_only && (
                  <span className="text-sm text-zinc-500 border border-zinc-700 px-3 py-1">Open to All</span>
                )}
              </div>
            </div>
          </div>
        ))}
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
                    <MapPin className="w-4 h-4 text-amber-500" />
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
                      disabled={isSubmitting}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        rsvps[selectedEvent.id]?.status === 'attending'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-zinc-700 hover:border-green-500/50'
                      }`}
                    >
                      <Check className="w-6 h-6 text-green-500" />
                      <span className="text-sm font-medium">Going</span>
                    </button>
                    <button
                      onClick={() => handleRsvp('maybe')}
                      disabled={isSubmitting}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        rsvps[selectedEvent.id]?.status === 'maybe'
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-700 hover:border-amber-500/50'
                      }`}
                    >
                      <HelpCircle className="w-6 h-6 text-amber-500" />
                      <span className="text-sm font-medium">Maybe</span>
                    </button>
                    <button
                      onClick={() => handleRsvp('not_attending')}
                      disabled={isSubmitting}
                      className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                        rsvps[selectedEvent.id]?.status === 'not_attending'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-zinc-700 hover:border-red-500/50'
                      }`}
                    >
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="text-sm font-medium">Can&apos;t Go</span>
                    </button>
                  </div>
                </div>

                {isSubmitting && (
                  <div className="text-center text-zinc-500">Saving...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
