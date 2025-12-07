'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ArrowLeft, Save, Truck, User } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { member, isLoading, checkAuth, setMember } = useAuthStore()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    truck_year: '',
    truck_make: '',
    truck_model: '',
    instagram_handle: '',
    bio: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !member) {
      router.push('/login')
    }
  }, [isLoading, member, router])

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        phone: member.phone || '',
        truck_year: member.truck_year?.toString() || '',
        truck_make: member.truck_make || '',
        truck_model: member.truck_model || '',
        instagram_handle: member.instagram_handle || '',
        bio: member.bio || '',
      })
    }
  }, [member])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          truck_year: formData.truck_year ? parseInt(formData.truck_year) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMember(data.member)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setIsSaving(false)
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

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-black mb-8">Edit Profile</h1>

        {message && (
          <div
            className={`px-4 py-3 mb-6 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/50 text-green-500'
                : 'bg-red-500/10 border border-red-500/50 text-red-500'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Personal Info
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
              <Input
                label="Instagram Handle"
                name="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleChange}
                placeholder="@yourusername"
              />
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                Truck Info
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Year"
                  name="truck_year"
                  value={formData.truck_year}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Make"
                  name="truck_make"
                  value={formData.truck_make}
                  onChange={handleChange}
                >
                  <option value="">Select Make</option>
                  <option value="Chevy">Chevy</option>
                  <option value="Ford">Ford</option>
                  <option value="Dodge">Dodge</option>
                </Select>
              </div>
              <Input
                label="Model"
                name="truck_model"
                value={formData.truck_model}
                onChange={handleChange}
                placeholder="e.g., Silverado 1500, F-150, Ram 1500"
              />
            </CardContent>
          </Card>

          <Button type="submit" isLoading={isSaving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  )
}
