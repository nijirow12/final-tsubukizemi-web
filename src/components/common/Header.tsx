'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', label: 'ホーム' },
  { href: '/about', label: 'About' },
  { href: '/activities', label: '活動内容' },
  { href: '/members', label: 'メンバー' },
  { href: '/contact', label: 'お問い合わせ' },
]

const socialLinks = [
  { href: 'https://www.instagram.com/emcglobalzemi2025/', label: 'Instagram', icon: InstagramIcon },
  { href: 'https://x.com/emc_global_zemi', label: 'Twitter', icon: TwitterIcon },
  { href: 'https://www.facebook.com/emcglobalzemi12/?locale=ja_JP', label: 'Facebook', icon: FacebookIcon },
  { href: 'https://note.com/mu_emc/n/n4b922216452b', label: 'note', icon: NoteIcon },
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
        d="M13.5 8.25V6.75c0-.93.75-1.68 1.68-1.68H16.5V3h-1.32A3.93 3.93 0 0 0 11.25 6.9v1.35H9.75V12h1.5v9h2.25v-9h1.86l.27-2.7h-2.13z"
        fill="currentColor"
      />
    </svg>
  )
}

function NoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 5.25h11a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.18.6l-3.32-2.49a.75.75 0 0 0-.45-.15H6.5a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8.5 9.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Header({ className = '' }: { className?: string }) {
  const pathname = usePathname()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-20 bg-[#f8fafc]/85 border-b border-[#e2e8f0]/75 backdrop-blur-[12px] ${className}`}
    >
      <div className="w-full px-[clamp(1.6rem,3.5vw,3rem)] pr-[clamp(2.8rem,5vw,5rem)] py-5 flex items-center justify-between gap-8">
        <Link href="/home" className="no-underline text-inherit flex flex-col gap-1">
          <span className="text-[1.35rem] font-semibold tracking-[0.4em]">TSUBUKI SEMINAR</span>
          <span className="text-[0.7rem] tracking-[0.18em] text-[#64748b] uppercase">
            武蔵野大学アントレプレナーシップ学部 グローバルゼミ
          </span>
        </Link>

        <div className="flex items-center gap-7">
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
                      {item.label}
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
            <Link href="/home" className="text-[0.72rem] tracking-[0.28em] uppercase no-underline font-semibold text-[#111827]">
              JA
            </Link>
            <span className="text-[0.72rem] tracking-[0.28em] text-[#111827]/35">/</span>
            <Link href="/home" className="text-[0.72rem] tracking-[0.28em] uppercase no-underline font-semibold text-[#111827]/50">
              EN
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
