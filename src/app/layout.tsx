import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from '@/components/common/ConditionalLayout'
import { LanguageProvider } from '@/lib/language-context'

export const metadata: Metadata = {
  title: '津吹ゼミ | TSUBUKI SEMINAR',
  description:
    '武蔵野大学アントレプレナーシップ学部 津吹ゼミ（グローバルゼミ）の公式サイト。海外プロジェクトや最新情報、メンバー紹介、問い合わせ先を掲載しています。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </LanguageProvider>
      </body>
    </html>
  )
}
