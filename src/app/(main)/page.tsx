import Link from 'next/link'
import Image from 'next/image'
import { Users, Calendar, ShoppingBag, Truck, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getStockTruckPhoto } from '@/lib/stockPhotos'
import { headers } from 'next/headers'
import { AdBanner } from '@/components/ads/AdBanner'
import { formatDate } from '@/lib/utils'

// Force dynamic rendering to always show fresh data
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

async function getHomePageData() {
  // Force dynamic by reading headers
  await headers()
  // Get member count
  const { count: memberCount } = await supabaseAdmin
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get truck brand counts
  const { data: members } = await supabaseAdmin
    .from('members')
    .select('truck_make')
    .eq('is_active', true)
    .not('truck_make', 'is', null)

  const brandCounts = {
    Chevy: members?.filter(m => m.truck_make === 'Chevy').length || 0,
    Ford: members?.filter(m => m.truck_make === 'Ford').length || 0,
    Dodge: members?.filter(m => m.truck_make === 'Dodge').length || 0,
    Toyota: members?.filter(m => m.truck_make === 'Toyota').length || 0,
    Nissan: members?.filter(m => m.truck_make === 'Nissan').length || 0,
    GMC: members?.filter(m => m.truck_make === 'GMC').length || 0,
  }

  // Get members with profile photos or truck photos for the fleet section
  const { data: fleetMembers } = await supabaseAdmin
    .from('members')
    .select('id, first_name, truck_year, truck_make, truck_model, profile_photo_url, instagram_handle')
    .eq('is_active', true)
    .not('truck_make', 'is', null)
    .order('created_at', { ascending: false })
    .limit(8)

  // Get media for fleet members
  const memberIds = fleetMembers?.map(m => m.id) || []
  const { data: memberMedia } = await supabaseAdmin
    .from('member_media')
    .select('*')
    .in('member_id', memberIds)
    .eq('type', 'image')
    .order('created_at', { ascending: false })

  // Combine member data with their first media item (or stock photo fallback)
  const fleetData = fleetMembers?.map(member => {
    const media = memberMedia?.find(m => m.member_id === member.id)
    const hasOwnImage = !!(media?.url || member.profile_photo_url)
    return {
      ...member,
      display_image: media?.url || member.profile_photo_url || getStockTruckPhoto(member.truck_make, member.truck_model),
      is_stock_photo: !hasOwnImage
    }
  }) || []

  // Get featured products for shop strip
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, price, member_price, image_url, images, is_members_only')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get latest blog posts
  const { data: blogPosts } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, image_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(5)

  return {
    memberCount: memberCount || 0,
    brandCounts,
    fleetData,
    products: products || [],
    blogPosts: blogPosts || [],
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export default async function HomePage() {
  const { memberCount, brandCounts, fleetData, products, blogPosts } = await getHomePageData()
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black" />
        <div className="absolute inset-0 texture-overlay" />

        {/* Amber glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/20 rounded-full blur-[150px]" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="CRE8 Truck Club"
              width={400}
              height={200}
              className="h-56 md:h-72 lg:h-96 w-auto"
              priority
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Join the Club
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Shop Merch
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-zinc-900/80 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{memberCount}+</div>
              <div className="text-zinc-500 uppercase tracking-wider text-sm">Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">50+</div>
              <div className="text-zinc-500 uppercase tracking-wider text-sm">Events/Year</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">3</div>
              <div className="text-zinc-500 uppercase tracking-wider text-sm">Brands</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">1</div>
              <div className="text-zinc-500 uppercase tracking-wider text-sm">Family</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              WHY <span className="text-white">CRE8</span>?
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              More than a club - we&apos;re a community of truck enthusiasts who live and breathe the lifestyle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-white/50 transition-colors group">
              <Users className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">The Crew</h3>
              <p className="text-zinc-500 text-sm">
                Connect with {memberCount}+ members who share your passion. Real friendships, real builds.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-white/50 transition-colors group">
              <Calendar className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Events</h3>
              <p className="text-zinc-500 text-sm">
                Weekly meets, monthly cruises, and exclusive member-only events. We stay active.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-white/50 transition-colors group">
              <ShoppingBag className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Exclusive Merch</h3>
              <p className="text-zinc-500 text-sm">
                Member pricing on all gear. Rep the crown with exclusive drops.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-white/50 transition-colors group">
              <Truck className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Build Support</h3>
              <p className="text-zinc-500 text-sm">
                Get advice, resources, and help with your build from experienced members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      {blogPosts.length > 0 && (
        <section className="py-16 bg-zinc-900/50 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-1">
                  LATEST <span className="text-white">NEWS</span>
                </h2>
                <p className="text-zinc-500 text-sm">Updates from the CRE8 community</p>
              </div>
              <Link href="/blog" className="text-white hover:text-zinc-200 font-bold text-sm uppercase tracking-wider hidden sm:flex items-center gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-black border border-zinc-800 hover:border-zinc-700 transition-colors group block"
                >
                  {post.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-zinc-500 mb-2">{formatDate(post.published_at)}</p>
                    <h3 className="font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {post.excerpt || post.content.substring(0, 100)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Additional posts - smaller */}
            {blogPosts.length > 3 && (
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {blogPosts.slice(3, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-4 bg-black border border-zinc-800 hover:border-zinc-700 transition-colors p-4 group"
                  >
                    {post.image_url && (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500 mb-1">{formatDate(post.published_at)}</p>
                      <h3 className="font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile View All */}
            <div className="mt-6 sm:hidden">
              <Link href="/blog" className="text-white hover:text-zinc-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                View All News <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Ad Section - Between Features and Fleet */}
      <section className="py-8 bg-black border-y border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner slot="9516253089" format="auto" />
        </div>
      </section>

      {/* Fleet Gallery Preview */}
      <section className="py-24 bg-zinc-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                THE <span className="text-white">FLEET</span>
              </h2>
              <p className="text-zinc-500">Check out what our members are rolling in.</p>
            </div>
            <Link href="/gallery" className="text-white hover:text-zinc-200 font-bold text-sm uppercase tracking-wider hidden md:flex items-center gap-2">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fleetData.length > 0 ? (
              fleetData.map((member) => (
                <Link
                  key={member.id}
                  href={`/member/${member.id}`}
                  className="aspect-square bg-zinc-800 border border-zinc-700 hover:border-white/50 transition-colors relative group overflow-hidden block"
                >
                  <img
                    src={member.display_image}
                    alt={`${member.truck_year} ${member.truck_make} ${member.truck_model}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Stock photo badge */}
                  {member.is_stock_photo && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="text-xs">
                        No Images Yet
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div>
                      <p className="text-white font-bold text-sm">
                        {member.truck_year} {member.truck_make} {member.truck_model}
                      </p>
                      <p className="text-zinc-400 text-xs">
                        {member.instagram_handle || member.first_name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Placeholder when no members yet
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-800 border border-zinc-700 hover:border-white/50 transition-colors relative group overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    <Truck className="w-12 h-12" />
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/gallery" className="mt-8 text-white hover:text-zinc-200 font-bold text-sm uppercase tracking-wider flex md:hidden items-center justify-center gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Shop Strip Section */}
      {products.length > 0 && (
        <section className="py-16 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-1">
                  SHOP <span className="text-white">MERCH</span>
                </h2>
                <p className="text-zinc-500 text-sm">Rep the crown. Members get exclusive pricing.</p>
              </div>
              <Link href="/shop" className="text-white hover:text-zinc-200 font-bold text-sm uppercase tracking-wider hidden sm:flex items-center gap-2">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Scrolling product strip */}
          <div className="relative">
            {/* Gradient fades - only show when scrollable */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            {/* Scrollable container */}
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-4 px-4 sm:px-6 lg:px-8 pb-4 justify-center min-w-max">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop?product=${product.id}`}
                    className="flex-shrink-0 w-48 sm:w-56 group"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-zinc-900 border border-zinc-800 group-hover:border-white/50 transition-colors relative overflow-hidden mb-3">
                      {product.images?.[0] || product.image_url ? (
                        <img
                          src={product.images?.[0] || product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      {product.is_members_only && (
                        <div className="absolute top-2 left-2 bg-white text-black text-xs font-bold px-2 py-1">
                          MEMBERS ONLY
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="font-bold text-sm text-white group-hover:text-white transition-colors truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-bold text-sm">
                        {formatCurrency(product.price)}
                      </span>
                      {product.member_price && (
                        <span className="text-zinc-500 text-xs">
                          Member: {formatCurrency(product.member_price)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {/* View All Card */}
                <Link
                  href="/shop"
                  className="flex-shrink-0 w-48 sm:w-56 aspect-square bg-zinc-900 border border-zinc-800 hover:border-white transition-colors flex flex-col items-center justify-center group"
                >
                  <ShoppingBag className="w-10 h-10 text-zinc-600 group-hover:text-white transition-colors mb-3" />
                  <span className="text-zinc-400 group-hover:text-white font-bold text-sm uppercase tracking-wider transition-colors">
                    View All
                  </span>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors mt-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile View All Link */}
          <div className="mt-6 px-4 sm:hidden">
            <Link href="/shop" className="text-white hover:text-zinc-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
              View All Products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/logo.png"
            alt="CRE8 Truck Club"
            width={120}
            height={60}
            className="h-16 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            READY TO <span className="text-white">JOIN</span>?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
            $50/year gets you access to everything. Exclusive events, member pricing on merch,
            and a community that&apos;s got your back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">
                Join Now - $50/year
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-zinc-600 text-sm mt-6">
            Invite code required. Know a member? Get yours.
          </p>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-zinc-900/80 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-zinc-600 uppercase tracking-wider text-sm mb-8">
            We Roll With
          </p>
          <div className="flex justify-center items-center gap-6 md:gap-12 flex-wrap">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-zinc-500 transition-colors cursor-default">
                CHEVY
              </div>
              <div className="text-white font-bold mt-1">{brandCounts.Chevy}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-zinc-500 transition-colors cursor-default">
                FORD
              </div>
              <div className="text-white font-bold mt-1">{brandCounts.Ford}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-zinc-500 transition-colors cursor-default">
                DODGE
              </div>
              <div className="text-white font-bold mt-1">{brandCounts.Dodge}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-zinc-500 transition-colors cursor-default">
                TOYOTA
              </div>
              <div className="text-white font-bold mt-1">{brandCounts.Toyota}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-zinc-500 transition-colors cursor-default">
                NISSAN
              </div>
              <div className="text-white font-bold mt-1">{brandCounts.Nissan}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-zinc-700 hover:text-zinc-500 transition-colors cursor-default">
                GMC
              </div>
              <div className="text-white font-bold mt-1">{brandCounts.GMC}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
