import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

export const mainFont = Noto_Sans_JP({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'apkas',
  description: "shu's website"
}

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={mainFont.className}>
        {children}
      </body>
    </html>
  )
}
