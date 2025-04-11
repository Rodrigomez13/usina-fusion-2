import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("apis").select("*").order("name")

    if (error) {
      console.error("Error fetching APIs:", error)
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
    if (!body.name || !body.token) {
      return NextResponse.json({ error: "El nombre y el token son obligatorios" }, { status: 400 })
    }

    // Preparar datos para inserción
    const apiData = {
      name: body.name,
      token: body.token,
      phone: body.phone || null,
      messages_per_day: body.messages_per_day || 0,
      monthly_cost: body.monthly_cost || 0,
      status: body.status || "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("apis").insert([apiData]).select().single()

    if (error) {
      console.error("Error creating API:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
