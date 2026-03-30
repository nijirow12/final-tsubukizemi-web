import { NextRequest, NextResponse } from 'next/server'
import { getDrive } from '@/lib/drive-auth'

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get('folderId')
  const pageToken = request.nextUrl.searchParams.get('pageToken')

  if (!folderId) {
    return NextResponse.json({ error: 'folderId is required' }, { status: 400 })
  }

  try {
    const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`

    const drive = getDrive()
    const response = await drive.files.list({
      q,
      pageSize: 50,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, createdTime)',
      orderBy: 'createdTime desc',
    })

    return NextResponse.json({
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error listing images:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
