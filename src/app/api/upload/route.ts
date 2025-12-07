import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Must be logged in as member or admin
    if (!session?.member && !session?.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'member-media'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, MP4, MOV, WebM' }, { status: 400 })
    }

    // Validate file size (10MB for images, 100MB for videos)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: ${isVideo ? '100MB' : '10MB'}`
      }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Determine storage path based on folder type
    let storageBucket = 'member-media'
    let path = ''

    if (folder === 'products') {
      // Admin uploading product images - need admin access
      if (!session.admin) {
        return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 })
      }
      path = `products/${filename}`
    } else {
      // Member uploading their own media
      if (!session.member) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      path = `${session.member.id}/${filename}`
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(storageBucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(storageBucket)
      .getPublicUrl(path)

    return NextResponse.json({
      url: publicUrl,
      type: isVideo ? 'video' : 'image',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
