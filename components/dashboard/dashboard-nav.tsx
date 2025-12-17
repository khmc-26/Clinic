// components/dashboard/dashboard-nav.tsx - UPDATED with Availability
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Home,
  UserPlus,
  UserCog,
  Clock // ADD THIS IMPORT
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/dashboard/availability', label: 'Availability', icon: Clock }, // ADD THIS LINE
  { href: '/dashboard/doctors', label: 'Doctor Management', icon: UserCog },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const regularDoctorNavItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/dashboard/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
  { href: '/dashboard/availability', label: 'Availability', icon: Clock }, // ADD THIS LINE
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

// Rest of the file remains exactly the same...
export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user?.isAdmin
  const navItems = isAdmin ? adminNavItems : regularDoctorNavItems
  const doctorName = session?.user?.name || 'Doctor'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <div>
                <h1 className="font-bold">Doctor Dashboard</h1>
                <p className="text-xs text-gray-500">{doctorName}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link href="/dashboard/doctors/invite">
                <Button size="sm" className="hidden md:flex">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Doctor
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden md:flex"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Website
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center px-4 border-t h-12">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 h-12 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white p-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {isAdmin && (
                <Link
                  href="/dashboard/doctors/invite"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Invite Doctor</span>
                </Link>
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}