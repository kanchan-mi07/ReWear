"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [relatedItems, setRelatedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error || !item) return <div className="container mx-auto px-4 py-8 text-red-600">{error || "Item not found"}</div>

  const images: string[] = Array.isArray(item.images) ? item.images : (item.images ? [item.images] : [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </Button>
      </div>
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
          <div className="mb-2">
            <span className={item.is_available ? "text-green-700" : "text-gray-400"}>
              {item.is_available ? "Available" : "Not Available"}
            </span>
          </div>
          <p className="text-lg text-gray-700 mb-4 whitespace-pre-line">{item.description}</p>
          <div className="mb-4">
            <span className="font-semibold text-green-700">{item.points_value} points</span>
          </div>
          {/* Uploader Info */}
          <div className="mb-4 flex items-center gap-2">
            <Image src={item.user_avatar || "/placeholder-user.jpg"} alt={item.user_name} width={32} height={32} className="rounded-full" />
            <span className="text-sm text-gray-600">Listed by {item.user_name}</span>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <Button disabled={!item.is_available}>Request Swap</Button>
            <Button variant="outline" disabled={!item.is_available}>Redeem via Points</Button>
          </div>
        </div>
      </div>
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
    </div>
  )
} 