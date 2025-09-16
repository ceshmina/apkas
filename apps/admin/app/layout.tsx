import type { Metadata } from 'next'
import { Noto_Sans_JP, Source_Code_Pro } from 'next/font/google'

import Auth from '@/components/auth'
import './globals.css'


const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-jp',
})

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-source-code-pro',
})


export const metadata: Metadata = {
  title: 'apkas',
}


export const dynamic = 'force-dynamic'


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (<html lang="ja">
    <body className={`${notoSansJP.variable} ${sourceCodePro.variable}`}>
      <Auth>
        {children}
      </Auth>
    </body>
  </html>)
}
