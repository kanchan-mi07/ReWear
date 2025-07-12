"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500">No notifications found.</div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n: any) => (
                <li key={n.id} className={`py-3 ${!n.is_read ? "bg-gray-50" : ""}`}>
                  <div className="flex justify-between items-center">
                    <span>{n.message}</span>
                    <Badge variant={n.is_read ? "secondary" : "default"}>{n.is_read ? "Read" : "Unread"}</Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 