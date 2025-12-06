'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Plus, Pencil, Trash2, X, MapPin, Users } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { Event } from '@/types'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    imageUrl: '',
    isMembersOnly: false,
    maxAttendees: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      address: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      imageUrl: '',
      isMembersOnly: false,
      maxAttendees: '',
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const startEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      address: event.address || '',
      eventDate: event.event_date,
      startTime: event.start_time || '',
      endTime: event.end_time || '',
      imageUrl: event.image_url || '',
      isMembersOnly: event.is_members_only,
      maxAttendees: event.max_attendees?.toString() || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...(editingEvent ? { id: editingEvent.id } : {}),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        eventDate: formData.eventDate,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        imageUrl: formData.imageUrl,
        isMembersOnly: formData.isMembersOnly,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
      }

      const res = await fetch('/api/admin/events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        resetForm()
        fetchEvents()
      }
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const isPastEvent = (date: string) => new Date(date) < new Date()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-amber-500">EVENTS</span>
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Location Name"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Downtown Warehouse"
                  />
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St, Austin TX"
                  />
                </div>
                <Input
                  label="Event Date"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
                <Input
                  label="Image URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
                <Input
                  label="Max Attendees (optional)"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMembersOnly}
                    onChange={(e) => setFormData({ ...formData, isMembersOnly: e.target.checked })}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm">Members Only Event</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSaving} className="flex-1">
                    {editingEvent ? 'Update' : 'Create'} Event
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-zinc-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>No events yet</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className={isPastEvent(event.event_date) ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Date Box */}
                  <div className="flex-shrink-0 w-20 h-20 bg-amber-500 text-black flex flex-col items-center justify-center">
                    <span className="text-sm font-bold uppercase">
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black">
                      {new Date(event.event_date).getDate()}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <div className="flex gap-2 mt-1">
                          {event.is_members_only && (
                            <Badge variant="amber">Members Only</Badge>
                          )}
                          {isPastEvent(event.event_date) && (
                            <Badge variant="default">Past</Badge>
                          )}
                          {!event.is_active && (
                            <Badge variant="danger">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(event)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-zinc-400 mb-3">{event.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.start_time && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatTime(event.start_time)}
                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                          </span>
                        </div>
                      )}
                      {event.max_attendees && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Max {event.max_attendees}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
