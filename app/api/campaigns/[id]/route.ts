import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("campaigns").select("*").eq("id", params.id).single()

    if (error) {
      console.error(`Error fetching campaign with ID ${params.id}:`, error)
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
    if (!body.name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    // Preparar datos para actualización
    const campaignData = {
      name: body.name,
      campaign_id: body.campaign_id,
      objective: body.objective,
      status: body.status,
      bm_id: body.bm_id,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("campaigns")
      .update(campaignData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating campaign with ID ${params.id}:`, error)
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
    const { error } = await supabase.from("campaigns").delete().eq("id", params.id)

    if (error) {
      console.error(`Error deleting campaign with ID ${params.id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
