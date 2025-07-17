import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dialogue Editor',
  description: 'Dialogue Editor',
  authors: [{ name: 'Rohit'}],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
