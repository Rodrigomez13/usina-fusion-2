"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function BasicLogin() {
  const [email, setEmail] = useState("admin@usina.com")
  const [password, setPassword] = useState("usina123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Desactivar cualquier listener o suscripción previa
      supabase.auth.onAuthStateChange(() => {})

      // Iniciar sesión de forma simple
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirección directa usando window.location
      window.location.href = "/servidores"
    } catch (err: any) {
      console.error("Error de inicio de sesión:", err)
      setError(err.message || "Error al iniciar sesión")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Iniciar sesión</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 px-4 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  )
}
