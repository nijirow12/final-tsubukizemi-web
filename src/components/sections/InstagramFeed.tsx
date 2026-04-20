'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

type Post = {
  id: string
  permalink: string
  mediaUrl: string
  mediaType: string
  thumbnailUrl?: string
  prunedCaption: string
  timestamp?: string
  sizes?: {
    medium?: { mediaUrl: string }
  }
}

type FeedData = {
  username?: string
  biography?: string
  profilePictureUrl?: string
  followersCount?: number
  posts?: Post[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function InstagramFeed() {
  const { lang } = useLanguage()
  const [feed, setFeed] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const feedId = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID

  useEffect(() => {
    if (!feedId) { setLoading(false); return }
    const controller = new AbortController()
    fetch(`https://feeds.behold.so/${feedId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: FeedData) => {
        setFeed({
          ...data,
          posts: (data.posts || [])
            .filter((p) => p.mediaType !== 'VIDEO' || p.thumbnailUrl)
            .slice(0, 6),
        })
      })
      .catch((err) => { if (err.name !== 'AbortError') console.error(err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [feedId])

  const profileUrl = feed?.username
    ? `https://www.instagram.com/${feed.username}/`
    : 'https://www.instagram.com/emcglobalzemi2025/'

  if (loading) {
    return (
      <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-center gap-4 border-b border-[#e2e8f0]">
          <div className="w-14 h-14 rounded-full bg-[rgba(15,23,42,0.06)] animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-32 rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
            <div className="h-2.5 w-48 rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square rounded-xl bg-[rgba(15,23,42,0.06)] animate-pulse" />
              <div className="h-2.5 w-3/4 rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
              <div className="h-2.5 w-1/2 rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const posts = feed?.posts ?? []

  return (
    <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden">

      {/* ── プロフィールヘッダー ── */}
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 px-6 py-5 border-b border-[#e2e8f0] no-underline group"
      >
        {feed?.profilePictureUrl ? (
          <div className="shrink-0 w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#e2e8f0] group-hover:ring-[#c7d2fe] transition-all duration-200">
            <img src={feed.profilePictureUrl} alt={feed.username ?? ''} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] ring-2 ring-[#e2e8f0]" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[0.9rem] font-medium text-[#111827] tracking-tight group-hover:text-[#4338ca] transition-colors duration-200">
            @{feed?.username ?? 'emcglobalzemi2025'}
          </p>
          {feed?.followersCount != null && (
            <p className="text-[0.72rem] text-[#94a3b8] mt-0.5">
              {feed.followersCount.toLocaleString()} {{ ja: 'フォロワー', en: 'followers', zh: '粉丝' }[lang]}
            </p>
          )}
          {feed?.biography && (
            <p className="text-[0.75rem] text-[#475569] mt-1 line-clamp-1 leading-snug">
              {feed.biography}
            </p>
          )}
        </div>
        <svg className="shrink-0 w-5 h-5 text-[#cbd5e1] group-hover:text-[#6366f1] transition-colors duration-200" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.25" cy="6.75" r="1" fill="currentColor" />
        </svg>
      </a>

      {/* ── 投稿グリッド ── */}
      <div className="grid grid-cols-2 gap-4 p-6">
        {posts.map((post, i) => {
          const imgUrl =
            post.mediaType === 'VIDEO'
              ? post.thumbnailUrl
              : post.sizes?.medium?.mediaUrl || post.mediaUrl
          return (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 no-underline"
            >
              {/* 画像 */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[rgba(15,23,42,0.04)]">
                <img
                  src={imgUrl}
                  alt={post.prunedCaption || ''}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {post.mediaType === 'CAROUSEL_ALBUM' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="6" width="14" height="14" rx="2" />
                      <path d="M6 2h14a2 2 0 012 2v14" />
                    </svg>
                  </div>
                )}
              </div>

              {/* テキスト */}
              <div className="flex flex-col gap-1 px-0.5">
                {post.timestamp && (
                  <time className="text-[0.65rem] text-[#cbd5e1] tracking-[0.08em]">
                    {formatDate(post.timestamp)}
                  </time>
                )}
                {post.prunedCaption && (
                  <p className="text-[0.8rem] text-[#475569] leading-[1.7] line-clamp-2 group-hover:text-[#111827] transition-colors duration-200">
                    {post.prunedCaption}
                  </p>
                )}
              </div>
            </a>
          )
        })}
      </div>

      {/* ── フッター ── */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-[#e2e8f0]">
        <p className="text-[0.7rem] text-[#cbd5e1] tracking-[0.1em] uppercase">{{ ja: '最新の投稿', en: 'Latest posts', zh: '最新帖子' }[lang]}</p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.72rem] text-[#94a3b8] hover:text-[#4338ca] tracking-[0.05em] no-underline transition-colors duration-200"
        >
          {{ ja: 'Instagramで見る →', en: 'View on Instagram →', zh: '在Instagram上查看 →' }[lang]}
        </a>
      </div>

    </div>
  )
}
