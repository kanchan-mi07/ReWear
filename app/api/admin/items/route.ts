import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Only allow admin users
  const token = request.cookies.get("auth-token")?.value
  const user = await getCurrentUser(token)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "pending"

  let items: any[] = []
  try {
    if (status === "pending") {
      items = await sql`
        SELECT i.*, u.name as user_name, u.avatar_url as user_avatar
        FROM items i
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.is_approved = false
        ORDER BY i.created_at DESC
        LIMIT 20
      `
    } else if (status === "approved") {
      items = await sql`
        SELECT i.*, u.name as user_name, u.avatar_url as user_avatar
        FROM items i
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.is_approved = true AND i.is_available = true
        ORDER BY i.created_at DESC
        LIMIT 20
      `
    } else if (status === "rejected") {
      items = await sql`
        SELECT i.*, u.name as user_name, u.avatar_url as user_avatar
        FROM items i
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.is_approved = false AND i.is_available = false
        ORDER BY i.created_at DESC
        LIMIT 20
      `
    } else if (status === "removed") {
      items = await sql`
        SELECT i.*, u.name as user_name, u.avatar_url as user_avatar
        FROM items i
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.is_approved = true AND i.is_available = false
        ORDER BY i.created_at DESC
        LIMIT 20
      `
    }
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 