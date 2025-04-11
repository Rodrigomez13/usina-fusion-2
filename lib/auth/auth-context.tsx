"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../supabase/client" // Importamos la instancia ya creada
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  userRole: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  userRole: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user || null)

        if (data.session?.user) {
          // Obtener el rol del usuario
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .single()

          setUserRole(roleData?.role || null)
        }
      } catch (error) {
        console.error("Error al obtener la sesión:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    // Suscribirse a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      setIsLoading(true)

      if (session?.user) {
        // Obtener el rol del usuario
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        setUserRole(roleData?.role || null)
      } else {
        setUserRole(null)
      }

      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, isLoading, userRole }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
