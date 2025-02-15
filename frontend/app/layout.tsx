import type { Metadata } from 'next'
import { Noto_Sans_JP, Source_Code_Pro } from 'next/font/google'
import './globals.css'
import Footer from '@/component/common/footer'

export const metadata: Metadata = {
  title: 'apkas',
  description: 'shu\'s website',
}

const fontMain = Noto_Sans_JP({
  variable: '--font-main',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const fontCode = Source_Code_Pro({
  variable: '--font-code',
  subsets: ['latin'],
  weight: ['400'],
})

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (<html lang="ja">
    <body className={`${fontMain.variable} ${fontCode.variable}`}>
      <header />
      {children}
      <Footer />
    </body>
  </html>)
}
