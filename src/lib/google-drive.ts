import { PIN_COORDINATES, type CountryId } from '@/data/pin-coordinates'

export type DriveImage = {
  id: string
  name: string
  url: string
}

type DriveFolder = {
  id: string
  name: string
}

// 国名キーワード一覧（日本語・英語）をCountryIdに紐づけ
const COUNTRY_KEYWORDS: { keyword: string; id: CountryId }[] = []
for (const [id, coord] of Object.entries(PIN_COORDINATES)) {
  COUNTRY_KEYWORDS.push({ keyword: coord.labelJa, id: id as CountryId })
  COUNTRY_KEYWORDS.push({ keyword: coord.label.toLowerCase(), id: id as CountryId })
}
// 長い名前から先にマッチ（「インド」より「インドネシア」を優先）
COUNTRY_KEYWORDS.sort((a, b) => b.keyword.length - a.keyword.length)

/**
 * フォルダ名からCountryIdを推定（「🇰🇭カンボジア」→ cambodia）
 */
function matchFolderToCountry(folderName: string): CountryId | null {
  const name = folderName.trim()
  const nameLower = name.toLowerCase()
  for (const { keyword, id } of COUNTRY_KEYWORDS) {
    if (nameLower.includes(keyword) || name.includes(keyword)) {
      return id
    }
  }
  return null
}

/**
 * Google Driveのフォルダ一覧を取得し、国IDにマッピング
 */
export async function fetchDriveFolderMap(): Promise<Record<CountryId, string>> {
  const res = await fetch('/api/drive/folders')
  if (!res.ok) return {} as Record<CountryId, string>

  const data: { folders: DriveFolder[] } = await res.json()
  const map: Partial<Record<CountryId, string>> = {}

  for (const folder of data.folders) {
    const countryId = matchFolderToCountry(folder.name)
    if (countryId && !map[countryId]) {
      map[countryId] = folder.id
    }
  }

  return map as Record<CountryId, string>
}

/**
 * 指定フォルダの画像一覧を取得
 */
export async function fetchDriveImages(folderId: string): Promise<DriveImage[]> {
  const res = await fetch(`/api/drive/images?folderId=${encodeURIComponent(folderId)}`)
  if (!res.ok) return []

  const data: { files: { id: string; name: string }[] } = await res.json()

  return data.files.map((f) => ({
    id: f.id,
    name: f.name,
    url: `/api/drive/image?fileId=${encodeURIComponent(f.id)}`,
  }))
}

/**
 * 全国の画像を一括取得
 */
export async function fetchAllDriveImages(): Promise<Record<CountryId, DriveImage[]>> {
  const folderMap = await fetchDriveFolderMap()
  const result: Partial<Record<CountryId, DriveImage[]>> = {}

  const entries = Object.entries(folderMap) as [CountryId, string][]
  const fetches = entries.map(async ([countryId, folderId]) => {
    const images = await fetchDriveImages(folderId)
    result[countryId] = images
  })

  await Promise.all(fetches)
  return result as Record<CountryId, DriveImage[]>
}

/**
 * 全国の画像を逐次取得（1カ国取得するたびにコールバック）
 */
export async function fetchAllDriveImagesProgressive(
  onUpdate: (images: Record<CountryId, DriveImage[]>) => void
): Promise<void> {
  const folderMap = await fetchDriveFolderMap()
  const result: Partial<Record<CountryId, DriveImage[]>> = {}

  const entries = Object.entries(folderMap) as [CountryId, string][]
  const fetches = entries.map(async ([countryId, folderId]) => {
    const images = await fetchDriveImages(folderId)
    result[countryId] = images
    onUpdate({ ...result } as Record<CountryId, DriveImage[]>)
  })

  await Promise.all(fetches)
}
