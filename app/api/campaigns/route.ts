import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("campaigns").select("*").order("name")

    if (error) {
      console.error("Error fetching campaigns:", error)
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
    const campaignData = {
      name: body.name,
      campaign_id: body.campaign_id || null,
      objective: body.objective || null,
      status: body.status || "active",
      bm_id: body.business_manager_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("campaigns").insert([campaignData]).select().single()

    if (error) {
      console.error("Error creating campaign:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
