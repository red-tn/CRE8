import { supabaseAdmin } from '@/lib/supabase/admin'
import { Truck, Crown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const metadata = {
  title: 'Fleet Gallery | CRE8 Truck Club',
  description: 'Check out the CRE8 Truck Club fleet - Chevy, Ford, and Dodge trucks from our members.',
}

interface GalleryItem {
  id: string
  image_url: string
  caption?: string
  is_featured: boolean
  member: {
    first_name: string
    last_name: string
    instagram_handle?: string
    truck_year?: number
    truck_make?: string
    truck_model?: string
  }
}

async function getGalleryImages(): Promise<GalleryItem[]> {
  // Get members with their media
  const { data: members } = await supabaseAdmin
    .from('members')
    .select('id, first_name, last_name, instagram_handle, truck_year, truck_make, truck_model, profile_photo_url')
    .eq('is_active', true)
    .not('truck_make', 'is', null)

  if (!members || members.length === 0) return []

  const memberIds = members.map(m => m.id)

  // Get media from member_media table
  const { data: memberMedia } = await supabaseAdmin
    .from('member_media')
    .select('*')
    .in('member_id', memberIds)
    .eq('type', 'image')
    .order('created_at', { ascending: false })

  // Also get from fleet_gallery table
  const { data: fleetGallery } = await supabaseAdmin
    .from('fleet_gallery')
    .select('*, member:members(first_name, last_name, instagram_handle, truck_year, truck_make, truck_model)')
    .eq('is_approved', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const galleryItems: GalleryItem[] = []

  // Add member media items
  memberMedia?.forEach(media => {
    const member = members.find(m => m.id === media.member_id)
    if (member) {
      galleryItems.push({
        id: media.id,
        image_url: media.url,
        caption: media.caption,
        is_featured: false,
        member: {
          first_name: member.first_name,
          last_name: member.last_name,
          instagram_handle: member.instagram_handle,
          truck_year: member.truck_year,
          truck_make: member.truck_make,
          truck_model: member.truck_model,
        }
      })
    }
  })

  // Add fleet gallery items (avoiding duplicates)
  fleetGallery?.forEach(item => {
    if (item.member) {
      galleryItems.push({
        id: item.id,
        image_url: item.image_url,
        caption: item.caption,
        is_featured: item.is_featured,
        member: item.member
      })
    }
  })

  // Add members with profile photos but no media uploads
  members.forEach(member => {
    const hasMedia = galleryItems.some(item =>
      item.member.first_name === member.first_name &&
      item.member.last_name === member.last_name
    )
    if (!hasMedia && member.profile_photo_url) {
      galleryItems.push({
        id: member.id,
        image_url: member.profile_photo_url,
        caption: undefined,
        is_featured: false,
        member: {
          first_name: member.first_name,
          last_name: member.last_name,
          instagram_handle: member.instagram_handle,
          truck_year: member.truck_year,
          truck_make: member.truck_make,
          truck_model: member.truck_model,
        }
      })
    }
  })

  return galleryItems
}

export default async function GalleryPage() {
  const images = await getGalleryImages()

  // Group by truck make for filtering
  const chevyCount = images.filter(img => img.member?.truck_make === 'Chevy').length
  const fordCount = images.filter(img => img.member?.truck_make === 'Ford').length
  const dodgeCount = images.filter(img => img.member?.truck_make === 'Dodge').length

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Truck className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            THE <span className="text-amber-500">FLEET</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Check out what our members are rolling in. Chevy, Ford, Dodge - all welcome.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">{chevyCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Chevy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">{fordCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Ford</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">{dodgeCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Dodge</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Placeholder - replace with actual image */}
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Fleet truck'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                      <Truck className="w-12 h-12" />
                    </div>
                  )}

                  {/* Featured badge */}
                  {image.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="amber" className="flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Featured
                      </Badge>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div>
                      {image.member?.truck_year && image.member?.truck_make && image.member?.truck_model && (
                        <p className="text-white font-bold">
                          {image.member.truck_year} {image.member.truck_make} {image.member.truck_model}
                        </p>
                      )}
                      <p className="text-zinc-400 text-sm">
                        {image.member?.first_name} {image.member?.last_name?.[0]}.
                      </p>
                      {image.member?.instagram_handle && (
                        <p className="text-amber-500 text-xs">@{image.member.instagram_handle}</p>
                      )}
                      {image.caption && (
                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{image.caption}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Truck className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No trucks yet</h3>
              <p className="text-zinc-500 mb-6">
                Be the first to add your truck to the fleet gallery.
              </p>
              <Link href="/signup">
                <Button>Join the Club</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-6">
            WANT YOUR TRUCK <span className="text-amber-500">FEATURED</span>?
          </h2>
          <p className="text-zinc-400 mb-8">
            Members can upload photos of their trucks to the fleet gallery.
            Join the club and show off your build.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Join the Club</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Member Login</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
