"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [relatedItems, setRelatedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [showSwapDialog, setShowSwapDialog] = useState(false)
  const [myItems, setMyItems] = useState<any[]>([])
  const [selectedMyItem, setSelectedMyItem] = useState<number | null>(null)
  const [pendingSwap, setPendingSwap] = useState<any>(null)
  const [activeSwap, setActiveSwap] = useState<any>(null)
  const { toast } = useToast()
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetch(`/api/items/${id}`).then(res => res.ok ? res.json() : Promise.reject("Item not found")),
      fetch(`/api/items/related?id=${id}`).then(res => res.ok ? res.json() : [])
    ])
      .then(([itemData, relatedData]) => {
        setItem(itemData.item)
        setRelatedItems(relatedData.items || [])
      })
      .catch((err) => setError(typeof err === "string" ? err : "Failed to load item"))
      .finally(() => setLoading(false))
  }, [id])

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

  // Fetch user's available items for swap
  const fetchMyItems = async () => {
    try {
      const res = await fetch("/api/items?mine=1")
      if (res.ok) {
        const data = await res.json()
        setMyItems(data.items)
      }
    } catch {}
  }

  // Fetch user's pending swap for this item
  const fetchPendingSwap = async () => {
    if (!user || !item) return
    const res = await fetch("/api/swaps", { credentials: "include" })
    if (res.ok) {
      const data = await res.json()
      const found = (data.swaps || []).find((s: any) => s.requester_id === user.id && s.responder_item_id === item.id && s.status === "pending")
      setPendingSwap(found || null)
    }
  }

  // Find if user is involved in a reserved swap for this item
  const fetchActiveSwap = async () => {
    if (!user || !item) return
    const res = await fetch("/api/swaps", { credentials: "include" })
    if (res.ok) {
      const data = await res.json()
      const found = (data.swaps || []).find((s: any) =>
        (s.requester_id === user.id || s.responder_id === user.id) &&
        (s.requester_item_id === item.id || s.responder_item_id === item.id) &&
        s.status === "accepted"
      )
      setActiveSwap(found || null)
    }
  }
  useEffect(() => {
    if (user && item) fetchActiveSwap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, item])

  useEffect(() => {
    if (user && item) fetchPendingSwap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, item])

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error || !item) return <div className="container mx-auto px-4 py-8 text-red-600">{error || "Item not found"}</div>

  // Only show chat/delivery if user is involved in a reserved swap
  const showSwapOnly = item.status === "reserved" && activeSwap && user && (activeSwap.requester_id === user.id || activeSwap.responder_id === user.id)

  const images: string[] = Array.isArray(item.images) ? item.images : (item.images ? [item.images] : [])

  // Helper to parse chat thread
  const chatMessages = activeSwap?.chat_thread ? JSON.parse(activeSwap.chat_thread) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </Button>
      </div>
      {showSwapOnly ? (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Swap Communication</h1>
          <div className="w-full max-w-lg">
            <div className="mb-2">Contact your swap partner to coordinate delivery:</div>
            {/* Chat UI */}
            <div className="mb-2 border rounded bg-white max-h-48 overflow-y-auto p-2">
              {chatMessages.length === 0 ? (
                <div className="text-gray-400">No messages yet.</div>
              ) : chatMessages.map((msg: any, i: number) => (
                <div key={i} className={msg.userId === user.id ? "text-right" : "text-left"}>
                  <span className="inline-block px-2 py-1 rounded bg-gray-100 mb-1">{msg.text}</span>
                  <div className="text-xs text-gray-400">{msg.userName} • {new Date(msg.time).toLocaleTimeString()}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="flex gap-2" onSubmit={async e => {
              e.preventDefault()
              if (!chatInput.trim()) return
              const newMsg = { userId: user.id, userName: user.name, text: chatInput, time: Date.now() }
              const newThread = JSON.stringify([...chatMessages, newMsg])
              await fetch("/api/swaps", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ swap_id: activeSwap.id, chat_thread: newThread }),
                credentials: "include"
              })
              setChatInput("")
              fetchActiveSwap()
              setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
            }}>
              <input
                className="flex-1 border rounded px-2 py-1"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
              />
              <Button type="submit" size="sm">Send</Button>
            </form>
            {/* Delivery method selection */}
            <div className="mt-4">
              <div className="font-semibold mb-1">Choose delivery method:</div>
              <select
                className="border rounded px-2 py-1"
                value={activeSwap.delivery_method || ""}
                onChange={async e => {
                  await fetch("/api/swaps", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ swap_id: activeSwap.id, delivery_method: e.target.value }),
                    credentials: "include"
                  })
                  fetchActiveSwap()
                }}
              >
                <option value="">Select...</option>
                <option value="meetup">Meetup (in-person handoff)</option>
                <option value="shipping">Shipping</option>
              </select>
              {activeSwap.delivery_method && (
                <div className="text-sm text-gray-600 mt-2">Selected: {activeSwap.delivery_method === "meetup" ? "Meetup (in-person)" : "Shipping"}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Gallery */}
          <div className="flex-1">
            <div className="mb-4 grid grid-cols-1 gap-4">
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <div key={idx} className="aspect-square relative w-full max-w-md mx-auto border rounded-lg overflow-hidden">
                    <Image src={img || "/placeholder.svg?height=400&width=400"} alt={item.title} fill className="object-cover" />
                  </div>
                ))
              ) : (
                <div className="aspect-square relative w-full max-w-md mx-auto border rounded-lg overflow-hidden">
                  <Image src="/placeholder.svg?height=400&width=400" alt="No image" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
          {/* Item Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
            <Badge variant="secondary" className="mb-2">{item.condition}</Badge>
            {/* Item Status */}
            {item.status === "reserved" && (
              <div className="mb-2">
                <Badge variant="destructive">Reserved</Badge>
              </div>
            )}
            <p className="text-lg text-gray-700 mb-4 whitespace-pre-line">{item.description}</p>
            <div className="mb-4">
              <span className="font-semibold text-green-700">{item.points_value} points</span>
            </div>
            {/* Uploader Info */}
            <div className="mb-4 flex items-center gap-2">
              <Image src={item.user_avatar || "/placeholder-user.jpg"} alt={item.user_name} width={32} height={32} className="rounded-full" />
              <span className="text-sm text-gray-600">Listed by {item.user_name || "Unknown"}</span>
            </div>
            {/* Action Buttons */}
            {item.status === "reserved" ? (
              activeSwap ? (
                <div className="mb-4 p-4 border rounded bg-yellow-50">
                  <div className="font-semibold mb-2">This item is reserved for your swap!</div>
                  <div className="mb-2">Contact your swap partner to coordinate delivery:</div>
                  {/* Chat UI */}
                  <div className="mb-2 border rounded bg-white max-h-48 overflow-y-auto p-2">
                    {chatMessages.length === 0 ? (
                      <div className="text-gray-400">No messages yet.</div>
                    ) : chatMessages.map((msg: any, i: number) => (
                      <div key={i} className={msg.userId === user.id ? "text-right" : "text-left"}>
                        <span className="inline-block px-2 py-1 rounded bg-gray-100 mb-1">{msg.text}</span>
                        <div className="text-xs text-gray-400">{msg.userName} • {new Date(msg.time).toLocaleTimeString()}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form className="flex gap-2" onSubmit={async e => {
                    e.preventDefault()
                    if (!chatInput.trim()) return
                    const newMsg = { userId: user.id, userName: user.name, text: chatInput, time: Date.now() }
                    const newThread = JSON.stringify([...chatMessages, newMsg])
                    await fetch("/api/swaps", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ swap_id: activeSwap.id, chat_thread: newThread }),
                      credentials: "include"
                    })
                    setChatInput("")
                    fetchActiveSwap()
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
                  }}>
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                    />
                    <Button type="submit" size="sm">Send</Button>
                  </form>
                  {/* Delivery method selection */}
                  <div className="mt-4">
                    <div className="font-semibold mb-1">Choose delivery method:</div>
                    <select
                      className="border rounded px-2 py-1"
                      value={activeSwap.delivery_method || ""}
                      onChange={async e => {
                        await fetch("/api/swaps", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ swap_id: activeSwap.id, delivery_method: e.target.value }),
                          credentials: "include"
                        })
                        fetchActiveSwap()
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="meetup">Meetup (in-person handoff)</option>
                      <option value="shipping">Shipping</option>
                    </select>
                    {activeSwap.delivery_method && (
                      <div className="text-sm text-gray-600 mt-2">Selected: {activeSwap.delivery_method === "meetup" ? "Meetup (in-person)" : "Shipping"}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <Badge variant="destructive">Reserved</Badge>
                  <div className="text-gray-500 mt-2">This item is currently reserved for another swap.</div>
                </div>
              )
            ) : user && item.user_id === user.id ? null : (
            <div className="flex gap-4 mb-4">
                {pendingSwap ? (
                  <>
                    <Button disabled>Request Sent</Button>
                    <Button variant="destructive" onClick={async () => {
                      await fetch(`/api/swaps`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ swap_id: pendingSwap.id, status: "cancelled" }),
                        credentials: "include"
                      })
                      setPendingSwap(null)
                      toast({ title: "Swap request cancelled" })
                    }}>Cancel Request</Button>
                  </>
                ) : user ? (
                  <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
                    <DialogTrigger asChild>
                      <Button
                        disabled={!item.is_available}
                        onClick={() => {
                          fetchMyItems()
                          setShowSwapDialog(true)
                        }}
                      >
                        Request Swap
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select an item to offer for swap</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {myItems.length === 0 ? (
                          <div className="text-gray-500">No items available to offer.</div>
                        ) : (
                          myItems.map((myItem: any) => (
                            <div key={myItem.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${selectedMyItem === myItem.id ? 'border-green-600 bg-green-50' : ''}`}
                              onClick={() => setSelectedMyItem(myItem.id)}>
                              <Image src={myItem.images?.[0] || "/placeholder.svg?height=60&width=60"} alt={myItem.title} width={48} height={48} className="rounded" />
                              <span>{myItem.title}</span>
                              <Badge variant="secondary">{myItem.condition}</Badge>
                            </div>
                          ))
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          disabled={!selectedMyItem}
                          onClick={async () => {
                            if (!selectedMyItem) return
                            const res = await fetch("/api/swaps", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                responder_id: item.user_id,
                                requester_item_id: selectedMyItem,
                                responder_item_id: item.id
                              }),
                              credentials: "include"
                            })
                            if (res.status === 401) {
                              toast({ title: "You must be logged in to send a swap request", variant: "destructive" })
                              setShowSwapDialog(false)
                              router.push("/auth")
                              return
                            }
                            if (res.ok) {
                              toast({ title: "Swap request sent successfully!" })
                              setShowSwapDialog(false)
                              fetchPendingSwap()
                            } else {
                              toast({ title: "Failed to send swap request", variant: "destructive" })
                            }
                          }}
                        >
                          Send Swap Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    disabled={!item.is_available}
                    onClick={() => router.push("/auth")}
                  >
                    Request Swap
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={!item.is_available}
                  onClick={() => {
                    if (!user) {
                      router.push("/auth")
                      return
                    }
                    // TODO: handle redeem logic here
                  }}
                >
                  Redeem via Points
                </Button>
            </div>
            )}
          </div>
        </div>
      )}
      {/* Only show related items if not in swap communication view */}
      {!showSwapOnly && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Items</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.length > 0 ? (
              relatedItems.map((related) => (
                <Link key={related.id} href={`/items/${related.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-square relative">
                      <Image src={related.images?.[0] || "/placeholder.svg?height=300&width=300"} alt={related.title} fill className="object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{related.title}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="secondary">{related.condition}</Badge>
                        <span className="text-sm font-medium text-green-700">{related.points_value} points</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No related items found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 