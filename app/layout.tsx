import type { Metadata } from 'next'
import { mainFont } from '@/core/config'
import './globals.css'

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
