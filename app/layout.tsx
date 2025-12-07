// app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Providers } from './providers' // ADD THIS IMPORT

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dr. Kavitha Thomas | Best Homoeopathic Doctor in Areekkad, Kozhikode',
  description: 'Dr. Kavitha Thomas provides natural homoeopathic treatment for chronic diseases, skin problems, allergies in Areekkad, Kozhikode. Book appointment online.',
  keywords: [
    'homoeopathic doctor Areekkad',
    'best homoeopathy clinic Kozhikode',
    'Dr. Kavitha Thomas homoeopathy',
    'homoeopathic treatment near me',
    'natural medicine doctor',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.className} antialiased`}>
        <Providers> {/* WRAP WITH PROVIDERS */}
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}