import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get total count of published posts
    const { count } = await supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    // Get posts with pinned first, then by published date
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select(`
        *,
        author:members(id, first_name, last_name, profile_photo_url)
      `)
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error in blog API:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
