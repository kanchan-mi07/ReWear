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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-green-700 tracking-tight">Admin Panel</h1>
      <Tabs value={tab} onValueChange={setTab} className="mb-10 flex flex-col items-center">
        <TabsList className="bg-gray-100 rounded-lg shadow p-2">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="removed">Removed</TabsTrigger>
        </TabsList>
      </Tabs>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-lg text-gray-500">Loading...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-red-600 text-lg">{error}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <span className="text-gray-500 text-lg">No items found.</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden">
              <CardHeader className="bg-green-50 border-b p-4">
                <CardTitle className="text-xl font-bold text-green-800">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-6 mb-6 items-center">
                  <div className="w-36 h-36 relative rounded-xl overflow-hidden border shadow">
                    <Image src={item.images?.[0] || "/placeholder.svg?height=200&width=200"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <Badge variant="secondary">{item.condition}</Badge>
                      <span className="text-green-700 font-semibold text-lg">{item.points_value} pts</span>
                    </div>
                    <div className="mb-3 text-base text-gray-700 flex items-center gap-2">
                      <Image src={item.user_avatar || "/placeholder-user.jpg"} alt={item.user_name} width={32} height={32} className="rounded-full border" />
                      <span className="font-medium">{item.user_name}</span>
                    </div>
                    <div className={`mb-3 text-xs font-semibold ${item.is_available ? 'text-green-600' : 'text-gray-400'}`}>{item.is_available ? "Available" : "Not Available"}</div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  {tab === "pending" && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(item.id)}>Approve</Button>}
                  {tab === "pending" && <Button size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" onClick={() => handleReject(item.id)}>Reject</Button>}
                  <Button size="sm" variant="destructive" className="hover:bg-red-700" onClick={() => handleDelete(item.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 