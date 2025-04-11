import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

type Wallet = Database["public"]["Tables"]["wallets"]["Row"]

export const WalletService = {
  // Obtener todas las wallets
  async getWallets(): Promise<Wallet[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("wallets").select("*").order("name")

    if (error) {
      console.error("Error fetching wallets:", error)
      return []
    }

    return data || []
  },

  // Obtener una wallet por ID
  async getWalletById(id: string): Promise<Wallet | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("wallets").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching wallet with ID ${id}:`, error)
      return null
    }

    return data
  },

  // Crear una nueva wallet
  async createWallet(wallet: {
    name: string
    account_number?: string
    balance?: number
    currency?: string
  }): Promise<Wallet | null> {
    const supabase = createServerSupabaseClient()

    try {
      console.log("Intentando crear wallet con datos:", JSON.stringify(wallet, null, 2))

      // Asegurarse de que todos los campos requeridos tengan valores predeterminados
      const walletData = {
        name: wallet.name,
        account_number: wallet.account_number || "",
        balance: wallet.balance || 0,
        currency: wallet.currency || "USD",
      }

      const { data, error } = await supabase.from("wallets").insert([walletData]).select().single()

      if (error) {
        console.error("Error creating wallet:", error)

        // Verificar si es un error de RLS
        if (error.code === "42501") {
          throw new Error(`Error de permisos: ${error.message}. Por favor, configura las políticas RLS en Supabase.`)
        }

        throw error
      }

      return data
    } catch (error) {
      console.error("Error in createWallet:", error)
      throw error
    }
  },

  // Actualizar una wallet
  async updateWallet(
    id: string,
    updates: {
      name?: string
      account_number?: string
      balance?: number
      currency?: string
    },
  ): Promise<Wallet | null> {
    const supabase = createServerSupabaseClient()

    try {
      const { data, error } = await supabase
        .from("wallets")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating wallet with ID ${id}:`, error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in updateWallet:", error)
      throw error
    }
  },

  // Obtener el número de portfolios asociados a una wallet
  async getPortfolioCount(walletId: string): Promise<number> {
    const supabase = createServerSupabaseClient()
    const { count, error } = await supabase
      .from("portfolios")
      .select("*", { count: "exact", head: true })
      .eq("wallet_id", walletId)

    if (error) {
      console.error(`Error counting portfolios for wallet ${walletId}:`, error)
      return 0
    }

    return count || 0
  },
}
