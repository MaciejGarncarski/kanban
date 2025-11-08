import type { Metadata } from 'next'
import '@mantine/core/styles.css'
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: 'Kanban app',
  description: 'A Kanban board application built with Next.js and NestJS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body style={{ minHeight: '100vh' }} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
