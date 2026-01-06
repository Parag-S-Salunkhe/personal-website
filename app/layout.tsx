import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/shared/Navigation'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parag Salunkhe',
  description: 'Cloud and DevOps engineer in Dublin, specializing in infrastructure, automation, and data center operations',
  icons: {
    icon: '/favicon.ico',  // Add this
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

