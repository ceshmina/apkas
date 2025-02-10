import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'apkas',
  description: 'shu\'s website',
}

const fontMain = Noto_Sans_JP({ variable: '--font-main', subsets: ['latin'] })

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (<html lang="ja">
    <body className={`${fontMain.variable}`}>
      <header />
      <main className="p-4">
        {children}
      </main>
      <footer />
    </body>
  </html>)
}
