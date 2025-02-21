import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'apkas-admin',
}

const fontMain = Noto_Sans_JP({
  variable: '--font-main',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (<html lang="ja">
    <body className={fontMain.variable}>
      {children}
    </body>
  </html>)
}
