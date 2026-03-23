import { professorProfile } from '@/data/professor'

const members = [
  { id: 'm1', name: '山田 花子', role: '4年 / プロジェクトリーダー' },
  { id: 'm2', name: '鈴木 一郎', role: '3年 / サプライチェーン担当' },
  { id: 'm3', name: '小林 里奈', role: '3年 / デザインリード' },
  { id: 'm4', name: '佐藤 光', role: '2年 / データ＆マーケティング' },
  { id: 'm5', name: 'アリサ 王', role: '交換留学生' },
  { id: 'm6', name: '高橋 悠真', role: '4年 / アルムナイメンター' },
]

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-5">
        <p className="m-0 text-[0.78rem] tracking-[0.28em] uppercase text-[#64748b]">Professor</p>
        <h2 className="m-0 text-[1.7rem] font-semibold tracking-[0.08em] text-[#111827]">
          {professorProfile.name} / {professorProfile.nameEn}
        </h2>
        <p className="m-0 text-[#475569] leading-[1.7]">{professorProfile.summary}</p>
      </section>

      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-2xl tracking-[0.14em] uppercase text-[#0f172a]">MEMBERS</p>
          <p className="m-0 text-[0.95rem] text-[#475569] max-w-[660px] leading-[1.7]">
            津吹ゼミのメンバーを紹介します。
          </p>
        </div>
        <div className="grid gap-[1.4rem] grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {members.map((member) => (
            <article
              key={member.id}
              className="flex flex-col gap-3 bg-[rgba(15,23,42,0.04)] rounded-[18px] px-[1.8rem] py-[1.6rem]"
            >
              <div className="w-16 h-16 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[#64748b] text-xl font-semibold">
                {member.name[0]}
              </div>
              <h3 className="m-0 text-[1.05rem] font-semibold text-[#111827]">{member.name}</h3>
              <p className="m-0 text-[0.85rem] text-[#64748b]">{member.role}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
