"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus, Loader2, AlertCircle } from "lucide-react"
import { updateServerAdMetrics } from "@/app/actions/server-actions"
import type { Database } from "@/lib/database.types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ActiveServerAd = Database["public"]["Views"]["view_active_server_ads"]["Row"]

interface ServerMetricsCardProps {
  serverId: string
  initialActiveAds?: ActiveServerAd[]
}

export default function ServerMetricsCard({ serverId, initialActiveAds = [] }: ServerMetricsCardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeAds, setActiveAds] = useState<ActiveServerAd[]>(initialActiveAds)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar anuncios activos si no se proporcionaron inicialmente
  useEffect(() => {
    const loadActiveAds = async () => {
      if (initialActiveAds.length === 0) {
        setLoading(true)
        setError(null)
        try {
          const response = await fetch(`/api/servers/${serverId}/ads`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Error al cargar anuncios activos")
          }
          const data = await response.json()
          setActiveAds(data)
        } catch (error) {
          console.error("Error loading active ads:", error)
          setError(error instanceof Error ? error.message : "Error desconocido al cargar anuncios")
          toast({
            title: "Error",
            description: "No se pudieron cargar los anuncios activos",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadActiveAds()
  }, [serverId, initialActiveAds.length, toast])

  // Filtrar anuncios según el término de búsqueda
  const filteredAds = activeAds.filter(
    (ad) =>
      (ad.ad_name && ad.ad_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ad.ad_id && ad.ad_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ad.api_name && ad.api_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Función para actualizar métricas de un anuncio
  const handleUpdateMetrics = async (adId: string, leads: number, loads: number, spent: number) => {
    try {
      const result = await updateServerAdMetrics(adId, leads, loads, spent)

      if (result.success) {
        toast({
          title: "Métricas actualizadas",
          description: result.message,
        })

        // Actualizar el anuncio en el estado local
        setActiveAds(
          activeAds.map((ad) => {
            if (ad.id === adId) {
              return {
                ...ad,
                leads,
                loads,
                spent,
              }
            }
            return ad
          }),
        )
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating metrics:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar las métricas",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Anuncios Server {serverId === "todos" ? "Todos" : serverId}</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar anuncios..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" asChild>
            <a href={`/servidores/${serverId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Anuncio
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeAds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay anuncios activos en este servidor.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Ad Set</TableHead>
                  <TableHead>BM</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Gastado</TableHead>
                  <TableHead>API</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Loads</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>$ Lead</TableHead>
                  <TableHead>$ Loads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => {
                  const leads = ad.leads || 0
                  const loads = ad.loads || 0
                  const spent = ad.spent || 0
                  const conversion = leads > 0 ? (loads / leads) * 100 : 0
                  const costPerLead = leads > 0 ? spent / leads : 0
                  const costPerLoad = loads > 0 ? spent / loads : 0

                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.ad_id || "N/A"}</TableCell>
                      <TableCell>{ad.ad_name || "N/A"}</TableCell>
                      <TableCell>${ad.daily_budget?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>${spent.toFixed(2)}</TableCell>
                      <TableCell>{ad.api_name || "N/A"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ad.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {ad.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </TableCell>
                      <TableCell>{leads}</TableCell>
                      <TableCell>{loads}</TableCell>
                      <TableCell>{conversion.toFixed(0)}%</TableCell>
                      <TableCell>${costPerLead.toFixed(2)}</TableCell>
                      <TableCell>${costPerLoad.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
