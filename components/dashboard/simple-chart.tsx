"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso Diario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 text-center">
          <p className="text-lg font-medium">Datos de Progreso Diario</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-100 p-4">
              <p className="text-sm text-blue-800">Leads</p>
              <p className="text-2xl font-bold text-blue-900">1,307</p>
            </div>
            <div className="rounded-lg bg-green-100 p-4">
              <p className="text-sm text-green-800">Cargas</p>
              <p className="text-2xl font-bold text-green-900">666</p>
            </div>
            <div className="rounded-lg bg-orange-100 p-4">
              <p className="text-sm text-orange-800">Costo por Carga</p>
              <p className="text-2xl font-bold text-orange-900">$5.95</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
