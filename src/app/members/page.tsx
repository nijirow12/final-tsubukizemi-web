'use client'

import { professorProfile } from '@/data/professor'
import { useLanguage } from '@/lib/language-context'
import { useState, useEffect } from 'react'
import type { DemoMember } from '@/data/members-demo'
/* eslint-disable @next/next/no-img-element */

// ── アイコン ──────────────────────────────────────────────────────────
function LinkIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  )
}

// ── メンバーカード ─────────────────────────────────────────────────────
function MemberCard({ member, lang }: { member: DemoMember; lang: 'ja' | 'en' }) {
  const [isOpen, setIsOpen] = useState(false)
  const t = lang === 'ja'

  return (
    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
      {/* ヘッダー行（クリックで展開） */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* アバター */}
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="shrink-0 w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] flex items-center justify-center text-[#4338ca] text-[1.3rem] font-semibold select-none">
            {member.name[0]}
          </div>
        )}

        {/* 名前 + 国タグ */}
        <div className="flex-1 min-w-0">
          <p className="text-[1.05rem] font-medium text-[#111827] leading-tight">
            {t ? member.name : member.nameEn}
          </p>
          <p className="text-[0.8rem] text-[#94a3b8] mt-0.5">
            {t ? member.nameEn : member.name}
          </p>
          {/* 国タグ（折りたたみ時のみ） */}
          {!isOpen && member.countries.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {member.countries.slice(0, 4).map((c) => (
                <span key={c} className="px-2.5 py-0.5 text-[0.7rem] bg-[#f1f5f9] text-[#64748b] rounded-full">
                  {c}
                </span>
              ))}
              {member.countries.length > 4 && (
                <span className="px-2.5 py-0.5 text-[0.7rem] text-[#94a3b8] bg-[#f1f5f9] rounded-full">
                  +{member.countries.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* シェブロン */}
        <svg
          className={`w-4 h-4 shrink-0 text-[#94a3b8] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 展開エリア */}
      {isOpen && (
        <div className="px-5 pb-5 border-t border-[#f1f5f9] space-y-4">
          {/* 自己紹介 */}
          <div className="mt-4">
            <h4 className="text-[0.68rem] tracking-[0.18em] uppercase text-[#94a3b8] font-medium mb-1.5">
              {t ? '自己紹介' : 'About'}
            </h4>
            <p className="text-[0.9rem] text-[#475569] leading-[1.85]">
              {t ? member.introduction : member.introductionEn}
            </p>
          </div>

          {/* プロジェクト */}
          <div>
            <h4 className="text-[0.68rem] tracking-[0.18em] uppercase text-[#94a3b8] font-medium mb-1.5">
              {t ? 'プロジェクト・課外活動' : 'Projects & Activities'}
            </h4>
            <div className="flex gap-2 text-[0.88rem] text-[#475569]">
              <BriefcaseIcon />
              <p className="leading-[1.8]">{t ? member.projects : member.projectsEn}</p>
            </div>
          </div>

          {/* 訪問国 */}
          <div>
            <h4 className="text-[0.68rem] tracking-[0.18em] uppercase text-[#94a3b8] font-medium mb-1.5">
              {t ? '行ったことある国・好きな国' : 'Countries Visited / Favorites'}
            </h4>
            <div className="flex gap-2 items-start">
              <GlobeIcon />
              <div className="flex flex-wrap gap-1.5">
                {member.countries.map((c) => (
                  <span key={c} className="px-3 py-1 text-[0.75rem] text-[#64748b] border border-[#e2e8f0] rounded-full bg-[#f8fafc]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SNS / リンク */}
          {member.socialUrl && (
            <div>
              <h4 className="text-[0.68rem] tracking-[0.18em] uppercase text-[#94a3b8] font-medium mb-1.5">
                {t ? 'SNS / リンク' : 'Links'}
              </h4>
              <a
                href={member.socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.82rem] text-[#6366f1] hover:text-[#4338ca] transition-colors"
              >
                <LinkIcon />
                {member.socialUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── セクションラベル ───────────────────────────────────────────────────
function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">{label}</span>
      <span className="text-[0.72rem] text-[#cbd5e1] tabular-nums">{count}</span>
    </div>
  )
}

// ── メインページ ──────────────────────────────────────────────────────
export default function MembersPage() {
  const { lang } = useLanguage()
  const t = lang === 'ja'
  const [members, setMembers] = useState<DemoMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data: DemoMember[]) => setMembers(data))
      .catch((err) => console.error('Failed to fetch members:', err))
      .finally(() => setLoading(false))
  }, [])

  const active = members.filter((m) => !m.isOB)
  const ob = members.filter((m) => m.isOB)

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

      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">

        {/* ── 教授 ── */}
        <section>
          <SectionLabel label="Professor" count={1} />
          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
            <img
              src="/images/tubukitatuya.jpg"
              alt={professorProfile.name}
              className="shrink-0 w-[180px] md:w-[240px] aspect-[3/4] rounded-xl object-cover"
            />
            <div className="flex flex-col justify-center">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium tracking-[0.02em] text-[#111827] leading-tight">
                {t ? professorProfile.name : professorProfile.nameEn}
              </h2>
              <p className="mt-1 text-[#b0b8c4] font-light text-[1rem] md:text-[1.1rem] tracking-[0.05em]">
                {t ? professorProfile.nameEn : professorProfile.name}
              </p>
              <p className="mt-6 text-[0.95rem] text-[#475569] leading-[2]">
                {t ? professorProfile.summary : professorProfile.summaryEn}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(t ? professorProfile.researchFields : professorProfile.researchFieldsEn).map((field) => (
                  <span key={field} className="px-4 py-1.5 text-[0.78rem] text-[#64748b] border border-[#e2e8f0] rounded-full">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="w-12 h-px bg-[#e2e8f0] my-16 md:my-20" />

        {/* ── 現役生 ── */}
        <section>
          <SectionLabel label={t ? '現役生' : 'Current Members'} count={active.length} />
          {loading ? (
            <p className="text-[#94a3b8] text-[0.9rem]">{t ? '読み込み中...' : 'Loading...'}</p>
          ) : active.length === 0 ? (
            <p className="text-[#94a3b8] text-[0.9rem]">
              {t ? 'メンバーが登録されていません' : 'No members registered yet'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {active.map((member) => (
                <MemberCard key={member.id} member={member} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {/* ── OB / OG ── */}
        {!loading && ob.length > 0 && (
          <>
            <div className="w-12 h-px bg-[#e2e8f0] my-16 md:my-20" />
            <section>
              <SectionLabel label="OB / OG" count={ob.length} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {ob.map((member) => (
                  <MemberCard key={member.id} member={member} lang={lang} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
