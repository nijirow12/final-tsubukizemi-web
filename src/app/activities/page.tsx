export default function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-2xl tracking-[0.14em] uppercase text-[#0f172a]">ACTIVITIES</p>
          <p className="m-0 text-[0.95rem] text-[#475569] max-w-[660px] leading-[1.7]">
            津吹ゼミの活動内容を紹介します。
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="m-0 text-[1.2rem] font-semibold text-[#1e3a8a]">海外での挑戦</h3>
          <p className="m-0 text-[#475569] leading-[1.7]">
            東南アジアを中心に、屋台販売やKIZUNA Fesでの出店など、現地での実践的な活動を行っています。
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="m-0 text-[1.2rem] font-semibold text-[#1e3a8a]">クラウドファンディング</h3>
          <p className="m-0 text-[#475569] leading-[1.7]">
            カンボジアの障がい者施設の支援など、社会課題解決に向けたプロジェクトを企画・実行しています。
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="m-0 text-[1.2rem] font-semibold text-[#1e3a8a]">Challenger訪問</h3>
          <p className="m-0 text-[#475569] leading-[1.7]">
            海外で挑戦する起業家やビジネスパーソンを訪問し、リアルなビジネスの現場を学びます。
          </p>
        </div>
      </section>
    </div>
  )
}
