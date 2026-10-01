import type { ReactNode } from 'react'
import { Header } from '@/components/layout'
import { Footer } from '@/components/layout'

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  )
}
