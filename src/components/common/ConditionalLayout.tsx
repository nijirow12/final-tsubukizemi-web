'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isGlobePage = pathname === '/home'
  const isGlobeContentPage = ['/about', '/activities', '/members', '/contact'].includes(pathname)

  if (isLanding) {
    return <>{children}</>
  }

  // /home: ヘッダーあり、フッター・padding無しの全画面
  if (isGlobePage) {
    return (
      <>
        <Header />
        {children}
      </>
    )
  }

  // about / activities / members: ヘッダー＋フッターあり、地球儀ヒーロー用にmain wrapper無し
  if (isGlobeContentPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a]">
      <Header />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 pt-[calc(clamp(4.5rem,5vw+2.5rem,6.5rem)+2.5rem)] pb-14">
        {children}
      </main>
      <Footer />
    </div>
  )
}
