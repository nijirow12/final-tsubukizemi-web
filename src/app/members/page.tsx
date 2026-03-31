'use client'

import { professorProfile } from '@/data/professor'
import { useLanguage } from '@/lib/language-context'
/* eslint-disable @next/next/no-img-element */

const members = [
  { id: 'm1', name: '山田 花子', nameEn: 'Hanako Yamada', role: '4年 / プロジェクトリーダー', roleEn: '4th Year / Project Leader' },
  { id: 'm2', name: '鈴木 一郎', nameEn: 'Ichiro Suzuki', role: '3年 / サプライチェーン担当', roleEn: '3rd Year / Supply Chain' },
  { id: 'm3', name: '小林 里奈', nameEn: 'Rina Kobayashi', role: '3年 / デザインリード', roleEn: '3rd Year / Design Lead' },
  { id: 'm4', name: '佐藤 光', nameEn: 'Hikaru Sato', role: '2年 / データ＆マーケティング', roleEn: '2nd Year / Data & Marketing' },
  { id: 'm5', name: 'アリサ 王', nameEn: 'Alisa Wang', role: '交換留学生', roleEn: 'Exchange Student' },
  { id: 'm6', name: '高橋 悠真', nameEn: 'Yuma Takahashi', role: '4年 / アルムナイメンター', roleEn: '4th Year / Alumni Mentor' },
]

export default function MembersPage() {
  const { lang } = useLanguage()
  const t = lang === 'ja'

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 md:pt-36 pb-8 px-6 md:px-12 max-w-[960px] mx-auto">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight tracking-[0.2em] text-[#111827] leading-none">
          MEMBERS
        </h1>
        <p className="mt-4 text-[#94a3b8] text-[0.78rem] tracking-[0.15em]">
          {t ? '津吹ゼミのメンバーを紹介します' : 'Meet the members of Tsubuki Seminar'}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* Professor */}
        <section>
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
            Professor
          </span>
          <div className="mt-10 flex flex-col md:flex-row gap-10 md:gap-14 items-start">
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

        <div className="w-12 h-px bg-[#e2e8f0] my-16 md:my-20" />

        {/* Members */}
        <section>
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
            Members
          </span>
          <div className="mt-10 flex flex-col">
            {members.map((member, i) => (
              <article
                key={member.id}
                className={`py-6 flex items-center gap-5 ${i < members.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}
              >
                <div className="shrink-0 w-11 h-11 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#475569] text-[0.9rem] font-medium">
                  {member.name[0]}
                </div>
                <div>
                  <h3 className="text-[1rem] font-medium text-[#111827]">
                    {t ? member.name : member.nameEn}
                  </h3>
                  <p className="mt-0.5 text-[0.82rem] text-[#94a3b8]">
                    {t ? member.role : member.roleEn}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
