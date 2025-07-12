import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get("id"))
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
  }
  try {
    // Get the category_id of the current item
    const items = await sql`SELECT category_id FROM items WHERE id = ${id} AND is_approved = true LIMIT 1`
    const item = items[0]
    if (!item) {
      return NextResponse.json({ items: [] })
    }
    // Get related items in the same category, excluding the current item
    const related = await sql`
      SELECT id, title, images, condition, points_value
      FROM items
      WHERE category_id = ${item.category_id} AND id != ${id} AND is_approved = true AND is_available = true
      ORDER BY created_at DESC
      LIMIT 4
    `
    return NextResponse.json({ items: related })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 