import { professorProfile } from '@/data/professor'

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-2xl tracking-[0.14em] uppercase text-[#0f172a]">ABOUT</p>
          <p className="m-0 text-[0.95rem] text-[#475569] max-w-[660px] leading-[1.7]">
            津吹ゼミ（グローバルゼミ）について
          </p>
        </div>
        <p className="m-0 text-[#1f2937] leading-[1.8] max-w-[780px]">
          武蔵野大学アントレプレナーシップ学部 津吹ゼミは「グローバル」をテーマに、
          東南アジアを中心とした海外フィールドでの実践を通じて、学生の起業家精神とリーダーシップを育成しています。
          クラウドファンディング、現地企業との共同プロジェクト、チャレンジャー訪問など、
          机上の学びにとどまらない実践型教育を展開しています。
        </p>
      </section>

      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-5">
        <p className="m-0 text-[0.78rem] tracking-[0.28em] uppercase text-[#64748b]">Professor</p>
        <h2 className="m-0 text-[1.7rem] font-semibold tracking-[0.08em] text-[#111827]">
          {professorProfile.name} / {professorProfile.nameEn}
        </h2>
        <p className="m-0 text-[#475569] leading-[1.7] max-w-[700px]">{professorProfile.summary}</p>
        <div>
          <h3 className="m-0 mb-3 text-[1.1rem] font-semibold text-[#1e3a8a]">研究領域</h3>
          <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[#475569] leading-relaxed">
            {professorProfile.researchFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
