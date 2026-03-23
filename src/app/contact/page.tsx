export default function ContactPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="bg-white rounded-3xl px-[2.8rem] py-[2.6rem] shadow-[0_22px_40px_rgba(15,23,42,0.1)] flex flex-col gap-7">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-2xl tracking-[0.14em] uppercase text-[#0f172a]">CONTACT</p>
          <p className="m-0 text-[0.95rem] text-[#475569] max-w-[660px] leading-[1.7]">
            お問い合わせはこちらから
          </p>
        </div>

        <form className="flex flex-col gap-5 max-w-[600px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[0.85rem] font-semibold text-[#111827]">お名前</label>
            <input
              type="text"
              id="name"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[rgba(15,23,42,0.02)] text-[#0f172a] text-base outline-none transition-colors focus:border-[#1e3a8a]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[0.85rem] font-semibold text-[#111827]">メールアドレス</label>
            <input
              type="email"
              id="email"
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[rgba(15,23,42,0.02)] text-[#0f172a] text-base outline-none transition-colors focus:border-[#1e3a8a]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-[0.85rem] font-semibold text-[#111827]">お問い合わせ内容</label>
            <textarea
              id="message"
              rows={6}
              className="px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[rgba(15,23,42,0.02)] text-[#0f172a] text-base outline-none transition-colors focus:border-[#1e3a8a] resize-vertical"
            />
          </div>
          <button
            type="submit"
            className="self-start inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold bg-gradient-to-br from-[#111827] to-[#1e3a8a] text-[#f8fafc] border-none cursor-pointer shadow-[0_16px_34px_rgba(15,23,42,0.32)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_20px_40px_rgba(15,23,42,0.36)]"
          >
            送信する
          </button>
        </form>
      </section>
    </div>
  )
}
