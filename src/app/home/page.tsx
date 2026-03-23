import Image from 'next/image'
import Link from 'next/link'
import { professorProfile } from '@/data/professor'

type ActivityColumn = {
  title: string
  items: string[]
}

const activityColumns: ActivityColumn[] = [
  {
    title: '海外挑戦の実例',
    items: ['屋台販売', 'KIZUNA Fesでの出店'],
  },
  {
    title: 'クラウドファンディングの取り組み',
    items: ['カンボジアの障がい者施設の支援'],
  },
  {
    title: '現地で出会うチャレンジャー',
    items: [
      'Banesh 代表 飯塚はる香さん',
      '株式会社スパイスアップ・アカデミア 代表取締役 森山たつをさん',
      '国須一さん カンボジア AEON MALL コーポレート部門',
      '井尻龍太さん Ajilabo 編集長 / Co-Founder',
    ],
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-14 -mt-10">
      {/* Hero Section */}
      <section className="relative text-[#f8fafc] rounded-none min-h-screen flex flex-col justify-end gap-6 overflow-hidden w-screen -ml-[calc(50%-50vw)] -mr-[calc(50%-50vw)] max-w-none px-[clamp(2rem,6vw,3.4rem)] pb-[4.2rem] pt-[calc(clamp(4.5rem,5vw+2.5rem,6.5rem)+3rem)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/IMG_3008.webp"
            alt="津吹ゼミの海外フィールドワークの様子"
            fill
            sizes="100vw"
            priority
            className="object-cover saturate-[1.25] brightness-[1.05]"
          />
        </div>
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[rgba(15,23,42,0.55)] via-[rgba(15,23,42,0.42)] to-[rgba(15,23,42,0.78)]" />

        <div className="relative z-[2] flex flex-col gap-6 max-w-[640px]">
          <p className="m-0 text-[0.78rem] tracking-[0.32em] uppercase text-[#f8fafc]/78">
            Global Entrepreneurship Lab
          </p>
          <h1 className="m-0 text-[clamp(2.5rem,3vw+1.8rem,3.4rem)] tracking-[0.22em] uppercase font-semibold">
            TSUBUKI SEMINAR
          </h1>
          <p className="m-0 text-[1.1rem] leading-[1.8] max-w-[780px] text-[#f8fafc]/88">
            武蔵野大学アントレプレナーシップ学部 津吹ゼミは「グローバル」をテーマに、多様で枠に囚われず、アクティブに世界へ挑戦していくことを目指します。
            東南アジアを中心に今もゼミ生は海外フィールドでの実践に挑戦し続けています。
          </p>
          <div className="flex flex-wrap gap-[0.9rem]">
            <Link
              href="/activities"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold no-underline bg-[#f8fafc] text-[#111827] shadow-[0_16px_34px_rgba(15,23,42,0.32)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_20px_40px_rgba(15,23,42,0.36)]"
            >
              活動内容を見る
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold no-underline bg-[#f8fafc]/12 text-[#f8fafc] border border-[#f8fafc]/32 transition-all duration-200 hover:bg-[#f8fafc]/20"
            >
              ゼミについて
            </Link>
          </div>
        </div>
      </section>

      {/* Field Projects */}
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-2xl tracking-[0.14em] uppercase text-[#0f172a]">FIELD PROJECTS</p>
          <p className="m-0 text-[0.95rem] text-[#475569] max-w-[660px] leading-[1.7]">
            海外で実践するプロジェクトのエッセンスを紹介します。
          </p>
        </div>
        <div className="grid gap-[1.4rem] grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {activityColumns.map((column) => (
            <article
              key={column.title}
              className="flex flex-col gap-3 bg-[rgba(15,23,42,0.04)] rounded-[18px] px-[1.8rem] py-[1.6rem]"
            >
              <h3 className="m-0 text-[1.1rem] tracking-[0.1em] uppercase text-[#111827]">
                {column.title}
              </h3>
              <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[#475569] leading-relaxed">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Link
          href="/activities"
          className="self-start text-[#1e3a8a] font-semibold no-underline tracking-[0.06em] hover:underline"
        >
          活動内容の詳細を見る &rarr;
        </Link>
      </section>

      {/* Latest News */}
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-2xl tracking-[0.14em] uppercase text-[#0f172a]">LATEST NEWS</p>
          <p className="m-0 text-[0.95rem] text-[#475569] max-w-[660px] leading-[1.7]">
            津吹ゼミの最新情報をお知らせします。
          </p>
        </div>
        <ul className="list-none m-0 p-0 flex flex-col gap-4">
          <li className="flex flex-col gap-1.5 bg-[rgba(15,23,42,0.04)] rounded-2xl px-[1.4rem] py-[1.3rem]">
            <span className="text-[0.85rem] tracking-[0.12em] uppercase text-[#64748b]">---</span>
            <span className="font-semibold text-[#0f172a] leading-relaxed">
              最新のお知らせは準備中です。
            </span>
          </li>
        </ul>
        <Link
          href="/home"
          className="self-start text-[#1e3a8a] font-semibold no-underline tracking-[0.06em] hover:underline"
        >
          活動レポート一覧へ &rarr;
        </Link>
      </section>

      {/* Professor */}
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-[0.78rem] tracking-[0.28em] uppercase text-[#64748b]">Professor</p>
          <h2 className="m-0 text-[1.7rem] font-semibold tracking-[0.08em] text-[#111827]">
            {professorProfile.name} / {professorProfile.nameEn}
          </h2>
          <p className="m-0 text-[#475569] leading-[1.7]">{professorProfile.summary}</p>
          <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[#475569] leading-relaxed">
            {professorProfile.researchFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <Link
            href="/about"
            className="self-start text-[#1e3a8a] font-semibold no-underline tracking-[0.06em] hover:underline"
          >
            教員紹介を見る &rarr;
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#111827] to-[#1e3a8a] rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_28px_48px_rgba(15,23,42,0.3)] flex flex-col gap-4 items-start text-[#f8fafc]">
        <h2 className="m-0 text-[clamp(1.6rem,2vw+1.1rem,2.2rem)] tracking-[0.12em] uppercase">
          JOIN THE CHALLENGE
        </h2>
        <p className="m-0 leading-[1.7] max-w-[620px]">
          2026年度のゼミ参加希望や共同プロジェクト、取材のご相談はコンタクトフォームから受け付けています。目的や関心領域をお知らせください。
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold no-underline bg-[#f8fafc] text-[#111827] shadow-[0_16px_34px_rgba(15,23,42,0.32)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_20px_40px_rgba(15,23,42,0.36)]"
        >
          お問い合わせフォームへ
        </Link>
      </section>
    </div>
  )
}
