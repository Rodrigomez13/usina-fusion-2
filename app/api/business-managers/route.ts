import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("business_managers").select("*").order("name")

    if (error) {
      console.error("Error fetching business managers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Validar datos requeridos
    if (!body.name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    // Preparar datos para inserción
    const bmData = {
      name: body.name,
      bm_id: body.accountId || null,
      status: body.status || "active",
      portfolio_id: body.portfolio_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("business_managers").insert([bmData]).select().single()

    if (error) {
      console.error("Error creating business manager:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
