import Link from 'next/link'

const navItems = [
  { href: '/home', label: 'ホーム' },
  { href: '/about', label: 'About' },
  { href: '/activities', label: '活動内容' },
  { href: '/members', label: 'メンバー' },
  { href: '/contact', label: 'お問い合わせ' },
]

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-[#f8fafc]">
      <div className="w-full max-w-[1120px] mx-auto px-9 py-11 flex flex-col gap-8">
        <div className="flex flex-col gap-1.5">
          <span className="text-[1.1rem] font-semibold tracking-[0.4em]">TSUBUKI SEMINAR</span>
          <p className="m-0 text-[0.82rem] tracking-[0.16em] uppercase text-[#f8fafc]/72">
            武蔵野大学アントレプレナーシップ学部 グローバルゼミ
          </p>
        </div>

        <div className="flex items-center justify-between gap-8 flex-wrap">
          <nav aria-label="フッターナビゲーション">
            <ul className="list-none m-0 p-0 flex items-center gap-6 flex-wrap">
              {navItems.map((item) => (
                <li key={`footer-${item.href}`}>
                  <Link
                    href={item.href}
                    className="no-underline text-[#f8fafc]/85 text-[0.75rem] tracking-[0.2em] uppercase transition-colors duration-200 hover:text-[#f8fafc]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <small className="text-[0.7rem] tracking-[0.26em] uppercase text-[#f8fafc]/65">
          &copy; {new Date().getFullYear()} TSUBUKI SEMINAR
        </small>
      </div>
    </footer>
  )
}
