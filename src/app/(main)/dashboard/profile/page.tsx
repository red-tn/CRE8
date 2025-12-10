'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ArrowLeft, Save, Truck, User, Camera, Instagram, Upload, X, Play, Image as ImageIcon, Lock } from 'lucide-react'
import Link from 'next/link'
import { MemberMedia, TRUCK_MAKES, TRUCK_MODELS, TruckMake } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const { member, isLoading, checkAuth, setMember } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    truck_year: '',
    truck_make: '',
    truck_model: '',
    instagram_handle: '',
    snapchat_handle: '',
    tiktok_handle: '',
    bio: '',
    profile_photo_url: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [media, setMedia] = useState<MemberMedia[]>([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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
        snapchat_handle: member.snapchat_handle || '',
        tiktok_handle: member.tiktok_handle || '',
        bio: member.bio || '',
        profile_photo_url: member.profile_photo_url || '',
      })
      fetchMedia()
    }
  }, [member])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/member/media')
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoadingMedia(false)
    }
  }

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to upload')
      }

      // Save to media library
      const mediaResponse = await fetch('/api/member/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.url,
          type: uploadData.type,
        }),
      })

      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        setMedia([mediaData.media, ...media])
        setMessage({ type: 'success', text: 'Media uploaded successfully!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || 'Failed to upload file' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSetProfilePhoto = async (url: string) => {
    setFormData({ ...formData, profile_photo_url: url })

    try {
      const response = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_photo_url: url }),
      })

      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
        setMessage({ type: 'success', text: 'Profile photo updated!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to set profile photo' })
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/member/media?id=${mediaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMedia(media.filter(m => m.id !== mediaId))
        setMessage({ type: 'success', text: 'Media deleted!' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete media' })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    } finally {
      setIsChangingPassword(false)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-white" />
                    Profile Photo
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-zinc-800 border border-zinc-700 rounded-full overflow-hidden flex items-center justify-center">
                      {formData.profile_photo_url ? (
                        <img
                          src={formData.profile_photo_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-zinc-600" />
                      )}
                    </div>
                    <div className="text-sm text-zinc-500">
                      <p>Upload a photo or select from your media library below.</p>
                      <p className="mt-1">Recommended: Square image, at least 200x200px</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-white" />
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
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:border-white focus:outline-none transition-colors"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-white" />
                    Social Media
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Instagram"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                    placeholder="@yourusername"
                  />
                  <Input
                    label="Snapchat"
                    name="snapchat_handle"
                    value={formData.snapchat_handle}
                    onChange={handleChange}
                    placeholder="yourusername"
                  />
                  <Input
                    label="TikTok"
                    name="tiktok_handle"
                    value={formData.tiktok_handle}
                    onChange={handleChange}
                    placeholder="@yourusername"
                  />
                </CardContent>
              </Card>

              {/* Truck Info */}
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Truck className="w-5 h-5 text-white" />
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
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          truck_make: e.target.value,
                          truck_model: '' // Reset model when make changes
                        })
                      }}
                    >
                      <option value="">Select Make</option>
                      {TRUCK_MAKES.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Select
                    label="Model"
                    name="truck_model"
                    value={formData.truck_model}
                    onChange={handleChange}
                    disabled={!formData.truck_make}
                  >
                    <option value="">
                      {formData.truck_make ? 'Select Model' : 'Select Make first'}
                    </option>
                    {formData.truck_make && TRUCK_MODELS[formData.truck_make as TruckMake].map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>

              <Button type="submit" isLoading={isSaving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-white" />
                  Change Password
                </h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="At least 8 characters"
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                  <Button type="submit" variant="secondary" isLoading={isChangingPassword} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Media Library Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-white" />
                  Media Library
                </h2>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo/Video
                </Button>

                {loadingMedia ? (
                  <div className="text-center text-zinc-500 py-4">Loading...</div>
                ) : media.length === 0 ? (
                  <div className="text-center text-zinc-500 py-4">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No media uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {media.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square bg-zinc-800 border border-zinc-700 overflow-hidden group"
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <Play className="w-8 h-8 text-zinc-500" />
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {item.type === 'image' && (
                            <button
                              type="button"
                              onClick={() => handleSetProfilePhoto(item.url)}
                              className="p-2 bg-white text-black hover:bg-zinc-200 transition-colors"
                              title="Set as profile photo"
                            >
                              <User className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item.id)}
                            className="p-2 bg-red-500 text-white hover:bg-red-400 transition-colors"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Profile indicator */}
                        {formData.profile_photo_url === item.url && (
                          <div className="absolute top-1 right-1 bg-white text-black px-1 py-0.5 text-xs font-bold">
                            PROFILE
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
