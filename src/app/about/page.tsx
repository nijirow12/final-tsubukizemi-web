'use client'

import { professorProfile } from '@/data/professor'
import { PIN_COORDINATES } from '@/data/pin-coordinates'
import { useLanguage } from '@/lib/language-context'
/* eslint-disable @next/next/no-img-element */

export default function AboutPage() {
  const { lang } = useLanguage()
  const t = lang === 'ja'
  const countryCount = Object.keys(PIN_COORDINATES).length

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 md:pt-36 pb-8 px-6 md:px-12 max-w-[960px] mx-auto">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight tracking-[0.2em] text-[#111827] leading-none">
          ABOUT
        </h1>
        <div className="mt-4 flex items-center gap-4 text-[#94a3b8] text-[0.78rem] tracking-[0.15em] uppercase">
          <span>{countryCount} Countries</span>
          <span className="w-6 h-px bg-[#d1d5db] inline-block" />
          <span>Southeast Asia</span>
        </div>
      </div>

      {/* Group Photo */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12">
        <img
          src="/images/tsubukizemiabout.webp"
          alt="津吹ゼミ集合写真"
          className="w-full rounded-lg object-cover aspect-[16/9]"
        />
      </div>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Mission */}
        <section className="mb-12 md:mb-14">
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
            Mission
          </span>
          {t ? (
            <>
              <p className="mt-6 text-[clamp(1rem,1.6vw,1.2rem)] text-[#1f2937] leading-[2] font-light">
                武蔵野大学アントレプレナーシップ学部 津吹ゼミは「グローバル」をテーマに、
                東南アジアを中心とした海外フィールドでの実践を通じて、学生の起業家精神とリーダーシップを育成しています。
              </p>
              <p className="mt-4 text-[0.92rem] text-[#64748b] leading-[1.9]">
                クラウドファンディング、現地企業との共同プロジェクト、チャレンジャー訪問など、
                机上の学びにとどまらない実践型教育を展開しています。
              </p>
            </>
          ) : (
            <>
              <p className="mt-6 text-[clamp(1rem,1.6vw,1.2rem)] text-[#1f2937] leading-[2] font-light">
                The Tsubuki Seminar at Musashino University&apos;s Faculty of Entrepreneurship focuses on &quot;Global&quot; as its core theme,
                fostering entrepreneurial spirit and leadership through hands-on practice in overseas fields, primarily in Southeast Asia.
              </p>
              <p className="mt-4 text-[0.92rem] text-[#64748b] leading-[1.9]">
                We deliver practice-based education that goes beyond the classroom — including crowdfunding,
                collaborative projects with local companies, and visits to challengers working abroad.
              </p>
            </>
          )}
        </section>

        <div className="w-12 h-px bg-[#e2e8f0]" />

        {/* Professor */}
        <section className="mt-12 md:mt-14">
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
            Professor
          </span>
          <div className="mt-8 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <img
              src="/images/tubukitatuya.jpg"
              alt={professorProfile.name}
              className="shrink-0 w-[180px] md:w-[280px] aspect-[3/4] rounded-lg object-cover"
            />
            <div className="flex flex-col justify-center">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium tracking-[0.02em] text-[#111827] leading-tight">
                {t ? professorProfile.name : professorProfile.nameEn}
              </h2>
              <p className="mt-1 text-[#b0b8c4] font-light text-[1rem] md:text-[1.15rem] tracking-[0.05em]">
                {t ? professorProfile.nameEn : professorProfile.name}
              </p>
              <p className="mt-6 text-[1rem] text-[#475569] leading-[2]">
                {t ? professorProfile.summary : professorProfile.summaryEn}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(t ? professorProfile.researchFields : professorProfile.researchFieldsEn).map((field) => (
                  <span
                    key={field}
                    className="px-4 py-1.5 text-[0.78rem] text-[#64748b] border border-[#e2e8f0] rounded-full"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
