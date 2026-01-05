import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // First get the post ID from slug
    const { data: post } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get approved comments for this post
    const { data: comments, error } = await supabaseAdmin
      .from('blog_comments')
      .select(`
        *,
        member:members(id, first_name, last_name, profile_photo_url)
      `)
      .eq('post_id', post.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    console.error('Error in comments API:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { content, guestName, guestEmail } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content required' }, { status: 400 })
    }

    // Get the post ID from slug
    const { data: post } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user is logged in
    let memberId = null
    try {
      const session = await getSession()
      if (session?.member) {
        memberId = session.member.id
      }
    } catch {
      // Not logged in, that's okay
    }

    // If not logged in, require guest name
    if (!memberId && (!guestName || guestName.trim().length === 0)) {
      return NextResponse.json({ error: 'Name required for guest comments' }, { status: 400 })
    }

    const { data: comment, error } = await supabaseAdmin
      .from('blog_comments')
      .insert({
        post_id: post.id,
        member_id: memberId,
        guest_name: memberId ? null : guestName,
        guest_email: memberId ? null : guestEmail,
        content: content.trim(),
        is_approved: false, // All comments need approval
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
    }

    return NextResponse.json({
      comment,
      message: 'Comment submitted for approval',
    })
  } catch (error) {
    console.error('Error in comments API:', error)
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 })
  }
}
