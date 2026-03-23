import { PIN_COORDINATES, type CountryId } from '@/data/pin-coordinates'

const FEED_ID = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID || ''
const FEED_URL = `https://feeds.behold.so/${FEED_ID}`

const COUNTRY_KEYS = Object.keys(PIN_COORDINATES) as CountryId[]

// 日本語ハッシュタグ → CountryId のマッピング
const JA_TAG_MAP: Record<string, CountryId> = {
  '日本': 'japan',
  'カンボジア': 'cambodia',
  'ベトナム': 'vietnam',
  'タイ': 'thailand',
  'フィリピン': 'philippines',
  'インドネシア': 'indonesia',
  'マレーシア': 'malaysia',
  'シンガポール': 'singapore',
  'ミャンマー': 'myanmar',
  'ラオス': 'laos',
  'インド': 'india',
}

export type BeholdImageSizes = {
  small: { mediaUrl: string; width: number; height: number }
  medium: { mediaUrl: string; width: number; height: number }
  large: { mediaUrl: string; width: number; height: number }
  full: { mediaUrl: string; width: number; height: number }
}

export type BeholdChild = {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  sizes: BeholdImageSizes
}

export type BeholdPost = {
  id: string
  timestamp: string
  permalink: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  thumbnailUrl?: string
  caption: string
  prunedCaption: string
  hashtags: string[]
  mentions: string[]
  likeCount: number
  commentsCount: number
  sizes: BeholdImageSizes
  children?: BeholdChild[]
}

/**
 * 投稿から全画像URLを取得（カルーセルはchildren展開）
 */
export function getAllImages(post: BeholdPost): { url: string; permalink: string }[] {
  if (post.mediaType === 'CAROUSEL_ALBUM' && post.children?.length) {
    return post.children
      .filter((c) => c.mediaType === 'IMAGE')
      .map((c) => ({
        url: c.sizes?.small?.mediaUrl || c.mediaUrl,
        permalink: post.permalink,
      }))
  }
  if (post.mediaType === 'IMAGE') {
    return [{ url: post.sizes?.small?.mediaUrl || post.mediaUrl, permalink: post.permalink }]
  }
  // VIDEO — use thumbnail
  if (post.thumbnailUrl) {
    return [{ url: post.thumbnailUrl, permalink: post.permalink }]
  }
  return []
}

export type BeholdFeed = {
  username: string
  biography: string
  profilePictureUrl: string
  posts: BeholdPost[]
}

export async function fetchBeholdFeed(): Promise<BeholdFeed | null> {
  if (!FEED_ID) {
    console.warn('NEXT_PUBLIC_BEHOLD_FEED_ID not configured')
    return null
  }

  try {
    const res = await fetch(FEED_URL)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * 投稿のhashtags配列からピン座標マスタの国名と一致するものを返す
 */
export function extractCountryFromHashtags(hashtags: string[]): CountryId | null {
  for (const tag of hashtags) {
    // 英語タグ (cambodia, vietnam 等)
    const lower = tag.toLowerCase()
    if (COUNTRY_KEYS.includes(lower as CountryId)) {
      return lower as CountryId
    }
    // 日本語タグ (カンボジア, ベトナム 等)
    if (tag in JA_TAG_MAP) {
      return JA_TAG_MAP[tag]
    }
  }
  return null
}

/**
 * 投稿を国ごとにグルーピング
 */
export function groupPostsByCountry(
  posts: BeholdPost[]
): Record<string, BeholdPost[]> {
  const grouped: Record<string, BeholdPost[]> = {}

  for (const post of posts) {
    const country = extractCountryFromHashtags(post.hashtags || [])
    if (country) {
      if (!grouped[country]) grouped[country] = []
      grouped[country].push(post)
    }
  }

  return grouped
}
