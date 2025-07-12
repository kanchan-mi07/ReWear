"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface Item {
  id: number
  title: string
  condition: string
  points_value: number
  is_available: boolean
}

interface Swap {
  id: number
  item_title: string
  status: string // "ongoing" | "completed"
  created_at: string
}

export default function DashboardPage() {
  const [uploadedItems, setUploadedItems] = useState<Item[]>([])
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // TODO: Fetch uploaded items and swaps for the current user
    // Placeholder data for now
    setUploadedItems([
      { id: 1, title: "Vintage Denim Jacket", condition: "Good", points_value: 75, is_available: true },
      { id: 2, title: "Summer Floral Dress", condition: "Excellent", points_value: 60, is_available: false },
    ])
    setSwaps([
      { id: 1, item_title: "Designer Sneakers", status: "ongoing", created_at: "2024-06-01" },
      { id: 2, item_title: "Wool Winter Coat", status: "completed", created_at: "2024-05-20" },
    ])
    setLoading(false)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
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
                {uploadedItems.map((item) => (
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
                {swaps.map((swap) => (
                  <li key={swap.id} className="flex justify-between items-center border-b pb-2">
                    <span>
                      <span className="font-semibold">{swap.item_title}</span>
                      <span className="ml-2 text-xs text-gray-500">{swap.created_at}</span>
                    </span>
                    <span className={swap.status === "completed" ? "text-green-700" : "text-yellow-600"}>
                      {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                    </span>
                  </li>
                ))}
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