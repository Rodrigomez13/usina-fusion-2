import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Obtener el email y la nueva contraseña de los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const password = searchParams.get("password") || "usina123" // Contraseña predeterminada

    if (!email) {
      return NextResponse.json({ error: "Se requiere un email" }, { status: 400 })
    }

    // Crear cliente con la clave de servicio para tener acceso completo
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Buscar el usuario por email usando la API pública
    const {
      data: { users },
      error: userError,
    } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email,
      },
    })

    if (userError || !users || users.length === 0) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
          details: userError?.message || "No se encontró ningún usuario con ese email",
        },
        { status: 404 },
      )
    }

    const user = users[0]

    // Actualizar la contraseña del usuario
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar la contraseña", details: updateError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Contraseña restablecida para ${email}`,
      newPassword: password,
    })
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
