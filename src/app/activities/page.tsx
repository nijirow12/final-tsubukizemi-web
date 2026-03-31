'use client'

import InstagramFeed from '@/components/sections/InstagramFeed'
import { useLanguage } from '@/lib/language-context'

export default function ActivitiesPage() {
  const { lang } = useLanguage()
  const t = lang === 'ja'

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 md:pt-36 pb-8 px-6 md:px-12 max-w-[960px] mx-auto">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight tracking-[0.2em] text-[#111827] leading-none">
          ACTIVITIES
        </h1>
        <p className="mt-4 text-[#94a3b8] text-[0.78rem] tracking-[0.15em]">
          {t ? '津吹ゼミの活動を紹介します' : 'Introducing the activities of Tsubuki Seminar'}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <section>
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
            Instagram
          </span>
          <p className="mt-2 text-[0.85rem] text-[#94a3b8] mb-8">
            {t ? '最新の活動はInstagramで発信しています' : 'Follow our latest activities on Instagram'}
          </p>
          <InstagramFeed />
        </section>
      </div>
    </div>
  )
}
