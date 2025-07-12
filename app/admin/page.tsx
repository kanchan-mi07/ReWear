"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"

interface Item {
  id: number
  title: string
  images: string[]
  condition: string
  points_value: number
  is_available: boolean
  is_approved: boolean
  user_name: string
  user_avatar?: string
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("pending")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check admin access on mount
  useEffect(() => {
    fetch("/api/auth/me").then(async (res) => {
      if (!res.ok) return router.replace("/admin/login")
      const data = await res.json()
      if (!data.user?.is_admin) router.replace("/admin/login")
    })
  }, [router])

  // Fetch items for current tab
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/admin/items?status=${tab}`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch items"))
      .then(data => setItems(data.items || []))
      .catch(err => setError(typeof err === "string" ? err : "Failed to fetch items"))
      .finally(() => setLoading(false))
  }, [tab])

  // Placeholder action handlers
  const handleApprove = async (id: number) => {
    if (!confirm("Approve this item?")) return;
    await fetch("/api/admin/items/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(items.filter(item => item.id !== id));
  };
  const handleReject = async (id: number) => {
    if (!confirm("Reject this item?")) return;
    await fetch("/api/admin/items/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(items.filter(item => item.id !== id));
  };
  const handleDelete = async (id: number) => {
    if (!confirm("Remove this item from the website?")) return;
    await fetch("/api/admin/items/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="removed">Removed</TabsTrigger>
        </TabsList>
      </Tabs>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No items found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="w-32 h-32 relative">
                    <Image src={item.images?.[0] || "/placeholder.svg?height=200&width=200"} alt={item.title} fill className="object-cover rounded" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <Badge variant="secondary">{item.condition}</Badge>
                      <span className="ml-2 text-green-700 font-medium">{item.points_value} pts</span>
                    </div>
                    <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
                      <Image src={item.user_avatar || "/placeholder-user.jpg"} alt={item.user_name} width={24} height={24} className="rounded-full" />
                      {item.user_name}
                    </div>
                    <div className="mb-2 text-xs text-gray-500">{item.is_available ? "Available" : "Not Available"}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {tab === "pending" && <Button size="sm" onClick={() => handleApprove(item.id)}>Approve</Button>}
                  {tab === "pending" && <Button size="sm" variant="outline" onClick={() => handleReject(item.id)}>Reject</Button>}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 