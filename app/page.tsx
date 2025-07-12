"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Recycle, Users, Shirt, ArrowRight } from "lucide-react"

interface AppUser {
  id: number
  name: string
  email: string
  points: number
  is_admin: boolean
}

interface Item {
  id: number
  title: string
  images?: string[]
  condition: string
  points_value: number
}

export default function HomePage() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [featuredItems, setFeaturedItems] = useState<Item[]>([])

  useEffect(() => {
    fetchUser()
    fetchFeaturedItems()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }

  const fetchFeaturedItems = async () => {
    try {
      const response = await fetch("/api/items?limit=4")
      if (response.ok) {
        const data = await response.json()
        setFeaturedItems(data.items || [])
      }
    } catch {}
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-white via-sky-50 to-mint-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-sky-100 to-mint-100 py-20 overflow-hidden shadow-md">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img
            src="/shopping-bg.jpg"
            alt="Shopping background"
            className="w-full h-full object-cover opacity-20"
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-sky-100/60 to-mint-100/60" />
        </div>
        {/* Hero Content */}
        <div className="container mx-auto px-2 sm:px-4 md:px-8 text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-sky-700 mb-4 sm:mb-6 drop-shadow-sm">
            Welcome to <span className="text-mint-600">ReWear</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-sky-800/80 mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-sm">
            Join our community clothing exchange platform. Swap, share, and discover pre-loved fashion while promoting sustainable living.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-xl mx-auto">
            <Link href="/items" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-mint-400 text-sky-900 font-bold hover:bg-mint-300 shadow-sm">
                Start Swapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/items" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white/90 text-sky-700 border-2 border-sky-100 hover:bg-sky-50 font-semibold shadow-sm">
                Browse Items
              </Button>
            </Link>
            <Link href="/items/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-sky-200 text-mint-900 font-bold hover:bg-sky-300 shadow-sm">
                List an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-16 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-2 sm:px-4 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-700 text-center mb-8 sm:mb-12">Why Choose ReWear?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center bg-mint-50 rounded-xl shadow p-6 hover:scale-105 transition-transform">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                <Recycle className="h-8 w-8 text-mint-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-mint-700">Sustainable Fashion</h3>
              <p className="text-gray-600">
                Reduce textile waste and promote eco-friendly fashion choices through clothing reuse.
              </p>
            </div>
            <div className="text-center bg-sky-50 rounded-xl shadow p-6 hover:scale-105 transition-transform">
              <div className="bg-mint-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                <Users className="h-8 w-8 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-sky-700">Community Driven</h3>
              <p className="text-gray-600">
                Connect with like-minded individuals who share your passion for sustainable living.
              </p>
            </div>
            <div className="text-center bg-white rounded-xl shadow p-6 hover:scale-105 transition-transform">
              <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                <Shirt className="h-8 w-8 text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-sky-600">Quality Items</h3>
              <p className="text-gray-600">
                Discover unique, pre-loved clothing items that are carefully curated by our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-10 sm:py-16 bg-gradient-to-br from-white via-sky-50 to-mint-50">
        <div className="container mx-auto px-2 sm:px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-700">Featured Items</h2>
            <Link href="/items">
              <Button className="bg-white/90 text-sky-700 border-2 border-sky-100 hover:bg-sky-50 font-semibold shadow-sm">View All Items</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredItems.length === 0 ? (
              <div className="col-span-4 text-center text-gray-400 py-12">No featured items yet. List and approve an item to see it here!</div>
            ) : (
              featuredItems.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="block">
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer bg-white border-2 border-sky-50">
                    <div className="aspect-square relative">
                      <Image src={item.images?.[0] || "/placeholder.svg?height=300&width=300"} alt={item.title} fill className="object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-sky-700">{item.title}</h3>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">{item.condition}</Badge>
                        <span className="text-sm font-medium text-mint-600">{item.points_value} points</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-16 bg-gradient-to-br from-white via-sky-100 to-mint-100 text-sky-800">
        <div className="container mx-auto px-2 sm:px-4 md:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4 drop-shadow-sm">Ready to Start Your Sustainable Fashion Journey?</h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">
            Join thousands of users who are making a difference, one swap at a time.
          </p>
          {user ? (
            <Link href="/my-items">
              <Button size="lg" className="bg-mint-400 text-sky-900 font-bold hover:bg-mint-300 shadow-sm">
                Go to My Items
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button size="lg" className="bg-sky-200 text-mint-900 font-bold hover:bg-sky-300 shadow-sm">
                Join ReWear Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
