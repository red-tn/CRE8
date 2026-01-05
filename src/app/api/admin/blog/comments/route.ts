import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const pending = searchParams.get('pending') === 'true'

    let query = supabaseAdmin
      .from('blog_comments')
      .select(`
        *,
        member:members(id, first_name, last_name, email),
        post:blog_posts(id, title, slug)
      `)
      .order('created_at', { ascending: false })

    if (pending) {
      query = query.eq('is_approved', false)
    }

    const { data: comments, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, isApproved } = body

    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const { data: comment, error } = await supabaseAdmin
      .from('blog_comments')
      .update({ is_approved: isApproved })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating comment:', error)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
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

    const { error } = await supabaseAdmin
      .from('blog_comments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
