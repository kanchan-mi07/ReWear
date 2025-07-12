import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection and get user count
    const users = await sql`
      SELECT id, email, name, is_admin, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `

    return NextResponse.json({ 
      success: true,
      userCount: users.length,
      users: users,
      message: "Database connection successful"
    })
  } catch (error) {
    console.error("Debug users error:", error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Database connection failed"
    }, { status: 500 })
  }
} 