import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/database.types"

type Server = Database["public"]["Tables"]["servers"]["Row"]
type ServerAd = Database["public"]["Tables"]["server_ads"]["Row"]
type ActiveServerAd = Database["public"]["Views"]["view_active_server_ads"]["Row"]

export const ServerService = {
  // Obtener todos los servidores
  async getServers(): Promise<Server[]> {
    try {
      // Crear un nuevo cliente para cada solicitud
      const supabase = createServerSupabaseClient()

      // Intenta hacer una consulta simple para verificar la conexión
      const testQuery = await supabase.from("servers").select("count")
      if (testQuery.error) {
        console.error("Error en consulta de prueba:", testQuery.error)
        throw new Error(`Falló la consulta de prueba: ${testQuery.error.message}`)
      }

      console.log("Consulta de prueba exitosa, conteo:", testQuery.data)

      // Ahora realiza la consulta principal
      const { data, error } = await supabase.from("servers").select("*").order("name")

      if (error) {
        console.error("Error al obtener servidores:", error)
        throw error
      }

      console.log(`Se obtuvieron ${data?.length || 0} servidores exitosamente`)
      return data || []
    } catch (error) {
      console.error("Error en getServers:", error)
      // Devolver un array vacío en caso de error para evitar que la aplicación se rompa
      return []
    }
  },

  // Obtener un servidor por ID
  async getServerById(id: string): Promise<Server | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("servers").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error al obtener servidor con ID ${id}:`, error)
      return null
    }

    return data
  },

  // Crear un nuevo servidor
  async createServer(server: Omit<Server, "id" | "created_at" | "updated_at">): Promise<Server | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("servers")
      .insert([
        {
          ...server,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear servidor:", error)
      return null
    }

    return data
  },

  // Actualizar un servidor
  async updateServer(
    id: string,
    updates: Partial<Omit<Server, "id" | "created_at" | "updated_at">>,
  ): Promise<Server | null> {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("servers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error(`Error al actualizar servidor con ID ${id}:`, error)
      return null
    }

    return data
  },

  // Activar/desactivar un servidor
  async toggleServerStatus(id: string, isActive: boolean): Promise<boolean> {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from("servers")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error(`Error al cambiar estado del servidor con ID ${id}:`, error)
      return false
    }

    return true
  },

  // Obtener anuncios activos en un servidor
  async getActiveServerAds(serverId: string): Promise<ActiveServerAd[]> {
    const supabase = createServerSupabaseClient()

    try {
      // Primero intentamos usar la vista
      const { data, error } = await supabase.from("view_active_server_ads").select("*")

      if (error) {
        // Si hay un error con la vista, intentamos una consulta alternativa
        console.warn(`Error al usar view_active_server_ads: ${error.message}. Usando consulta alternativa.`)

        // Consulta alternativa usando la tabla server_ads directamente
        const { data: serverAdsData, error: serverAdsError } = await supabase
          .from("server_ads")
          .select(`
            id, 
            server_id, 
            ad_id, 
            api_id, 
            daily_budget, 
            leads, 
            loads, 
            spent, 
            is_active, 
            created_at, 
            updated_at
          `)
          .eq("server_id", serverId)
          .eq("is_active", true)

        if (serverAdsError) {
          console.error(`Error al obtener anuncios activos para servidor con ID ${serverId}:`, serverAdsError)
          return []
        }

        // Transformamos los datos para que coincidan con la estructura esperada
        return serverAdsData.map((ad) => ({
          id: ad.id,
          server_id: ad.server_id,
          server_name: null, // No tenemos este dato en la consulta alternativa
          ad_id: ad.ad_id,
          ad_name: null, // No tenemos este dato en la consulta alternativa
          api_id: ad.api_id,
          api_name: null, // No tenemos este dato en la consulta alternativa
          api_phone: null, // No tenemos este dato en la consulta alternativa
          daily_budget: ad.daily_budget,
          leads: ad.leads,
          loads: ad.loads,
          spent: ad.spent,
          is_active: ad.is_active,
          created_at: ad.created_at,
          updated_at: ad.updated_at,
        }))
      }

      // Si no hay error, filtramos los resultados por server_id
      // Esto es necesario porque la vista podría no tener la columna server_id
      return data.filter((ad) => ad.server_id === serverId && ad.is_active) || []
    } catch (error) {
      console.error(`Error al obtener anuncios activos para servidor con ID ${serverId}:`, error)
      return []
    }
  },

  // Activar un anuncio en un servidor
  async activateAdInServer(adId: string, apiId: string, dailyBudget: number, serverId: string): Promise<string | null> {
    const supabase = createServerSupabaseClient()

    try {
      // Intentamos usar la función RPC
      const { data, error } = await supabase.rpc("activate_ad_in_server", {
        p_ad_id: adId,
        p_api_id: apiId,
        p_daily_budget: dailyBudget,
        p_server_id: serverId,
      })

      if (error) {
        console.error("Error al activar anuncio en servidor usando RPC:", error)

        // Alternativa: insertar directamente en la tabla server_ads
        const { data: insertData, error: insertError } = await supabase
          .from("server_ads")
          .insert([
            {
              server_id: serverId,
              ad_id: adId,
              api_id: apiId,
              daily_budget: dailyBudget,
              leads: 0,
              loads: 0,
              spent: 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("id")
          .single()

        if (insertError) {
          console.error("Error al insertar anuncio en servidor:", insertError)
          return null
        }

        return insertData.id
      }

      return data
    } catch (error) {
      console.error("Error al activar anuncio en servidor:", error)
      return null
    }
  },

  // Actualizar métricas de un anuncio en un servidor
  async updateServerAdMetrics(serverAdId: string, leads: number, loads: number, spent: number): Promise<boolean> {
    const supabase = createServerSupabaseClient()

    try {
      // Intentamos usar la función RPC
      const { error } = await supabase.rpc("update_server_ad_metrics", {
        p_server_ad_id: serverAdId,
        p_leads: leads,
        p_loads: loads,
        p_spent: spent,
      })

      if (error) {
        console.error(`Error al actualizar métricas usando RPC:`, error)

        // Alternativa: actualizar directamente la tabla server_ads
        const { error: updateError } = await supabase
          .from("server_ads")
          .update({
            leads: leads,
            loads: loads,
            spent: spent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", serverAdId)

        if (updateError) {
          console.error(`Error al actualizar métricas para anuncio de servidor con ID ${serverAdId}:`, updateError)
          return false
        }
      }

      return true
    } catch (error) {
      console.error(`Error al actualizar métricas para anuncio de servidor con ID ${serverAdId}:`, error)
      return false
    }
  },

  // Desactivar un anuncio en un servidor
  async deactivateServerAd(serverAdId: string): Promise<boolean> {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase
      .from("server_ads")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", serverAdId)

    if (error) {
      console.error(`Error al desactivar anuncio de servidor con ID ${serverAdId}:`, error)
      return false
    }

    return true
  },
}
