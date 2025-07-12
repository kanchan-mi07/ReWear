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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8">My Swaps</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : incoming.length > 0 ? (
              <ul className="space-y-4">
                {incoming.map((swap) => (
                  <li key={swap.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span>From user #{swap.requester_id}</span>
                      <Badge>{swap.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">Requested item #{swap.responder_item_id} for your item #{swap.requester_item_id}</div>
                    {swap.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={async () => {
                          await fetch("/api/swaps", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ swap_id: swap.id, status: "accepted" }),
                            credentials: "include"
                          })
                          fetchSwaps()
                        }}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          await fetch("/api/swaps", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ swap_id: swap.id, status: "declined" }),
                            credentials: "include"
                          })
                          fetchSwaps()
                        }}>Decline</Button>
                        <Button size="sm" variant="secondary" onClick={async () => {
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
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No incoming swap requests.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outgoing Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : outgoing.length > 0 ? (
              <ul className="space-y-4">
                {outgoing.map((swap) => (
                  <li key={swap.id} className="border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span>To user #{swap.responder_id}</span>
                      <Badge>{swap.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">Your item #{swap.requester_item_id} for item #{swap.responder_item_id}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No outgoing swap requests.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 