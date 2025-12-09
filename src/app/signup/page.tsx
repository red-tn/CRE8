'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuthStore } from '@/store/auth'
import { TRUCK_MAKES, TRUCK_MODELS, TruckMake } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const setMember = useAuthStore((state) => state.setMember)

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    inviteCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    truckYear: '',
    truckMake: '',
    truckModel: '',
    instagram: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validateStep1 = () => {
    if (!formData.inviteCode) {
      setError('Invite code is required')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First and last name are required')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
    else if (step === 3 && validateStep3()) setStep(4)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: formData.inviteCode,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          truckYear: formData.truckYear ? parseInt(formData.truckYear) : null,
          truckMake: formData.truckMake || null,
          truckModel: formData.truckModel || null,
          instagram: formData.instagram,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setMember(data.member)
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="CRE8 Truck Club"
            width={120}
            height={60}
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-black">
            JOIN <span className="text-white">THE CLUB</span>
          </h1>
          <p className="text-zinc-500 mt-2">Become part of the crew</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 ${
                s <= step ? 'bg-white' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Invite Code */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Got an invite?</h2>
                <p className="text-zinc-500 text-sm mb-4">
                  Enter your invite code to get started. Don&apos;t have one?
                  Ask a member or DM us on Instagram.
                </p>
              </div>
              <Input
                label="Invite Code"
                name="inviteCode"
                placeholder="CRE8-XXXXXX"
                value={formData.inviteCode}
                onChange={handleChange}
                className="uppercase"
              />
              <Button type="button" onClick={handleNext} className="w-full">
                Verify Code <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Account */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Create your account</h2>
                <p className="text-zinc-500 text-sm mb-4">
                  Set up your login credentials.
                </p>
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Personal Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Tell us about you</h2>
                <p className="text-zinc-500 text-sm mb-4">
                  Basic info so we know who you are.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <Input
                label="Phone (optional)"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Instagram Handle (optional)"
                name="instagram"
                placeholder="@yourusername"
                value={formData.instagram}
                onChange={handleChange}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="button" onClick={handleNext} className="flex-1">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Truck Info */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Your truck</h2>
                <p className="text-zinc-500 text-sm mb-4">
                  Tell us what you&apos;re rolling in. This is optional but helps us feature your build.
                </p>
              </div>
              <Input
                label="Year (optional)"
                name="truckYear"
                type="number"
                placeholder="2023"
                value={formData.truckYear}
                onChange={handleChange}
              />
              <Select
                label="Make (optional)"
                name="truckMake"
                value={formData.truckMake}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    truckMake: e.target.value,
                    truckModel: '' // Reset model when make changes
                  })
                  setError('')
                }}
                options={[
                  { value: '', label: 'Select make...' },
                  ...TRUCK_MAKES.map(make => ({ value: make, label: make }))
                ]}
              />
              <Select
                label="Model (optional)"
                name="truckModel"
                value={formData.truckModel}
                onChange={handleChange}
                disabled={!formData.truckMake}
                options={[
                  { value: '', label: formData.truckMake ? 'Select model...' : 'Select make first' },
                  ...(formData.truckMake
                    ? TRUCK_MODELS[formData.truckMake as TruckMake].map(model => ({ value: model, label: model }))
                    : [])
                ]}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Join the Club
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Login link */}
        <p className="text-center text-zinc-500 text-sm mt-8">
          Already a member?{' '}
          <Link href="/login" className="text-white hover:text-zinc-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
