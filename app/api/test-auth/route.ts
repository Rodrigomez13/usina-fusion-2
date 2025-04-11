import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET() {
  try {
    // Verificar la conexión a Supabase
    const { data: versionData, error: versionError } = await supabase.from("user_roles").select("*").limit(1)

    if (versionError) {
      return NextResponse.json(
        {
          error: "Error al conectar con Supabase",
          details: versionError.message,
          code: versionError.code,
        },
        { status: 500 },
      )
    }

    // Intentar iniciar sesión con credenciales de prueba
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "admin@usina.com",
      password: "usina123",
    })

    if (authError) {
      return NextResponse.json(
        {
          error: "Error de autenticación",
          details: authError.message,
          code: authError.code,
          status: authError.status,
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa",
      user: authData.user?.email,
      tables: versionData ? "Datos de tablas accesibles" : "No se pudieron leer datos de tablas",
    })
  } catch (error: any) {
    console.error("Error en la prueba de autenticación:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
