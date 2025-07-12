import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

async function createNotification(user_id: number, type: string, swap_id: number, message: string) {
  await sql`
    INSERT INTO notifications (user_id, type, swap_id, message)
    VALUES (${user_id}, ${type}, ${swap_id}, ${message})
  `
}

// Create a new swap request
export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = await getCurrentUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const { responder_id, requester_item_id, responder_item_id } = body
  if (!responder_id || !requester_item_id || !responder_item_id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  // Prevent duplicate pending swap
  const existing = await sql`
    SELECT * FROM swaps WHERE requester_id = ${user.id} AND responder_item_id = ${responder_item_id} AND status = 'pending'
  `
  if (existing.length > 0) {
    return NextResponse.json({ error: "Swap request already sent" }, { status: 409 })
  }
  const result = await sql`
    INSERT INTO swaps (requester_id, responder_id, requester_item_id, responder_item_id)
    VALUES (${user.id}, ${responder_id}, ${requester_item_id}, ${responder_item_id})
    RETURNING *
  `
  // Notify responder
  await createNotification(responder_id, "swap_request", result[0].id, `You have a new swap request from ${user.name || "a user"}`)
  return NextResponse.json({ swap: result[0] })
}

// List swaps for the current user
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = await getCurrentUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const swaps = await sql`
    SELECT * FROM swaps WHERE requester_id = ${user.id} OR responder_id = ${user.id} ORDER BY created_at DESC
  `
  return NextResponse.json({ swaps })
}

// Update swap status (accept, decline, counter-offer, cancel)
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const user = await getCurrentUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const { swap_id, status, responder_item_id } = body
  if (!swap_id || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  // Only responder can update status, except for cancel
  const swap = (await sql`SELECT * FROM swaps WHERE id = ${swap_id}`)[0]
  if (!swap) return NextResponse.json({ error: "Swap not found" }, { status: 404 })
  let result
  if (status === "cancelled") {
    // Only requester can cancel
    if (swap.requester_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    result = await sql`
      UPDATE swaps SET status = 'cancelled', updated_at = NOW() WHERE id = ${swap_id} RETURNING *
    `
    // Notify responder
    await createNotification(swap.responder_id, "swap_cancelled", swap_id, `Swap request from ${user.name || "a user"} was cancelled`)
  } else if (status === "countered" && responder_item_id) {
    if (swap.responder_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    result = await sql`
      UPDATE swaps SET status = ${status}, responder_item_id = ${responder_item_id}, updated_at = NOW() WHERE id = ${swap_id} RETURNING *
    `
    // Notify requester
    await createNotification(swap.requester_id, "swap_countered", swap_id, `Your swap request was countered by ${user.name || "the responder"}`)
  } else if (status === "accepted") {
    if (swap.responder_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // Set both items to reserved
    await sql`UPDATE items SET status = 'reserved' WHERE id = ${swap.requester_item_id} OR id = ${swap.responder_item_id}`
    result = await sql`
      UPDATE swaps SET status = 'accepted', updated_at = NOW() WHERE id = ${swap_id} RETURNING *
    `
    // Fetch item names for notification
    const items = await sql`SELECT id, title FROM items WHERE id = ${swap.requester_item_id} OR id = ${swap.responder_item_id}`
    const reqItem = items.find((i: any) => i.id === swap.requester_item_id)
    const resItem = items.find((i: any) => i.id === swap.responder_item_id)
    // Notify both users
    await createNotification(swap.requester_id, "swap_accepted", swap_id, `Your swap request with ${user.name || "the responder"} has been accepted! Items: ${reqItem?.title} ↔ ${resItem?.title}`)
    await createNotification(swap.responder_id, "swap_accepted", swap_id, `You accepted a swap with ${user.name || "the responder"}. Items: ${reqItem?.title} ↔ ${resItem?.title}`)
  } else {
    if (swap.responder_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    result = await sql`
      UPDATE swaps SET status = ${status}, updated_at = NOW() WHERE id = ${swap_id} RETURNING *
    `
    // Notify requester
    let type = status === "declined" ? "swap_declined" : "swap_updated"
    let msg = status === "declined"
      ? `Your swap request was declined by ${user.name || "the responder"}`
      : `Your swap request was updated by ${user.name || "the responder"}`
    await createNotification(swap.requester_id, type, swap_id, msg)
  }
  return NextResponse.json({ swap: result[0] })
} 