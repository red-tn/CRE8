import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import BlogComments from './BlogComments'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string) {
  await headers()

  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      author:members(id, first_name, last_name, profile_photo_url)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  return post
}

async function getComments(postId: string) {
  const { data: comments } = await supabaseAdmin
    .from('blog_comments')
    .select(`
      *,
      member:members(id, first_name, last_name, profile_photo_url)
    `)
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true })

  return comments || []
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const comments = await getComments(post.id)

  return (
    <div className="min-h-screen py-12">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Featured Image */}
        {post.image_url && (
          <div className="aspect-video mb-8 overflow-hidden bg-zinc-900 border border-zinc-800">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.profile_photo_url ? (
                  <img
                    src={post.author.profile_photo_url}
                    alt={post.author.first_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span>
                  {post.author.first_name} {post.author.last_name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none mb-12">
          {post.content.split('\n').map((paragraph: string, index: number) => (
            paragraph.trim() && (
              <p key={index} className="text-zinc-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            )
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 my-12" />

        {/* Comments Section */}
        <BlogComments postSlug={slug} initialComments={comments} />

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </article>
    </div>
  )
}
