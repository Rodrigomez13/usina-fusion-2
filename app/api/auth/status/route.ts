import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: session.user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al verificar la autenticación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
