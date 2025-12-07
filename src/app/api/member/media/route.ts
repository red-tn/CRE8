import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await requireAuth()

    const { data: media, error } = await supabaseAdmin
      .from('member_media')
      .select('*')
      .eq('member_id', session.member.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching media:', error)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    return NextResponse.json({ media: media || [] })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { url, type, caption, is_profile } = body

    if (!url || !type) {
      return NextResponse.json({ error: 'URL and type are required' }, { status: 400 })
    }

    // If setting as profile photo, update member record
    if (is_profile && type === 'image') {
      await supabaseAdmin
        .from('members')
        .update({ profile_photo_url: url })
        .eq('id', session.member.id)
    }

    const { data: media, error } = await supabaseAdmin
      .from('member_media')
      .insert({
        member_id: session.member.id,
        url,
        type,
        caption: caption || null,
        is_profile: is_profile || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving media:', error)
      return NextResponse.json({ error: 'Failed to save media' }, { status: 500 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to save media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: media } = await supabaseAdmin
      .from('member_media')
      .select('*')
      .eq('id', mediaId)
      .eq('member_id', session.member.id)
      .single()

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from storage if it's a Supabase URL
    if (media.url.includes('supabase')) {
      const path = media.url.split('/').pop()
      if (path) {
        await supabaseAdmin.storage.from('member-media').remove([`${session.member.id}/${path}`])
      }
    }

    // Delete record
    await supabaseAdmin.from('member_media').delete().eq('id', mediaId)

    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
