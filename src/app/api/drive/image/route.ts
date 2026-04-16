import { NextRequest, NextResponse } from 'next/server'
import { getDrive } from '@/lib/drive-auth'

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId')

  if (!fileId) {
    return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
  }

  try {
    const drive = getDrive()
    const meta = await drive.files.get({
      fileId,
      fields: 'thumbnailLink',
    })

    const IMMUTABLE_CACHE =
      'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable'

    // 全画像をthumbnailLink経由で軽量JPEG配信（HEIC対応 + 軽量化）
    if (meta.data.thumbnailLink) {
      const thumbUrl = meta.data.thumbnailLink.replace(/=s\d+$/, '=s400')
      const thumbRes = await fetch(thumbUrl)
      if (thumbRes.ok) {
        const data = await thumbRes.arrayBuffer()
        return new NextResponse(data, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': IMMUTABLE_CACHE,
          },
        })
      }
    }

    // thumbnailLink が無い場合のフォールバック: 原画を返す
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    return new NextResponse(response.data as ArrayBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': IMMUTABLE_CACHE,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching image:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
