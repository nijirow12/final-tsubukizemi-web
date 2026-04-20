'use client'

import InstagramFeed from '@/components/sections/InstagramFeed'
import { useLanguage } from '@/lib/language-context'

export default function ActivitiesPage() {
  const { lang } = useLanguage()

  const subtitle = { ja: '津吹ゼミの活動を紹介します', en: 'Introducing the activities of Tsubuki Seminar', zh: '介绍津吹研讨会的活动' }[lang]
  const igText = { ja: '最新の活動はInstagramで発信しています', en: 'Follow our latest activities on Instagram', zh: '最新活动正在Instagram上发布' }[lang]

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 md:pt-36 pb-8 px-6 md:px-12 max-w-[960px] mx-auto">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight tracking-[0.2em] text-[#111827] leading-none">
          ACTIVITIES
        </h1>
        <p className="mt-4 text-[#94a3b8] text-[0.78rem] tracking-[0.15em]">
          {subtitle}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <section>
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
            Instagram
          </span>
          <p className="mt-3 text-[clamp(1.1rem,2.5vw,1.4rem)] font-light text-[#111827] leading-snug tracking-wide mb-8">
            {igText}
          </p>
          <InstagramFeed />
        </section>
      </div>
    </div>
  )
}
