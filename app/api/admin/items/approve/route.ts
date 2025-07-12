import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = await getCurrentUser(token)
  if (!user || !user.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Missing item id" }, { status: 400 })
  }
  try {
    await sql`
      UPDATE items SET is_approved = true, is_available = true WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 