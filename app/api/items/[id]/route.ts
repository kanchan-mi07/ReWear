import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, context: any) {
  const params = await context.params;
  const itemId = Number(params.id);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }
  try {
    const items = await sql`
      SELECT i.*, u.name as user_name, u.avatar_url as user_avatar, c.name as category_name
      FROM items i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ${itemId} AND i.is_approved = true
      LIMIT 1
    `;
    const item = items[0];
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: any) {
  // Redeem item via points
  const token = req.cookies.get("auth-token")?.value;
  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = await context.params;
  const itemId = Number(params.id);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }
  // Fetch item
  const items = await sql`SELECT * FROM items WHERE id = ${itemId} AND is_approved = true AND is_available = true LIMIT 1`;
  const item = items[0];
  if (!item) {
    return NextResponse.json({ error: "Item not available for redemption" }, { status: 404 });
  }
  if (item.user_id === user.id) {
    return NextResponse.json({ error: "You cannot redeem your own item" }, { status: 400 });
  }
  // Check user points
  if (user.points < item.points_value) {
    return NextResponse.json({ error: "Not enough points" }, { status: 400 });
  }
  // Deduct points and reserve item
  await sql`UPDATE users SET points = points - ${item.points_value} WHERE id = ${user.id}`;
  await sql`UPDATE items SET status = 'reserved', is_available = false WHERE id = ${itemId}`;
  // Optionally: notify item owner (not implemented here)
  return NextResponse.json({ success: true });
} 