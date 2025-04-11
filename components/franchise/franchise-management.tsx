"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, ExternalLink, AlertCircle, Phone } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Database } from "@/lib/database.types"

type Franchise = Database["public"]["Tables"]["franchises"]["Row"]

export default function FranchiseManagement() {
  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newFranchiseDialog, setNewFranchiseDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    cvu: "",
    alias: "",
    owner: "",
    link: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFranchises()
  }, [])

  const fetchFranchises = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/franchises")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cargar franquicias")
      }

      const data = await response.json()
      setFranchises(data)
    } catch (err) {
      console.error("Error fetching franchises:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar franquicias")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/franchises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la franquicia")
      }

      const data = await response.json()

      toast({
        title: "Franquicia creada",
        description: `La franquicia "${data.name}" ha sido creada exitosamente`,
      })

      // Resetear el formulario y cerrar el diálogo
      setFormData({
        name: "",
        password: "",
        cvu: "",
        alias: "",
        owner: "",
        link: "",
      })
      setNewFranchiseDialog(false)

      // Recargar la lista de franquicias
      fetchFranchises()
    } catch (err) {
      console.error("Error creating franchise:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo crear la franquicia",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Cargando franquicias...</span>
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
            <Button variant="outline" size="sm" onClick={fetchFranchises}>
              Reintentar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Franquicias</CardTitle>
          <CardDescription>Gestión de franquicias y sus datos</CardDescription>
        </div>
        <Dialog open={newFranchiseDialog} onOpenChange={setNewFranchiseDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Franquicia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Crear Nueva Franquicia</DialogTitle>
                <DialogDescription>Completa los detalles para crear una nueva franquicia.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cvu" className="text-right">
                    CVU
                  </Label>
                  <Input
                    id="cvu"
                    value={formData.cvu}
                    onChange={(e) => handleChange("cvu", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alias" className="text-right">
                    Alias
                  </Label>
                  <Input
                    id="alias"
                    value={formData.alias}
                    onChange={(e) => handleChange("alias", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="owner" className="text-right">
                    Titular
                  </Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => handleChange("owner", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="link" className="text-right">
                    Link
                  </Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => handleChange("link", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Franquicia"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contraseña</TableHead>
                <TableHead>CVU</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {franchises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No hay franquicias disponibles. Crea una nueva para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                franchises.map((franchise) => (
                  <TableRow key={franchise.id}>
                    <TableCell className="font-medium">{franchise.name}</TableCell>
                    <TableCell>{franchise.password}</TableCell>
                    <TableCell>{franchise.cvu}</TableCell>
                    <TableCell>{franchise.alias || "-"}</TableCell>
                    <TableCell>{franchise.owner}</TableCell>
                    <TableCell>
                      <a
                        href={franchise.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        {franchise.link.replace("https://", "")}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/franquicias/${franchise.id}`}>
                            <Phone className="h-4 w-4 mr-1" />
                            Teléfonos
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
