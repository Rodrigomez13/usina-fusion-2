import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

type Franchise = Database["public"]["Tables"]["franchises"]["Row"]
type FranchisePhone = Database["public"]["Tables"]["franchise_phones"]["Row"]
type LeadDistribution = Database["public"]["Tables"]["lead_distributions"]["Row"]
type FranchiseDistribution = Database["public"]["Views"]["view_franchise_distribution"]["Row"]

export const FranchiseService = {
  // Obtener todas las franquicias
  async getFranchises(): Promise<Franchise[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("franchises").select("*").order("name")

    if (error) {
      console.error("Error fetching franchises:", error)
      return []
    }

    return data || []
  },

  // Obtener una franquicia por ID
  async getFranchiseById(id: string): Promise<Franchise | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("franchises").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching franchise with ID ${id}:`, error)
      return null
    }

    return data
  },

  // Obtener teléfonos de una franquicia
  async getFranchisePhones(franchiseId: string): Promise<FranchisePhone[]> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("franchise_phones")
      .select("*")
      .eq("franchise_id", franchiseId)
      .order("order")

    if (error) {
      console.error(`Error fetching phones for franchise with ID ${franchiseId}:`, error)
      return []
    }

    return data || []
  },

  // Registrar distribución de leads
  async registerLeadDistribution(
    franchiseId: string,
    franchisePhoneId: string,
    leadsCount: number,
    serverId: string,
  ): Promise<string | null> {
    const supabase = createServerSupabaseClient()

    try {
      // Intentamos usar la función RPC
      const { data, error } = await supabase.rpc("register_lead_distribution", {
        p_franchise_id: franchiseId,
        p_franchise_phone_id: franchisePhoneId,
        p_leads_count: leadsCount,
        p_server_id: serverId,
      })

      if (error) {
        console.error("Error registering lead distribution using RPC:", error)

        // Alternativa: insertar directamente en la tabla lead_distributions
        const { data: insertData, error: insertError } = await supabase
          .from("lead_distributions")
          .insert([
            {
              franchise_id: franchiseId,
              franchise_phone_id: franchisePhoneId,
              leads_count: leadsCount,
              server_id: serverId,
              date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("id")
          .single()

        if (insertError) {
          console.error("Error al insertar distribución de leads:", insertError)
          return null
        }

        return insertData.id
      }

      return data
    } catch (error) {
      console.error("Error registering lead distribution:", error)
      return null
    }
  },

  // Obtener distribución de leads por servidor
  async getLeadDistributionByServer(serverId: string, date?: string): Promise<FranchiseDistribution[]> {
    console.log(`Fetching franchise distribution for serverId: ${serverId}, date: ${date || "all dates"}`)
    const supabase = createServerSupabaseClient()

    try {
      // Si no hay datos en la tabla lead_distributions, devolvemos un array vacío
      const { count, error: countError } = await supabase
        .from("lead_distributions")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("Error checking lead_distributions count:", countError)
        return []
      }

      if (count === 0) {
        console.log("No hay datos de distribución de leads")
        return []
      }

      // Intentamos usar la vista si existe
      try {
        let query = supabase.from("view_franchise_distribution").select("*")

        if (serverId !== "todos") {
          query = query.eq("server_id", serverId)
        }

        if (date) {
          query = query.eq("date", date)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        return data || []
      } catch (viewError) {
        console.warn(`Error al usar view_franchise_distribution: ${viewError.message}. Usando consulta alternativa.`)

        // Consulta alternativa usando la tabla lead_distributions directamente
        let alternativeQuery = supabase.from("lead_distributions").select(`
            id,
            franchise_id,
            leads_count,
            server_id,
            date,
            franchises!inner(name)
          `)

        if (serverId !== "todos") {
          alternativeQuery = alternativeQuery.eq("server_id", serverId)
        }

        if (date) {
          alternativeQuery = alternativeQuery.eq("date", date)
        }

        const { data: distributionData, error: distributionError } = await alternativeQuery

        if (distributionError) {
          console.error(`Error al obtener distribución de leads para servidor con ID ${serverId}:`, distributionError)
          return []
        }

        // Transformamos los datos para que coincidan con la estructura esperada
        return distributionData.map((item) => ({
          franchise_id: item.franchise_id,
          franchise_name: item.franchises?.name || "Desconocido",
          server_id: item.server_id,
          server_name: null, // No tenemos este dato en la consulta alternativa
          total_leads: item.leads_count,
          date: item.date,
        }))
      }
    } catch (error) {
      console.error(`Error fetching lead distribution for server with ID ${serverId}:`, error)
      return []
    }
  },

  // Obtener distribución de leads por franquicia
  async getLeadDistributionByFranchise(franchiseId: string, date?: string): Promise<FranchiseDistribution[]> {
    const supabase = createServerSupabaseClient()

    try {
      // Primero intentamos usar la vista
      let query = supabase.from("view_franchise_distribution").select("*").eq("franchise_id", franchiseId)

      if (date) {
        query = query.eq("date", date)
      }

      const { data, error } = await query

      if (error) {
        console.warn(`Error al usar view_franchise_distribution: ${error.message}. Usando consulta alternativa.`)

        // Consulta alternativa usando la tabla lead_distributions directamente
        let alternativeQuery = supabase
          .from("lead_distributions")
          .select(`
            id,
            franchise_id,
            leads_count,
            server_id,
            date,
            servers!inner(name)
          `)
          .eq("franchise_id", franchiseId)

        if (date) {
          alternativeQuery = alternativeQuery.eq("date", date)
        }

        const { data: distributionData, error: distributionError } = await alternativeQuery

        if (distributionError) {
          console.error(
            `Error al obtener distribución de leads para franquicia con ID ${franchiseId}:`,
            distributionError,
          )
          return []
        }

        // Transformamos los datos para que coincidan con la estructura esperada
        return distributionData.map((item) => ({
          franchise_id: item.franchise_id,
          franchise_name: null, // No tenemos este dato en la consulta alternativa
          server_id: item.server_id,
          server_name: item.servers?.name || "Desconocido",
          total_leads: item.leads_count,
          date: item.date,
        }))
      }

      return data || []
    } catch (error) {
      console.error(`Error fetching lead distribution for franchise with ID ${franchiseId}:`, error)
      return []
    }
  },
}
