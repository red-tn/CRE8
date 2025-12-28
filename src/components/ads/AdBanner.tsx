'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  className?: string
  showForMembers?: boolean
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdBanner({
  slot,
  format = 'auto',
  className = '',
  showForMembers = false
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const member = useAuthStore((state) => state.member)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    // Don't show ads to members unless explicitly allowed
    if (!isLoading && member && !showForMembers) return

    try {
      if (adRef.current && typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [member, isLoading, showForMembers])

  // Hide ads for members (unless showForMembers is true)
  if (!isLoading && member && !showForMembers) {
    return null
  }

  // Show loading state while checking auth
  if (isLoading) {
    return null
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8003141165916453"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
