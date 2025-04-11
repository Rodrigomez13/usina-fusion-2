"use client"

import { useEffect } from "react"

export default function ForceRedirect({ to }: { to: string }) {
  useEffect(() => {
    console.log(`Redirigiendo forzadamente a: ${to}`)

    // Usar setTimeout para asegurar que el código se ejecute después de que el componente se monte
    const timer = setTimeout(() => {
      // Usar window.location.href para una redirección más directa
      window.location.href = to

      // Como respaldo, intentar también con replace
      setTimeout(() => {
        window.location.replace(to)
      }, 500)
    }, 1000)

    return () => clearTimeout(timer)
  }, [to])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e2a38] mx-auto"></div>
        </div>
        <p className="text-lg font-medium">Redirigiendo a {to}...</p>
      </div>
    </div>
  )
}
