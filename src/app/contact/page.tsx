'use client'

import { useLanguage } from '@/lib/language-context'

export default function ContactPage() {
  const { lang } = useLanguage()
  const t = lang === 'ja'

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 md:pt-36 pb-8 px-6 md:px-12 max-w-[960px] mx-auto">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight tracking-[0.2em] text-[#111827] leading-none">
          CONTACT
        </h1>
        <p className="mt-4 text-[#94a3b8] text-[0.78rem] tracking-[0.15em]">
          {t ? 'お問い合わせはこちらから' : 'Get in touch with us'}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <form className="flex flex-col gap-6 max-w-[600px]">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
              {t ? 'お名前' : 'Name'}
            </label>
            <input
              type="text"
              id="name"
              className="px-4 py-3 border-b border-[#e2e8f0] bg-transparent text-[#0f172a] text-base outline-none transition-colors focus:border-[#111827]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
              {t ? 'メールアドレス' : 'Email'}
            </label>
            <input
              type="email"
              id="email"
              className="px-4 py-3 border-b border-[#e2e8f0] bg-transparent text-[#0f172a] text-base outline-none transition-colors focus:border-[#111827]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
              {t ? 'お問い合わせ内容' : 'Message'}
            </label>
            <textarea
              id="message"
              rows={6}
              className="px-4 py-3 border-b border-[#e2e8f0] bg-transparent text-[#0f172a] text-base outline-none transition-colors focus:border-[#111827] resize-vertical"
            />
          </div>
          <button
            type="submit"
            className="self-start mt-4 px-8 py-3 text-[0.82rem] font-medium tracking-[0.15em] uppercase text-white bg-[#111827] rounded-full border-none cursor-pointer transition-opacity duration-200 hover:opacity-80"
          >
            {t ? '送信する' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
