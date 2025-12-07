import { supabaseAdmin } from '@/lib/supabase/admin'
import { Calendar, MapPin, Clock, Users, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatTime } from '@/lib/utils'
import { Event } from '@/types'

export const metadata = {
  title: 'Events | CRE8 Truck Club',
  description: 'Check out upcoming CRE8 Truck Club events, meets, and cruises.',
}

// Revalidate every 60 seconds to show new/updated events
export const revalidate = 60

async function getEvents() {
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  return (data || []) as Event[]
}

async function getPastEvents() {
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_active', true)
    .lt('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: false })
    .limit(6)

  return (data || []) as Event[]
}

export default async function EventsPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getEvents(),
    getPastEvents(),
  ])

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-amber-500">EVENTS</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Meets, cruises, shows, and hangouts. We stay busy.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-8">
            UPCOMING <span className="text-amber-500">EVENTS</span>
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors"
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
                        {event.is_members_only && (
                          <Badge variant="amber" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Members Only
                          </Badge>
                        )}
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
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 p-12 text-center">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No upcoming events scheduled yet.</p>
              <p className="text-zinc-600 text-sm mt-2">Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-black mb-8">
              PAST <span className="text-amber-500">EVENTS</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-black border border-zinc-800 p-6 opacity-75"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-zinc-800 text-zinc-400 flex flex-col items-center justify-center text-xs">
                      <span className="font-bold uppercase">
                        {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black">
                        {new Date(event.event_date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold">{event.title}</h3>
                      <p className="text-zinc-600 text-sm">{event.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-black border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-6">
            WANT ACCESS TO <span className="text-amber-500">EXCLUSIVE</span> EVENTS?
          </h2>
          <p className="text-zinc-400 mb-8">
            Members get access to exclusive events, priority registration, and more.
          </p>
          <Link href="/signup">
            <Button size="lg">Join the Club</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
