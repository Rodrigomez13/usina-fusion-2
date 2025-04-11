import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("apis").select("*").eq("id", params.id).single()

    if (error) {
      console.error(`Error fetching API with ID ${params.id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Validar datos requeridos
    if (!body.name || !body.token) {
      return NextResponse.json({ error: "El nombre y el token son obligatorios" }, { status: 400 })
    }

    // Preparar datos para actualización
    const apiData = {
      name: body.name,
      token: body.token,
      phone: body.phone,
      messages_per_day: body.messages_per_day,
      monthly_cost: body.monthly_cost,
      status: body.status,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("apis").update(apiData).eq("id", params.id).select().single()

    if (error) {
      console.error(`Error updating API with ID ${params.id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("apis").delete().eq("id", params.id)

    if (error) {
      console.error(`Error deleting API with ID ${params.id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
