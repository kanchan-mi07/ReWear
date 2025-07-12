"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Coins, Settings, LogOut, Bell, ShoppingBag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createPortal } from "react-dom"

interface AppUser {
  id: number
  name: string
  email: string
  points: number
  is_admin: boolean
  avatar_url?: string
}

function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetch("/api/notifications", { credentials: "include" })
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []))
    }
  }, [open])

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative p-2 rounded hover:bg-gray-100">
        <Bell className="h-6 w-6" />
        {notifications.some(n => !n.is_read) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2 font-semibold border-b flex items-center justify-between">
            <span>Notifications</span>
            <Link href="/notifications" className="text-xs text-green-700 hover:underline">View all</Link>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : notifications.map((n, i) => (
            <div key={n.id || i} className={`p-3 border-b last:border-b-0 ${!n.is_read ? "bg-gray-50" : ""}`}>
              <div className="text-sm">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname();
  const { toast } = useToast()
  const [lastNotifiedId, setLastNotifiedId] = useState<number | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!user) return
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          const unread = (data.notifications || []).filter((n: any) => !n.is_read)
          if (unread.length > 0) {
            // Only show toast for the latest unseen notification
            const latest = unread[0]
            if (latest.id !== lastNotifiedId) {
              toast({ title: latest.message })
              setLastNotifiedId(latest.id)
            }
          }
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    }, 10000)
    return () => clearInterval(poll)
  }, [user, lastNotifiedId, toast])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  // Focus trap and Esc key close for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return
    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ]
    const menu = mobileMenuRef.current
    if (!menu) return
    const focusableEls = menu.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
    if (focusableEls.length) focusableEls[0].focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
      } else if (e.key === "Tab") {
        // Focus trap
        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileMenuOpen])

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // User is not authenticated, which is fine
        setUser(null)
      }
    } catch (error) {
      // Silently handle fetch errors - user is likely not authenticated
      setUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
      router.refresh()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b shadow-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group select-none">
            <span className="rounded-full bg-green-100 p-2 shadow-sm">
              <ShoppingBag className="h-6 w-6 text-green-700 group-hover:scale-110 transition-transform duration-200" />
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-green-700 group-hover:text-green-800 font-serif drop-shadow-sm transition-colors duration-200">
              Re<span className="text-blue-600">W</span>ear
            </span>
          </Link>

          {/* Hamburger for mobile */}
          <button
            className={`md:hidden p-2 rounded focus:outline-none transition-transform duration-200 flex flex-col justify-center items-center w-10 h-10 ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block w-7 h-0.5 bg-sky-700 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-7 h-0.5 bg-sky-700 transition-all duration-300 my-1 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-7 h-0.5 bg-sky-700 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Desktop nav */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for clothing items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-green-200 focus:border-green-500 shadow-sm"
              />
            </div>
          </form>
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                {!(user.is_admin && pathname.startsWith("/admin")) && (
                  <Link href="/items/new">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      List Item
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/coins" className="flex items-center space-x-2 text-sm hover:underline">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{user.points}</span>
                </Link>
                {/* Notification Button */}
                <NotificationsDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        {user.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                        ) : null}
                        <AvatarFallback>
                          {user.name.trim().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      {!(user.is_admin && pathname.startsWith("/admin")) && (
                        <Link href="/dashboard">
                          <Settings className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      )}
                    </DropdownMenuItem>
                    {user.is_admin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu overlay */}
        {typeof window !== 'undefined' && mobileMenuOpen && createPortal(
          <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
            <div className="fixed inset-0 z-50 flex justify-end">
              <div
                id="mobile-menu"
                ref={mobileMenuRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className="relative w-full max-w-xs h-full bg-white/80 backdrop-blur-lg border-l border-sky-100 shadow-2xl rounded-l-2xl flex flex-col overflow-y-auto pt-8 pb-8 animate-slide-in"
              >
                {/* Mobile menu header */}
                <div className="flex items-center justify-between px-6 pb-2">
                  <Link href="/" className="flex items-center gap-2">
                    <span className="rounded-full bg-green-100 p-2 shadow-sm">
                      <ShoppingBag className="h-6 w-6 text-green-700" />
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight text-green-700 font-serif drop-shadow-sm">
                      Re<span className="text-blue-600">W</span>ear
                    </span>
                  </Link>
                  <button
                    className="ml-4 p-2 rounded-full hover:bg-sky-100 transition"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <svg className="h-7 w-7 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="px-6 mb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search for clothing items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full border-green-200 focus:border-green-500 shadow-sm"
                    />
                  </div>
                </form>
                {/* Mobile nav links and actions */}
                <div className="flex flex-col gap-3 px-6 pb-8 mt-2">
                  {user ? (
                    <>
                      {!(user.is_admin && pathname.startsWith("/admin")) && (
                        <Link href="/items/new">
                          <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2 text-lg font-semibold py-3">
                            <Plus className="h-5 w-5" />
                            List Item
                          </Button>
                        </Link>
                      )}
                      <Link href="/dashboard/coins" className="w-full flex items-center gap-2 text-lg font-semibold py-3 rounded-md hover:bg-sky-50 transition">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span>{user.points}</span>
                        <span className="text-base font-medium text-sky-900">Coins</span>
                      </Link>
                      <button className="w-full flex items-center gap-2 text-lg font-semibold py-3 rounded-md hover:bg-sky-50 transition" type="button" tabIndex={0} aria-label="Notifications">
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                      </button>
                      <div className="border-t border-sky-100 my-2" />
                      <Link href="/dashboard" className="w-full flex items-center gap-2 text-lg font-semibold py-3 rounded-md hover:bg-sky-50 transition">
                        <Settings className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      {user.is_admin && (
                        <Link href="/admin" className="w-full flex items-center gap-2 text-lg font-semibold py-3 rounded-md hover:bg-sky-50 transition">
                          <Settings className="h-5 w-5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <Button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-lg font-semibold py-3">
                        <LogOut className="h-5 w-5" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Link href="/auth">
                      <Button className="w-full flex items-center justify-center gap-2 text-lg font-semibold py-3">Sign In</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </nav>
  )
}
