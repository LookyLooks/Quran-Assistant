import { GeistSans, GeistMono } from 'geist/font'
import './globals.css'

export const metadata = {
  title: 'Quran Assistant',
  description: 'Your AI-powered Quran learning companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <main className={GeistMono.variable}>{children}</main>
      </body>
    </html>
  )
}