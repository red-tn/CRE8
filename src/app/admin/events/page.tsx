'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Plus, Pencil, Trash2, X, MapPin, Users, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { Event } from '@/types'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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

  const deleteEvent = async (id: string, isCurrentlyActive: boolean) => {
    const message = isCurrentlyActive
      ? 'Are you sure you want to delete this event? It will be marked as inactive.'
      : 'Are you sure you want to PERMANENTLY delete this event? This cannot be undone!'

    if (!confirm(message)) return

    try {
      const permanent = !isCurrentlyActive
      const res = await fetch(`/api/admin/events?id=${id}&permanent=${permanent}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const restoreEvent = async (id: string) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: true }),
      })

      if (res.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('Error restoring event:', error)
    }
  }

  const isPastEvent = (date: string) => new Date(date) < new Date()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'events')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, imageUrl: data.url })
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-white">EVENTS</span>
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
                    placeholder="123 Main St, Nashville TN"
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
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Event Image
                  </label>
                  <div className="space-y-3">
                    {formData.imageUrl ? (
                      <div className="relative aspect-video bg-zinc-800 border border-zinc-700 overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Event"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white hover:bg-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 hover:border-white/50 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="text-zinc-500">Uploading...</div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-zinc-600 mb-2" />
                            <span className="text-sm text-zinc-500">Click to upload image</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
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
                    className="w-4 h-4 accent-white"
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
                  <div className="flex-shrink-0 w-20 h-20 bg-white text-black flex flex-col items-center justify-center">
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
                        {!event.is_active && (
                          <Button variant="ghost" size="sm" onClick={() => restoreEvent(event.id)} title="Restore event">
                            <RotateCcw className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEvent(event.id, event.is_active)}
                          title={event.is_active ? 'Delete event' : 'Delete permanently'}
                        >
                          <Trash2 className={`w-4 h-4 ${event.is_active ? 'text-red-500' : 'text-red-700'}`} />
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
