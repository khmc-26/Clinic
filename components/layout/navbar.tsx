// components/layout/navbar.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Book Appointment', href: '/book' },
  { name: 'Online Consultation', href: '/online' },
  { name: 'Patient Portal', href: '/portal' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">KT</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Dr. Kavitha Thomas</h1>
            <p className="text-xs text-gray-600">Homoeopathic Clinic</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              {process.env.CLINIC_PHONE}
            </Button>
            <Button size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Book Now
            </Button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}