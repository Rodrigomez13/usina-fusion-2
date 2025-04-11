import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"]

export const PortfolioService = {
  // Obtener todos los portfolios
  async getPortfolios(): Promise<Portfolio[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("portfolios").select("*").order("name")

    if (error) {
      console.error("Error fetching portfolios:", error)
      return []
    }

    return data || []
  },

  // Obtener un portfolio por ID
  async getPortfolioById(id: string): Promise<Portfolio | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("portfolios").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching portfolio with ID ${id}:`, error)
      return null
    }

    return data
  },

  // Crear un nuevo portfolio
  async createPortfolio(portfolio: Omit<Portfolio, "id" | "created_at" | "updated_at">): Promise<Portfolio | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("portfolios")
      .insert([
        {
          ...portfolio,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating portfolio:", error)
      return null
    }

    return data
  },

  // Actualizar un portfolio
  async updatePortfolio(
    id: string,
    updates: Partial<Omit<Portfolio, "id" | "created_at" | "updated_at">>,
  ): Promise<Portfolio | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("portfolios")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating portfolio with ID ${id}:`, error)
      return null
    }

    return data
  },

  // Obtener el número de business managers asociados a un portfolio
  async getBusinessManagerCount(portfolioId: string): Promise<number> {
    const supabase = createServerSupabaseClient()
    const { count, error } = await supabase
      .from("business_managers")
      .select("*", { count: "exact", head: true })
      .eq("portfolio_id", portfolioId)

    if (error) {
      console.error(`Error counting business managers for portfolio ${portfolioId}:`, error)
      return 0
    }

    return count || 0
  },

  // Obtener el gasto total de un portfolio (simulado por ahora)
  async getPortfolioTotalSpend(portfolioId: string): Promise<number> {
    // En un caso real, esto sería una consulta más compleja que sumaría gastos
    // Por ahora, devolvemos un valor aleatorio para simular
    return Math.floor(Math.random() * 10000) / 100
  },
}
