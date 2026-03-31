'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'

const navItems = [
  { href: '/home', ja: 'ホーム', en: 'Home' },
  { href: '/about', ja: 'About', en: 'About' },
  { href: '/activities', ja: '活動内容', en: 'Activities' },
  { href: '/members', ja: 'メンバー', en: 'Members' },
  { href: '/contact', ja: 'お問い合わせ', en: 'Contact' },
]

const socialLinks = [
  { href: 'https://www.instagram.com/emcglobalzemi2025/', label: 'Instagram', icon: InstagramIcon },
  { href: 'https://x.com/emc_global_zemi', label: 'Twitter', icon: TwitterIcon },
  { href: 'https://www.facebook.com/emcglobalzemi12/?locale=ja_JP', label: 'Facebook', icon: FacebookIcon },
]

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.25" cy="6.75" r="1" fill="currentColor" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.25 6.3c-.6.27-1.23.45-1.89.54a3.25 3.25 0 0 0 1.43-1.8 6.4 6.4 0 0 1-2.05.82 3.22 3.22 0 0 0-5.49 2.2c0 .25.03.5.08.73A9.14 9.14 0 0 1 4.5 5.82a3.23 3.23 0 0 0 1 4.3 3.16 3.16 0 0 1-1.46-.4v.04c0 1.57 1.12 2.88 2.6 3.19a3.24 3.24 0 0 1-1.45.05c.41 1.27 1.6 2.19 3 2.21A6.47 6.47 0 0 1 3.75 17a9.12 9.12 0 0 0 4.95 1.45c5.94 0 9.2-4.92 9.2-9.19 0-.14 0-.29-.01-.43a6.5 6.5 0 0 0 1.59-1.64z"
        fill="currentColor"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.926-1.956 1.875V12h3.328l-.532 3.47h-2.796v8.384C19.612 22.954 24 17.99 24 12z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Header({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { lang, setLang } = useLanguage()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-[#f8fafc]/85 border-b border-[#e2e8f0]/75 backdrop-blur-[12px] ${className}`}
    >
      <div className="w-full px-4 md:px-[clamp(1.6rem,3.5vw,3rem)] md:pr-[clamp(2.8rem,5vw,5rem)] py-3 md:py-5 flex items-center justify-between gap-4 md:gap-8">
        <Link href="/home" className="no-underline text-inherit flex flex-col gap-0.5 md:gap-1 shrink-0">
          <span className="text-[clamp(0.9rem,2.5vw,1.35rem)] font-semibold tracking-[0.3em] md:tracking-[0.4em]">TSUBUKI SEMINAR</span>
          <span className="text-[clamp(0.5rem,1.2vw,0.7rem)] tracking-[0.14em] md:tracking-[0.18em] text-[#64748b] uppercase">
            {lang === 'ja' ? '武蔵野大学アントレプレナーシップ学部 グローバルゼミ' : 'Musashino University, Faculty of Entrepreneurship'}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <nav aria-label="メインナビゲーション">
            <ul className="list-none m-0 p-0 flex items-center gap-7">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`no-underline text-[#1f2937] text-[0.78rem] font-semibold tracking-[0.22em] uppercase relative pb-0.5 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-px after:bg-current after:origin-center after:transition-transform after:duration-200 ${isActive ? 'text-[#111827] after:scale-x-100' : 'after:scale-x-0 hover:text-[#111827] hover:after:scale-x-100'}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {lang === 'ja' ? item.ja : item.en}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <ul className="list-none m-0 p-0 flex items-center gap-[1.1rem]" aria-label="ソーシャルリンク">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex items-center justify-center text-[#111827] opacity-80 transition-opacity duration-200 hover:opacity-100"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>

          <div className="inline-flex items-center gap-[0.3rem] pl-[0.9rem] border-l border-[#111827]/18" aria-label="言語切り替え">
            <button
              onClick={() => setLang('ja')}
              className={`text-[0.72rem] tracking-[0.28em] uppercase font-semibold bg-transparent border-none cursor-pointer ${lang === 'ja' ? 'text-[#111827]' : 'text-[#111827]/35'}`}
            >
              JA
            </button>
            <span className="text-[0.72rem] tracking-[0.28em] text-[#111827]/35">/</span>
            <button
              onClick={() => setLang('en')}
              className={`text-[0.72rem] tracking-[0.28em] uppercase font-semibold bg-transparent border-none cursor-pointer ${lang === 'en' ? 'text-[#111827]' : 'text-[#111827]/35'}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
          aria-label="メニューを開く"
        >
          <span className={`block w-5 h-[2px] bg-[#111827] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-[2px] bg-[#111827] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[2px] bg-[#111827] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#f8fafc]/95 backdrop-blur-md border-t border-[#e2e8f0]/50 px-4 py-6 flex flex-col gap-5">
          <nav>
            <ul className="list-none m-0 p-0 flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`no-underline text-[0.9rem] font-semibold tracking-[0.18em] uppercase ${isActive ? 'text-[#111827]' : 'text-[#475569]'}`}
                    >
                      {lang === 'ja' ? item.ja : item.en}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4 pt-2 border-t border-[#e2e8f0]/50">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex items-center justify-center text-[#111827] opacity-70"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
