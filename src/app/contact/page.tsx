'use client'

import { useLanguage } from '@/lib/language-context'
import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const { lang } = useLanguage()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          name,
          email,
          message,
          subject: `[津吹ゼミ] ${name}様よりお問い合わせ`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setName('')
        setEmail('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const txt = {
    subtitle:       { ja: 'お問い合わせはこちらから',                    en: 'Get in touch with us',                zh: '请从这里联系我们' }[lang],
    successTitle:   { ja: '送信が完了しました。',                        en: 'Message sent successfully.',           zh: '发送完成。' }[lang],
    successBody:    { ja: 'お問い合わせありがとうございます。内容を確認の上、ご連絡いたします。', en: 'Thank you for your message. We will get back to you shortly.', zh: '感谢您的联系。我们将在确认内容后尽快回复。' }[lang],
    sendAnother:    { ja: '別のお問い合わせをする',                       en: 'Send another message',                zh: '发送其他咨询' }[lang],
    labelName:      { ja: 'お名前',                                      en: 'Name',                                zh: '姓名' }[lang],
    labelEmail:     { ja: 'メールアドレス',                               en: 'Email',                               zh: '邮箱' }[lang],
    labelMessage:   { ja: 'お問い合わせ内容',                             en: 'Message',                             zh: '咨询内容' }[lang],
    errorText:      { ja: '送信に失敗しました。時間をおいて再度お試しください。', en: 'Failed to send. Please try again later.', zh: '发送失败，请稍后再试。' }[lang],
    submitIdle:     { ja: '送信する',                                     en: 'Submit',                              zh: '发送' }[lang],
    submitLoading:  { ja: '送信中...',                                    en: 'Sending...',                          zh: '发送中...' }[lang],
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="pt-32 md:pt-36 pb-8 px-6 md:px-12 max-w-[960px] mx-auto">
        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extralight tracking-[0.2em] text-[#111827] leading-none">
          CONTACT
        </h1>
        <p className="mt-4 text-[#94a3b8] text-[0.78rem] tracking-[0.15em]">
          {txt.subtitle}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[960px] mx-auto px-6 md:px-12 py-12 md:py-16">

        {status === 'success' ? (
          <div className="max-w-[600px] flex flex-col gap-4 py-12">
            <p className="text-[1.1rem] font-light text-[#111827] tracking-wide">
              {txt.successTitle}
            </p>
            <p className="text-[0.85rem] text-[#94a3b8] leading-relaxed">
              {txt.successBody}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="self-start mt-4 text-[0.78rem] text-[#94a3b8] hover:text-[#111827] tracking-[0.1em] transition-colors duration-200 underline underline-offset-4"
            >
              {txt.sendAnother}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-[600px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
                {txt.labelName}
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 border-b border-[#e2e8f0] bg-transparent text-[#0f172a] text-base outline-none transition-colors focus:border-[#111827]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
                {txt.labelEmail}
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 border-b border-[#e2e8f0] bg-transparent text-[#0f172a] text-base outline-none transition-colors focus:border-[#111827]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-[0.7rem] tracking-[0.3em] uppercase text-[#94a3b8] font-medium">
                {txt.labelMessage}
              </label>
              <textarea
                id="message"
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-4 py-3 border-b border-[#e2e8f0] bg-transparent text-[#0f172a] text-base outline-none transition-colors focus:border-[#111827] resize-vertical"
              />
            </div>

            {status === 'error' && (
              <p className="text-[0.8rem] text-red-400">
                {txt.errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="self-start mt-4 px-8 py-3 text-[0.82rem] font-medium tracking-[0.15em] uppercase text-white bg-[#111827] rounded-full border-none cursor-pointer transition-opacity duration-200 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? txt.submitLoading : txt.submitIdle}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
