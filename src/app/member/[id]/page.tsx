import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'
import { Truck, Instagram, Phone, Mail, ArrowLeft, Ghost, Music2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { notFound } from 'next/navigation'

interface MemberProfileProps {
  params: Promise<{ id: string }>
}

interface MemberData {
  id: string
  first_name: string
  last_name: string
  instagram_handle?: string
  snapchat_handle?: string
  tiktok_handle?: string
  phone?: string
  email: string
  truck_year?: number
  truck_make?: string
  truck_model?: string
  profile_photo_url?: string
  bio?: string
  created_at: string
}

interface MediaItem {
  id: string
  url: string
  caption?: string
  type: string
  created_at: string
}

async function getMemberData(id: string) {
  const { data: member, error } = await supabaseAdmin
    .from('members')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !member) {
    return null
  }

  // Get member's media
  const { data: media } = await supabaseAdmin
    .from('member_media')
    .select('*')
    .eq('member_id', id)
    .eq('type', 'image')
    .order('created_at', { ascending: false })

  // Also check fleet_gallery
  const { data: fleetMedia } = await supabaseAdmin
    .from('fleet_gallery')
    .select('*')
    .eq('member_id', id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return {
    member: member as MemberData,
    media: (media || []) as MediaItem[],
    fleetMedia: fleetMedia || []
  }
}

export async function generateMetadata({ params }: MemberProfileProps) {
  const { id } = await params
  const data = await getMemberData(id)

  if (!data) {
    return {
      title: 'Member Not Found | CRE8 Truck Club'
    }
  }

  const { member } = data
  const truckInfo = member.truck_year && member.truck_make && member.truck_model
    ? `${member.truck_year} ${member.truck_make} ${member.truck_model}`
    : ''

  return {
    title: `${member.first_name} ${member.last_name?.[0] || ''}. | CRE8 Truck Club`,
    description: truckInfo ? `Check out ${member.first_name}'s ${truckInfo}` : `${member.first_name}'s profile on CRE8 Truck Club`
  }
}

export default async function MemberProfilePage({ params }: MemberProfileProps) {
  const { id } = await params
  const data = await getMemberData(id)

  if (!data) {
    notFound()
  }

  const { member, media, fleetMedia } = data

  // Check if current user is logged in (to show contact info)
  const session = await getSession()
  const isLoggedIn = !!session?.member

  // Combine all images
  const allImages = [
    ...media.map(m => ({ id: m.id, url: m.url, caption: m.caption })),
    ...fleetMedia.map(f => ({ id: f.id, url: f.image_url, caption: f.caption }))
  ]

  // Use profile photo or first media image as hero
  const heroImage = member.profile_photo_url || allImages[0]?.url

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-amber-500 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Fleet
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Photo */}
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-zinc-800 border-2 border-amber-500/50 overflow-hidden">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={`${member.first_name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="CRE8"
                    width={80}
                    height={40}
                    className="h-12 w-auto opacity-30"
                  />
                </div>
              )}
            </div>

            {/* Member Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                {member.first_name} <span className="text-amber-500">{member.last_name?.[0]}.</span>
              </h1>

              {member.truck_year && member.truck_make && member.truck_model && (
                <div className="flex items-center gap-2 text-zinc-400 mb-4">
                  <Truck className="w-5 h-5 text-amber-500" />
                  <span className="text-lg">
                    {member.truck_year} {member.truck_make} {member.truck_model}
                  </span>
                </div>
              )}

              {member.bio && (
                <p className="text-zinc-500 mb-4">{member.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap gap-4 mb-4">
                {member.instagram_handle && (
                  <a
                    href={`https://instagram.com/${member.instagram_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-pink-500 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                    @{member.instagram_handle.replace(/^@/, '')}
                  </a>
                )}
                {member.snapchat_handle && (
                  <a
                    href={`https://snapchat.com/add/${member.snapchat_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors"
                  >
                    <Ghost className="w-5 h-5" />
                    @{member.snapchat_handle.replace(/^@/, '')}
                  </a>
                )}
                {member.tiktok_handle && (
                  <a
                    href={`https://tiktok.com/@${member.tiktok_handle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors"
                  >
                    <Music2 className="w-5 h-5" />
                    @{member.tiktok_handle.replace(/^@/, '')}
                  </a>
                )}
              </div>

              {/* Contact Info (only for logged-in members) */}
              {isLoggedIn && (
                <div className="bg-black/50 border border-zinc-800 p-4 mt-4">
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">
                    Member Contact Info
                  </p>
                  <div className="space-y-2">
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!isLoggedIn && (
                <p className="text-zinc-600 text-sm mt-4">
                  <Link href="/login" className="text-amber-500 hover:text-amber-400">
                    Log in
                  </Link>
                  {' '}to see contact info
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 bg-black flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black mb-8">
            <span className="text-amber-500">{member.first_name}&apos;s</span> TRUCK
          </h2>

          {allImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allImages.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-colors overflow-hidden group"
                >
                  <img
                    src={image.url}
                    alt={image.caption || `${member.first_name}'s truck`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Truck className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No photos yet</h3>
              <p className="text-zinc-500">
                {member.first_name} hasn&apos;t uploaded any truck photos yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black mb-4">
            WANT TO JOIN THE <span className="text-amber-500">FLEET</span>?
          </h2>
          <p className="text-zinc-500 mb-6">
            Become a member and get your truck featured in our gallery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Join the Club</Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg">View Full Fleet</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
