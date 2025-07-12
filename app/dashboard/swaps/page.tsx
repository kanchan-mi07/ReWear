"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function SwapsDashboard() {
  const [swaps, setSwaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
    fetchSwaps()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
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

  // Separate incoming and outgoing swaps using authenticated user
  const incoming = user ? swaps.filter((s) => s.responder_id === user.id) : []
  const outgoing = user ? swaps.filter((s) => s.requester_id === user.id) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-mint-50 py-8">
      <div className="container mx-auto px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-sky-700 hover:bg-sky-50">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <h1 className="text-4xl font-extrabold text-sky-700 mb-8 drop-shadow-sm">My Swaps</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white/90 border-2 border-mint-100 rounded-2xl shadow p-0">
          <CardHeader className="bg-mint-50 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-mint-700">Incoming Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : incoming.length > 0 ? (
              <ul className="divide-y divide-mint-100">
                {incoming.map((swap) => {
                  const itemId = user && swap.requester_id === user.id ? swap.responder_item_id : swap.requester_item_id
                  return (
                    <li key={swap.id} className="flex flex-col gap-2 py-3 px-2 cursor-pointer hover:bg-mint-50 transition rounded-lg"
                      onClick={() => router.push(`/items/${itemId}`)}>
                      <div className="flex justify-between items-center">
                        <span className="text-sky-700 font-semibold">From user #{swap.requester_id}</span>
                        <Badge className={
                          swap.status === "accepted"
                            ? "bg-mint-100 text-mint-700"
                            : swap.status === "pending"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-gray-50 text-gray-400"
                        }>{swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</Badge>
                      </div>
                      <div className="text-xs text-gray-400">Requested item #{swap.responder_item_id} for your item #{swap.requester_item_id}</div>
                      {swap.status === "pending" && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button size="sm" className="bg-mint-400 text-sky-900 font-bold hover:bg-mint-300 shadow-sm" onClick={async (e) => {
                            e.stopPropagation();
                            await fetch("/api/swaps", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ swap_id: swap.id, status: "accepted" }),
                              credentials: "include"
                            })
                            fetchSwaps()
                          }}>Accept</Button>
                          <Button size="sm" variant="outline" className="border-sky-100 text-sky-700 hover:bg-sky-50 shadow-sm" onClick={async (e) => {
                            e.stopPropagation();
                            await fetch("/api/swaps", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ swap_id: swap.id, status: "declined" }),
                              credentials: "include"
                            })
                            fetchSwaps()
                          }}>Decline</Button>
                          <Button size="sm" variant="secondary" className="bg-sky-200 text-mint-900 font-bold hover:bg-sky-300 shadow-sm" onClick={async (e) => {
                            e.stopPropagation();
                            const newItemId = prompt("Enter your item ID to counter-offer:")
                            if (!newItemId) return
                            await fetch("/api/swaps", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ swap_id: swap.id, status: "countered", responder_item_id: Number(newItemId) }),
                              credentials: "include"
                            })
                            fetchSwaps()
                          }}>Counter-Offer</Button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-gray-400">No incoming swap requests.</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white/90 border-2 border-sky-100 rounded-2xl shadow p-0">
          <CardHeader className="bg-sky-50 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-sky-700">Outgoing Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : outgoing.length > 0 ? (
              <ul className="divide-y divide-sky-100">
                {outgoing.map((swap) => (
                  <li key={swap.id} className="flex flex-col gap-2 py-3 px-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sky-700 font-semibold">To user #{swap.responder_id}</span>
                      <Badge className={
                        swap.status === "accepted"
                          ? "bg-mint-100 text-mint-700"
                          : swap.status === "pending"
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-gray-50 text-gray-400"
                      }>{swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}</Badge>
                    </div>
                    <div className="text-xs text-gray-400">Your item #{swap.requester_item_id} for item #{swap.responder_item_id}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No outgoing swap requests.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
} 