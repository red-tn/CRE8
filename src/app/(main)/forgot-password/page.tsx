'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setSuccess(true)
    } catch {
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
            RESET <span className="text-white">PASSWORD</span>
          </h1>
          <p className="text-zinc-500 mt-2">We&apos;ll send you a reset link</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 mb-6 text-sm">
              If an account exists with that email, you&apos;ll receive a password reset link shortly.
            </div>
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                required
              />

              <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>

            {/* Links */}
            <div className="mt-8 text-center">
              <p className="text-zinc-500 text-sm">
                Remember your password?{' '}
                <Link href="/login" className="text-white hover:text-zinc-200">
                  Login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
