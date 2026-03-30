import { NextResponse } from 'next/server'
import { drive } from '@/lib/drive-auth'

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || ''

/**
 * ルートフォルダ配下を2階層探索し、国フォルダを全てフラットに返す
 * 構造: ルート → 地域(アジア等) → 国(🇰🇭カンボジア等)
 */
async function listAllCountryFolders() {
  if (!ROOT_FOLDER_ID) return []

  // 第1階層: 地域フォルダ
  const regionRes = await drive.files.list({
    q: `'${ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    pageSize: 100,
    fields: 'files(id, name)',
  })

  const regionFolders = regionRes.data.files || []
  const allCountryFolders: { id: string; name: string }[] = []

  // 第2階層: 各地域内の国フォルダ
  await Promise.all(
    regionFolders.map(async (region) => {
      const countryRes = await drive.files.list({
        q: `'${region.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        pageSize: 100,
        fields: 'files(id, name)',
      })
      for (const folder of countryRes.data.files || []) {
        allCountryFolders.push({ id: folder.id!, name: folder.name! })
      }
    })
  )

  return allCountryFolders
}

export async function GET() {
  try {
    const folders = await listAllCountryFolders()
    return NextResponse.json({ folders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error listing folders:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
