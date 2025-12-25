import { supabaseAdmin } from '@/lib/supabase/admin'
import { Truck, Crown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getStockTruckPhoto } from '@/lib/stockPhotos'
import { headers } from 'next/headers'

// Force dynamic rendering to always show fresh data
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata = {
  title: 'Fleet Gallery | CRE8 Truck Club',
  description: 'Check out the CRE8 Truck Club fleet - Chevy, Ford, Dodge, Toyota, Nissan, and GMC trucks from our members.',
}

interface GalleryItem {
  id: string
  member_id: string
  image_url: string
  caption?: string
  is_featured: boolean
  is_stock_photo: boolean
  member: {
    first_name: string
    last_name: string
    member_number?: number
    instagram_handle?: string
    truck_year?: number
    truck_make?: string
    truck_model?: string
  }
}

async function getGalleryImages(): Promise<GalleryItem[]> {
  // Force dynamic by reading headers
  headers()

  // Get members with their media
  const { data: members } = await supabaseAdmin
    .from('members')
    .select('id, first_name, last_name, member_number, instagram_handle, truck_year, truck_make, truck_model, profile_photo_url')
    .eq('is_active', true)
    .not('truck_make', 'is', null)

  if (!members || members.length === 0) return []

  const memberIds = members.map(m => m.id)

  // Get media from member_media table (most recent first)
  const { data: memberMedia } = await supabaseAdmin
    .from('member_media')
    .select('*')
    .in('member_id', memberIds)
    .eq('type', 'image')
    .order('created_at', { ascending: false })

  // Create a map of member_id to their first (most recent) image
  const memberImageMap: Record<string, { url: string; caption?: string }> = {}
  memberMedia?.forEach(media => {
    // Only keep the first (most recent) image per member
    if (!memberImageMap[media.member_id]) {
      memberImageMap[media.member_id] = { url: media.url, caption: media.caption }
    }
  })

  // Build gallery items - ONE per member
  const galleryItems: GalleryItem[] = members.map(member => {
    const memberImage = memberImageMap[member.id]
    const hasUploadedImage = !!memberImage
    const hasProfilePhoto = !!member.profile_photo_url

    // Priority: uploaded image > profile photo > stock photo
    let imageUrl: string
    let isStockPhoto = false

    if (hasUploadedImage) {
      imageUrl = memberImage.url
    } else if (hasProfilePhoto) {
      imageUrl = member.profile_photo_url!
    } else {
      imageUrl = getStockTruckPhoto(member.truck_make, member.truck_model)
      isStockPhoto = true
    }

    return {
      id: member.id,
      member_id: member.id,
      image_url: imageUrl,
      caption: memberImage?.caption,
      is_featured: false,
      is_stock_photo: isStockPhoto,
      member: {
        first_name: member.first_name,
        last_name: member.last_name,
        member_number: member.member_number,
        instagram_handle: member.instagram_handle,
        truck_year: member.truck_year,
        truck_make: member.truck_make,
        truck_model: member.truck_model,
      }
    }
  })

  return galleryItems
}

async function getFleetCounts() {
  const { data: members } = await supabaseAdmin
    .from('members')
    .select('truck_make')
    .eq('is_active', true)
    .not('truck_make', 'is', null)

  const counts: Record<string, number> = {}
  members?.forEach(m => {
    if (m.truck_make) {
      const make = m.truck_make
      counts[make] = (counts[make] || 0) + 1
    }
  })
  return counts
}

export default async function GalleryPage() {
  const images = await getGalleryImages()
  const fleetCounts = await getFleetCounts()

  // Count unique members by truck make
  const chevyCount = fleetCounts['Chevy'] || 0
  const fordCount = fleetCounts['Ford'] || 0
  const dodgeCount = fleetCounts['Dodge'] || 0
  const toyotaCount = fleetCounts['Toyota'] || 0
  const nissanCount = fleetCounts['Nissan'] || 0
  const gmcCount = fleetCounts['GMC'] || 0

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Truck className="w-12 h-12 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            THE <span className="text-white">FLEET</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Check out what our members are rolling in. Chevy, Ford, Dodge, Toyota, Nissan, GMC - all welcome.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-6 md:gap-12 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{chevyCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Chevy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{fordCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Ford</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{dodgeCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Dodge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{toyotaCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Toyota</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{nissanCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">Nissan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{gmcCount}</div>
              <div className="text-sm text-zinc-500 uppercase tracking-wider">GMC</div>
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
                <Link
                  key={image.id}
                  href={`/member/${image.member_id}`}
                  className="group relative aspect-square bg-zinc-900 border border-zinc-800 hover:border-white/50 transition-all duration-300 overflow-hidden block"
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

                  {/* Stock photo badge */}
                  {image.is_stock_photo && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="text-xs">
                        No Images Yet
                      </Badge>
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
                      {image.member?.member_number && (
                        <p className="text-zinc-400 text-xs font-mono mb-1">Member #{image.member.member_number}</p>
                      )}
                      {image.member?.truck_year && image.member?.truck_make && image.member?.truck_model && (
                        <p className="text-white font-bold">
                          {image.member.truck_year} {image.member.truck_make} {image.member.truck_model}
                        </p>
                      )}
                      <p className="text-zinc-400 text-sm">
                        {image.member?.first_name} {image.member?.last_name?.[0]}.
                      </p>
                      {image.member?.instagram_handle && (
                        <p className="text-white text-xs">@{image.member.instagram_handle}</p>
                      )}
                      {image.caption && (
                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{image.caption}</p>
                      )}
                    </div>
                  </div>
                </Link>
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
            WANT YOUR TRUCK <span className="text-white">FEATURED</span>?
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
