import { supabaseAdmin } from '@/lib/supabase/admin'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Event } from '@/types'
import { EventsList } from './EventsList'
import { parseLocalDate } from '@/lib/utils'

export const metadata = {
  title: 'Events | CRE8 Truck Club',
  description: 'Check out upcoming CRE8 Truck Club events, meets, and cruises.',
}

// Force dynamic rendering to always show fresh data
export const dynamic = 'force-dynamic'

// Get today's date in local timezone (YYYY-MM-DD format)
function getTodayLocal(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function getEvents() {
  const today = getTodayLocal()
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('event_date', today)
    .order('event_date', { ascending: true })

  return (data || []) as Event[]
}

async function getPastEvents() {
  const today = getTodayLocal()
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_active', true)
    .lt('event_date', today)
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
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Calendar className="w-12 h-12 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-white">EVENTS</span>
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
            UPCOMING <span className="text-white">EVENTS</span>
          </h2>

          {upcomingEvents.length > 0 ? (
            <EventsList events={upcomingEvents} />
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
              PAST <span className="text-white">EVENTS</span>
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
                        {parseLocalDate(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black">
                        {parseLocalDate(event.event_date).getDate()}
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
            WANT ACCESS TO <span className="text-white">EXCLUSIVE</span> EVENTS?
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
