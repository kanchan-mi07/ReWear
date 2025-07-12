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
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-mint-50 py-8">
      <div className="container mx-auto px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-sky-700 hover:bg-sky-50">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <h1 className="text-4xl font-extrabold text-sky-700 mb-8 drop-shadow-sm">My Dashboard</h1>
      <div className="mb-6">
        <a href="/dashboard/swaps">
          <Button variant="outline" className="border-mint-300 text-mint-700 hover:bg-mint-50 font-semibold rounded-full px-6 py-2 shadow-sm">Manage Swap Requests</Button>
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Uploaded Items Overview */}
        <Card className="bg-white/90 border-2 border-mint-100 rounded-2xl shadow p-0">
          <CardHeader className="bg-mint-50 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-mint-700">Uploaded Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : uploadedItems.length > 0 ? (
              <ul className="divide-y divide-mint-100">
                {uploadedItems.map((item: any) => (
                  <li key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 hover:bg-mint-50 transition rounded-lg px-2">
                    <span>
                      <span className="font-semibold text-sky-700">{item.title}</span> <span className="text-xs text-gray-400">({item.condition})</span>
                    </span>
                    <span className="text-mint-700 font-medium bg-mint-100 rounded-full px-3 py-1 text-xs">{item.points_value} pts</span>
                    <span className={item.is_available ? "text-xs text-mint-600" : "text-xs text-gray-400"}>
                      {item.is_available ? "Available" : "Not Available"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No items uploaded yet. <Link href="/items/new" className="text-mint-700 underline">List your first item</Link></div>
            )}
          </CardContent>
        </Card>

        {/* Swaps Overview */}
        <Card className="bg-white/90 border-2 border-sky-100 rounded-2xl shadow p-0">
          <CardHeader className="bg-sky-50 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-sky-700">My Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : swaps.length > 0 ? (
              <ul className="divide-y divide-sky-100">
                {swaps.map((swap: any) => {
                  // Determine which item to link to: show the other user's item
                  const itemId = user && swap.requester_id === user.id ? swap.responder_item_id : swap.requester_item_id
                  return (
                    <li key={swap.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 cursor-pointer hover:bg-sky-50 transition rounded-lg px-2"
                      onClick={() => router.push(`/items/${itemId}`)}>
                      <span>
                        <span className="font-semibold text-sky-700">Item #{swap.requester_item_id} ↔ Item #{swap.responder_item_id}</span>
                        <span className="ml-2 text-xs text-gray-400">{new Date(swap.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className={
                        swap.status === "accepted"
                          ? "text-mint-700 bg-mint-100 rounded-full px-3 py-1 text-xs"
                          : swap.status === "pending"
                          ? "text-yellow-600 bg-yellow-50 rounded-full px-3 py-1 text-xs"
                          : "text-gray-400 bg-gray-50 rounded-full px-3 py-1 text-xs"
                      }>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-gray-400">No swaps yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
} 