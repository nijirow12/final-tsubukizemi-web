import { NextRequest, NextResponse } from 'next/server'
import { getDrive } from '@/lib/drive-auth'

export async function GET(request: NextRequest) {
  const fileIdsParam = request.nextUrl.searchParams.get('fileIds')
  if (!fileIdsParam) {
    return NextResponse.json({ error: 'fileIds is required' }, { status: 400 })
  }

  const fileIds = fileIdsParam.split(',').slice(0, 20)

  try {
    const drive = getDrive()

    const results = await Promise.all(
      fileIds.map(async (fileId) => {
        try {
          const meta = await drive.files.get({ fileId, fields: 'thumbnailLink' })
          if (meta.data.thumbnailLink) {
            const thumbUrl = meta.data.thumbnailLink.replace(/=s\d+$/, '=s400')
            const res = await fetch(thumbUrl)
            if (res.ok) {
              const buf = await res.arrayBuffer()
              const base64 = Buffer.from(buf).toString('base64')
              return { fileId, data: `data:image/jpeg;base64,${base64}` }
            }
          }
          return { fileId, data: null }
        } catch {
          return { fileId, data: null }
        }
      })
    )

    const images: Record<string, string> = {}
    for (const r of results) {
      if (r.data) images[r.fileId] = r.data
    }

    return NextResponse.json(
      { images },
      {
        headers: {
          'Cache-Control':
            'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
        },
      }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error batch-fetching images:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
