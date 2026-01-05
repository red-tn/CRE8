import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Pin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>
}

async function getBlogPosts(page: number = 1, limit: number = 10) {
  await headers()

  const offset = (page - 1) * limit

  const { count } = await supabaseAdmin
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      author:members(id, first_name, last_name, profile_photo_url)
    `)
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    posts: posts || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { posts, pagination } = await getBlogPosts(page)

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-white">BLOG</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            News, updates, and stories from the CRE8 Truck Club community.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
              >
                <div className="md:flex">
                  {/* Image */}
                  {post.image_url && (
                    <div className="md:w-72 flex-shrink-0">
                      <div className="aspect-video md:aspect-square md:h-full relative overflow-hidden">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.is_pinned && (
                          <div className="absolute top-3 left-3 bg-amber-500 text-black px-2 py-1 text-xs font-bold flex items-center gap-1">
                            <Pin className="w-3 h-3" />
                            PINNED
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.published_at)}
                      </div>
                      {post.author && (
                        <span>
                          By {post.author.first_name} {post.author.last_name}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-zinc-200 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-zinc-400 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 200)}...
                    </p>

                    <div className="mt-4 text-white font-bold text-sm uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                      Read More →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            {page > 1 ? (
              <Link href={`/blog?page=${page - 1}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled className="opacity-50">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}

            <span className="text-zinc-500 text-sm">
              Page {page} of {pagination.totalPages}
            </span>

            {page < pagination.totalPages ? (
              <Link href={`/blog?page=${page + 1}`}>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled className="opacity-50">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
