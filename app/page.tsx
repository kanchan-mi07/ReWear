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

export default function HomePage() {
  const [user, setUser] = useState<AppUser | null>(null)

  useEffect(() => {
    fetchUser()
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

  const featuredItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      image: "/placeholder.svg?height=300&width=300",
      condition: "Good",
      points: 75,
    },
    {
      id: 2,
      title: "Summer Floral Dress",
      image: "/placeholder.svg?height=300&width=300",
      condition: "Excellent",
      points: 60,
    },
    {
      id: 3,
      title: "Designer Sneakers",
      image: "/placeholder.svg?height=300&width=300",
      condition: "Like New",
      points: 90,
    },
    {
      id: 4,
      title: "Wool Winter Coat",
      image: "/placeholder.svg?height=300&width=300",
      condition: "Good",
      points: 85,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-700">ReWear</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community clothing exchange platform. Swap, share, and discover pre-loved fashion while promoting
            sustainable living.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/items">
              <Button size="lg" className="bg-green-700 hover:bg-green-800">
                Start Swapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/items">
              <Button size="lg" variant="outline">
                Browse Items
              </Button>
            </Link>
            <Link href="/items/new">
              <Button size="lg" variant="outline">
                List an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ReWear?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainable Fashion</h3>
              <p className="text-gray-600">
                Reduce textile waste and promote eco-friendly fashion choices through clothing reuse.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Connect with like-minded individuals who share your passion for sustainable living.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Items</h3>
              <p className="text-gray-600">
                Discover unique, pre-loved clothing items that are carefully curated by our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Items</h2>
            <Link href="/items">
              <Button variant="outline">View All Items</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{item.condition}</Badge>
                    <span className="text-sm font-medium text-green-700">{item.points} points</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Sustainable Fashion Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are making a difference, one swap at a time.
          </p>
          {user ? (
            <Link href="/items">
              <Button size="lg" variant="secondary">
                Go to My Items
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button size="lg" variant="secondary">
                Join ReWear Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
