"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CoinsPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <Card className="max-w-xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4">
          <Coins className="h-8 w-8 text-yellow-500" />
          <CardTitle>Your Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{user ? user.points : "-"} coins</div>
          <div className="mb-4 text-gray-600">Coins are your reward and currency on ReWear.</div>
          <div className="font-semibold mb-2">How to earn coins:</div>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>List an item for the first time (+50 coins)</li>
            <li>Complete a successful swap (+100 coins)</li>
            <li>Invite a friend who joins (+30 coins)</li>
            <li>Participate in special events or promotions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 