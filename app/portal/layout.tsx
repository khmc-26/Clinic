// /app/portal/layout.tsx - UPDATED VERSION (Removed Prescriptions)
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Home,
  User,
  History,
  ShieldAlert,
  ChevronLeft,
  Construction
} from 'lucide-react'
import { cn } from '@/lib/utils'
import MergeNotificationBanner from '@/components/patient/merge-notification-banner'

const portalNavItems = [
  { href: '/portal', label: 'Dashboard', icon: Home },
  { href: '/portal/appointments', label: 'Appointments', icon: Calendar },
  { href: '/portal/family', label: 'Family Members', icon: Users },
  { href: '/portal/medical-history', label: 'Medical History', icon: History },
  { href: '/portal/merge', label: 'Merge Requests', icon: ShieldAlert, badge: 'merge' },
  { href: '/portal/settings', label: 'Settings', icon: Settings },
  // REMOVED: Prescriptions link
  // { href: '/portal/prescriptions', label: 'Prescriptions', icon: Pill, disabled: true },
]

// Pages that don't require authentication
const PUBLIC_PAGES = ['/portal/login', '/portal/verify-request']

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mergeCount, setMergeCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Check if current page is public
  const isPublicPage = PUBLIC_PAGES.includes(pathname)

  useEffect(() => {
    // Fetch pending merge count (only for authenticated users)
    const fetchMergeCount = async () => {
      try {
        const response = await fetch('/api/appointments/merge/count')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setMergeCount(data.count)
          }
        }
      } catch (error) {
        console.error('Error fetching merge count:', error)
      }
    }

    if (session && !isPublicPage) {
      fetchMergeCount()
    }
  }, [session, isPublicPage])

  // Redirect if not authenticated (except for public pages)
  useEffect(() => {
    if (status === 'unauthenticated' && !isPublicPage) {
      console.log('🔐 Redirecting to login from:', pathname)
      router.push('/portal/login')
    }
  }, [status, isPublicPage, pathname, router])

  // Show loading state while checking authentication
  if (status === 'loading' && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // For public pages, render without authentication
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple header for login/verify pages */}
        <header className="border-b bg-white">
          <div className="px-4 h-16 flex items-center justify-between">
            <Link href="/portal" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Patient Portal</h1>
                <p className="text-xs text-gray-500">Sign in to continue</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Website
              </Button>
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    )
  }

  // For authenticated pages, check session
  if (!session) {
    return null // Will redirect in useEffect
  }

  const patientName = session.user?.name || session.user?.email?.split('@')[0] || 'Patient'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            
            <div className="flex items-center space-x-2">
              <Link href="/portal" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold">Patient Portal</h1>
                  <p className="text-xs text-gray-500">{patientName}</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Merge notification badge */}
            {mergeCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="relative bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                onClick={() => router.push('/portal/merge')}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Merge Requests
                <span className="ml-2 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {mergeCount}
                </span>
              </Button>
            )}
            
            {/* Sign Out Button (Desktop) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/portal/login', redirect: true })}
              className="hidden md:flex"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Website
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center px-4 border-t h-12">
          {portalNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/portal' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 h-12 text-sm font-medium border-b-2 transition-colors relative",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge === 'merge' && mergeCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {mergeCount}
                  </span>
                )}
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
              {portalNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== '/portal' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge === 'merge' && mergeCount > 0 && (
                      <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {mergeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
              
              {/* Optional: Coming Soon Features Section */}
              <div className="pt-4 border-t">
                <div className="px-4 py-3 rounded-lg text-sm font-medium text-gray-500 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Construction className="h-5 w-5" />
                    <span>Prescriptions (Coming Soon)</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={() => signOut({ callbackUrl: '/portal/login', redirect: true })}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-28 md:pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {!isPublicPage && <MergeNotificationBanner />}
          {children}
        </div>
      </main>
    </div>
  )
}