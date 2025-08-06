import { ReactNode } from 'react'

// Root layout required by Next.js
// Actual layout logic is in [locale]/layout.tsx due to i18n routing
export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
} 