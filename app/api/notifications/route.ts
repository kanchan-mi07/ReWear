import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = await getCurrentUser(token)
  if (!user) return NextResponse.json({ notifications: [] })
  const notifications = await sql`
    SELECT * FROM notifications WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 20
  `
  return NextResponse.json({ notifications })
} 