import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    await requireAdmin()

    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        author:members(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts: posts || [] })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const { title, content, excerpt, imageUrl, isPublished, isPinned, publishedAt } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    // Generate slug from title
    let slug = generateSlug(title)

    // Check if slug exists and make it unique
    const { data: existing } = await supabaseAdmin
      .from('blog_posts')
      .select('slug')
      .like('slug', `${slug}%`)

    if (existing && existing.length > 0) {
      slug = `${slug}-${existing.length + 1}`
    }

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        image_url: imageUrl || null,
        author_id: session.member.id,
        is_published: isPublished || false,
        is_pinned: isPinned || false,
        published_at: isPublished ? (publishedAt || new Date().toISOString()) : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, title, content, excerpt, imageUrl, isPublished, isPinned, publishedAt } = body

    if (!id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) {
      updates.title = title
      // Update slug if title changes
      let slug = generateSlug(title)
      const { data: existing } = await supabaseAdmin
        .from('blog_posts')
        .select('slug')
        .like('slug', `${slug}%`)
        .neq('id', id)

      if (existing && existing.length > 0) {
        slug = `${slug}-${existing.length + 1}`
      }
      updates.slug = slug
    }
    if (content !== undefined) updates.content = content
    if (excerpt !== undefined) updates.excerpt = excerpt
    if (imageUrl !== undefined) updates.image_url = imageUrl
    if (isPublished !== undefined) {
      updates.is_published = isPublished
      if (isPublished && !publishedAt) {
        // Set published_at if publishing for the first time
        const { data: currentPost } = await supabaseAdmin
          .from('blog_posts')
          .select('published_at')
          .eq('id', id)
          .single()

        if (!currentPost?.published_at) {
          updates.published_at = new Date().toISOString()
        }
      }
    }
    if (isPinned !== undefined) updates.is_pinned = isPinned
    if (publishedAt !== undefined) updates.published_at = publishedAt

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Delete comments first
    await supabaseAdmin
      .from('blog_comments')
      .delete()
      .eq('post_id', id)

    // Delete the post
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
