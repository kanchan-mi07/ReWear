"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const [uploadedItems, setUploadedItems] = useState<any[]>([])
  const [swaps, setSwaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUploadedItems()
      fetchSwaps()
    }
  }, [user])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
    setLoading(false)
  }

  const fetchUploadedItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/items?mine=1", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUploadedItems(data.items)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSwaps = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/swaps", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setSwaps(data.swaps)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      <div className="mb-6">
        <a href="/dashboard/swaps">
          <Button variant="outline">Manage Swap Requests</Button>
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Uploaded Items Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : uploadedItems.length > 0 ? (
              <ul className="space-y-4">
                {uploadedItems.map((item: any) => (
                  <li key={item.id} className="flex justify-between items-center border-b pb-2">
                    <span>
                      <span className="font-semibold">{item.title}</span> <span className="text-xs text-gray-500">({item.condition})</span>
                    </span>
                    <span className="text-green-700 font-medium">{item.points_value} pts</span>
                    <span className={item.is_available ? "text-xs text-green-600" : "text-xs text-gray-400"}>
                      {item.is_available ? "Available" : "Not Available"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No items uploaded yet. <Link href="/items/new" className="text-green-700 underline">List your first item</Link></div>
            )}
          </CardContent>
        </Card>

        {/* Swaps Overview */}
        <Card>
          <CardHeader>
            <CardTitle>My Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : swaps.length > 0 ? (
              <ul className="space-y-4">
                {swaps.map((swap: any) => {
                  // Determine which item to link to: show the other user's item
                  const itemId = user && swap.requester_id === user.id ? swap.responder_item_id : swap.requester_item_id
                  return (
                    <li key={swap.id} className="flex justify-between items-center border-b pb-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/items/${itemId}`)}>
                      <span>
                        <span className="font-semibold">Item #{swap.requester_item_id} ↔ Item #{swap.responder_item_id}</span>
                        <span className="ml-2 text-xs text-gray-500">{new Date(swap.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className={swap.status === "accepted" ? "text-green-700" : swap.status === "pending" ? "text-yellow-600" : "text-gray-400"}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-gray-500">No swaps yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 