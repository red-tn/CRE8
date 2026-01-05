import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        author:members(id, first_name, last_name, profile_photo_url)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
