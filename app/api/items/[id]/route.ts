import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const itemId = Number(context.params.id)
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
  }
  try {
    const items = await sql`
      SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
      FROM items i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ${itemId} AND i.is_approved = true
      LIMIT 1
    `
    const item = items[0]
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 