'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isGlobePage = pathname === '/home'

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
