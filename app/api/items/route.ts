import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const mine = searchParams.get("mine")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    let items
    if (mine === "1") {
      const token = request.cookies.get("auth-token")?.value
      const user = await getCurrentUser(token)
      if (!user) return NextResponse.json({ items: [] })
      items = await sql`
        SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
        FROM items i
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.user_id = ${user.id} AND i.is_approved = true AND i.is_available = true
        ORDER BY i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else if (category && category !== "all") {
      if (search) {
        items = await sql`
          SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
          FROM items i
          LEFT JOIN users u ON i.user_id = u.id
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE i.is_approved = true AND i.is_available = true 
            AND c.slug = ${category}
            AND (i.title ILIKE ${`%${search}%`} OR i.description ILIKE ${`%${search}%`})
          ORDER BY i.created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        items = await sql`
          SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
          FROM items i
          LEFT JOIN users u ON i.user_id = u.id
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE i.is_approved = true AND i.is_available = true 
            AND c.slug = ${category}
          ORDER BY i.created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      if (search) {
        items = await sql`
          SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
          FROM items i
          LEFT JOIN users u ON i.user_id = u.id
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE i.is_approved = true AND i.is_available = true 
            AND (i.title ILIKE ${`%${search}%`} OR i.description ILIKE ${`%${search}%`})
          ORDER BY i.created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        items = await sql`
          SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
          FROM items i
          LEFT JOIN users u ON i.user_id = u.id
          LEFT JOIN categories c ON i.category_id = c.id
          WHERE i.is_approved = true AND i.is_available = true
          ORDER BY i.created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Items fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category_id, type, size, condition, tags, images, points_value } = await request.json()

    if (!title || !category_id) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 })
    }

    const items = await sql`
      INSERT INTO items (user_id, title, description, category_id, type, size, condition, tags, images, points_value, is_approved)
      VALUES (${user.id}, ${title}, ${description}, ${category_id}, ${type}, ${size}, ${condition}, ${tags}, ${images}, ${points_value || 50}, false)
      RETURNING *
    `

    return NextResponse.json({ item: items[0] })
  } catch (error) {
    console.error("Item creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
