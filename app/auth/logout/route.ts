import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export function GET(request: NextRequest) {
  const cookieStore = cookies()

  // Eliminar cookies de sesión
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")

  // Redirigir a la página de inicio de sesión
  return NextResponse.redirect(new URL("/login-html", request.url))
}
