'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'

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

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const feedId = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID

  useEffect(() => {
    if (!feedId) {
      setLoading(false)
      return
    }
    fetch(`https://feeds.behold.so/${feedId}`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = (data.posts || [])
          .filter((p: Post) => p.mediaType !== 'VIDEO' || p.thumbnailUrl)
          .slice(0, 2)
        setPosts(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [feedId])

  const instagramUrl = 'https://www.instagram.com/emcglobalzemi2025/'

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-6">
            <div className="shrink-0 w-[200px] md:w-[260px] aspect-square rounded-lg bg-[rgba(15,23,42,0.06)] animate-pulse" />
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-3 w-24 rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
              <div className="h-3 w-full rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
              <div className="h-3 w-3/4 rounded bg-[rgba(15,23,42,0.06)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => {
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
            className="group flex flex-col md:flex-row gap-5 md:gap-6 no-underline"
          >
            <div className="shrink-0 w-full md:w-[260px] aspect-square rounded-lg overflow-hidden bg-[rgba(15,23,42,0.06)]">
              <img
                src={imgUrl}
                alt={post.prunedCaption || ''}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-2 py-1">
              {post.timestamp && (
                <time className="text-[0.72rem] text-[#94a3b8] tracking-[0.1em]">
                  {formatDate(post.timestamp)}
                </time>
              )}
              <p className="text-[0.88rem] text-[#475569] leading-[1.8] line-clamp-5">
                {post.prunedCaption}
              </p>
            </div>
          </a>
        )
      })}

      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start inline-flex items-center gap-2 text-[0.82rem] text-[#94a3b8] tracking-[0.1em] no-underline hover:text-[#111827] transition-colors duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17.25" cy="6.75" r="1" fill="currentColor" />
        </svg>
        @emcglobalzemi2025
      </a>
    </div>
  )
}
