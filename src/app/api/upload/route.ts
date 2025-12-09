import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'

// SECURITY: Whitelist of allowed file extensions and their magic bytes
const ALLOWED_FILES: Record<string, { mimes: string[]; magic: number[][] }> = {
  jpg: { mimes: ['image/jpeg'], magic: [[0xFF, 0xD8, 0xFF]] },
  jpeg: { mimes: ['image/jpeg'], magic: [[0xFF, 0xD8, 0xFF]] },
  png: { mimes: ['image/png'], magic: [[0x89, 0x50, 0x4E, 0x47]] },
  webp: { mimes: ['image/webp'], magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF header
  gif: { mimes: ['image/gif'], magic: [[0x47, 0x49, 0x46, 0x38]] }, // GIF8
  mp4: { mimes: ['video/mp4'], magic: [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]] }, // ftyp at offset 4
  mov: { mimes: ['video/quicktime'], magic: [[0x00, 0x00, 0x00]] },
  webm: { mimes: ['video/webm'], magic: [[0x1A, 0x45, 0xDF, 0xA3]] },
}

function validateFileMagic(buffer: Buffer, ext: string): boolean {
  const fileConfig = ALLOWED_FILES[ext.toLowerCase()]
  if (!fileConfig) return false

  // Special handling for mp4/mov - check for 'ftyp' at offset 4
  if (ext === 'mp4' || ext === 'mov') {
    const ftypCheck = buffer.slice(4, 8).toString('ascii')
    return ftypCheck === 'ftyp' || ftypCheck === 'moov' || ftypCheck === 'mdat'
  }

  // Check magic bytes at start of file
  return fileConfig.magic.some(magic =>
    magic.every((byte, i) => buffer[i] === byte)
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Must be logged in
    if (!session?.member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'member-media'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // SECURITY: Extract and validate file extension from whitelist only
    const nameParts = file.name.split('.')
    const ext = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : ''

    if (!ext || !ALLOWED_FILES[ext]) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, MP4, MOV, WebM'
      }, { status: 400 })
    }

    // Validate MIME type matches extension
    const allowedMimes = ALLOWED_FILES[ext].mimes
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({
        error: 'File type mismatch. Extension does not match content type.'
      }, { status: 400 })
    }

    // Validate file size (10MB for images, 100MB for videos)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File too large. Max size: ${isVideo ? '100MB' : '10MB'}`
      }, { status: 400 })
    }

    // Convert to buffer early so we can validate magic bytes
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // SECURITY: Validate file magic bytes match claimed type
    if (!validateFileMagic(buffer, ext)) {
      return NextResponse.json({
        error: 'Invalid file content. File does not match its extension.'
      }, { status: 400 })
    }

    // Generate unique filename with validated extension
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Determine storage path based on folder type
    const storageBucket = 'member-media'
    let path = ''

    if (folder === 'products') {
      // Admin uploading product images - need admin access
      if (!session.member.is_admin) {
        return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 })
      }
      path = `products/${filename}`
    } else if (folder === 'events') {
      // Admin uploading event images - need admin access
      if (!session.member.is_admin) {
        return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 401 })
      }
      path = `events/${filename}`
    } else {
      // Member uploading their own media
      path = `${session.member.id}/${filename}`
    }

    // Upload to Supabase Storage (buffer already created above for magic byte validation)
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
