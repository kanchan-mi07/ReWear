import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

export interface User {
  id: number
  email: string
  name: string
  points: number
  avatar_url?: string
  is_admin: boolean
  created_at: string
}

export interface Item {
  id: number
  user_id: number
  title: string
  description?: string
  category_id: number
  type?: string
  size?: string
  condition?: string
  tags?: string[]
  images?: string[]
  points_value: number
  is_available: boolean
  is_approved: boolean
  created_at: string
  user?: User
  category?: Category
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface SwapRequest {
  id: number
  requester_id: number
  item_id: number
  offered_item_id?: number
  status: string
  message?: string
  created_at: string
  requester?: User
  item?: Item
  offered_item?: Item
}
