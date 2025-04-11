"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/database.types"

type FranchiseDistribution = Database["public"]["Views"]["view_franchise_distribution"]["Row"]

interface FranchiseDistributionTableProps {
  serverId: string
  date?: string
  initialData?: FranchiseDistribution[]
}

export default function FranchiseDistributionTable({ serverId, date, initialData }: FranchiseDistributionTableProps) {
  const [franchiseData, setFranchiseData] = useState<Record<string, any>>({})
  const [servers, setServers] = useState<string[]>([])
  const [loading, setLoading] = useState(initialData ? false : true)
  const [error, setError] = useState<string | null>(null)
  const [serverTotals, setServerTotals] = useState<Record<string, number>>({})
  const [grandTotal, setGrandTotal] = useState(0)

  useEffect(() => {
    const loadDistributionData = async () => {
      if (initialData) {
        processDistributionData(initialData)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/franchise-distribution?serverId=${serverId}${date ? `&date=${date}` : ""}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al cargar datos de distribución")
        }

        const data = await response.json()
        processDistributionData(data)
      } catch (err) {
        console.error("Error loading franchise distribution:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    loadDistributionData()
  }, [serverId, date, initialData])

  const processDistributionData = (data: FranchiseDistribution[]) => {
    // Agrupar por franquicia y servidor
    const groupedData: Record<string, any> = {}
    const uniqueServers = new Set<string>()
    const totals: Record<string, number> = {}
    let total = 0

    data.forEach((item) => {
      const franchiseName = item.franchise_name || "Desconocido"
      const serverName = item.server_name || "Desconocido"
      const totalLeads = item.total_leads || 0

      if (!groupedData[franchiseName]) {
        groupedData[franchiseName] = {
          name: franchiseName,
          servers: {},
          total: 0,
        }
      }

      groupedData[franchiseName].servers[serverName] =
        (groupedData[franchiseName].servers[serverName] || 0) + totalLeads
      groupedData[franchiseName].total += totalLeads

      uniqueServers.add(serverName)
      totals[serverName] = (totals[serverName] || 0) + totalLeads
      total += totalLeads
    })

    setFranchiseData(groupedData)
    setServers(Array.from(uniqueServers))
    setServerTotals(totals)
    setGrandTotal(total)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Cargando datos de distribución...</span>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (Object.keys(franchiseData).length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No hay datos de distribución disponibles para este servidor.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Franquicia</TableHead>
            {servers.map((server) => (
              <TableHead key={server} className="text-right">
                {server}
              </TableHead>
            ))}
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(franchiseData).map((franchise: any) => (
            <TableRow key={franchise.name}>
              <TableCell className="font-medium">{franchise.name}</TableCell>
              {servers.map((server) => (
                <TableCell key={server} className="text-right">
                  {franchise.servers[server] || 0}
                </TableCell>
              ))}
              <TableCell className="text-right font-bold">{franchise.total}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-100">
            <TableCell className="font-bold">TOTALES</TableCell>
            {servers.map((server) => (
              <TableCell key={server} className="text-right font-bold">
                {serverTotals[server] || 0}
              </TableCell>
            ))}
            <TableCell className="text-right font-bold">{grandTotal}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
