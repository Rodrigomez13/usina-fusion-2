"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Trash, Edit, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserMetadata {
  full_name?: string
}

interface SupabaseUser {
  id: string
  email?: string
  created_at: string
  user_metadata: UserMetadata
}

interface UserRole {
  user_id: string
  role: string
}

type User = {
  id: string
  email: string
  created_at: string
  role: string
  full_name: string
}

export default function UserManagement() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Formulario para crear usuario
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState("operador")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Obtener usuarios de Supabase Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) throw authError

      // Obtener roles de usuarios
      const { data: roleData, error: roleError } = await supabase.from("user_roles").select("user_id, role")

      if (roleError) throw roleError

      // Combinar datos
      const userRolesMap: Record<string, string> = {}
      if (roleData) {
        roleData.forEach((item: UserRole) => {
          userRolesMap[item.user_id] = item.role
        })
      }

      const formattedUsers = authUsers.users.map((user: SupabaseUser) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        role: userRolesMap[user.id] || "operador",
        full_name: user.user_metadata?.full_name || "Sin nombre",
      }))

      setUsers(formattedUsers)
    } catch (error: any) {
      console.error("Error al obtener usuarios:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    setFormError(null)
    setFormSuccess(null)

    if (!newUserEmail || !newUserPassword || !newUserName) {
      setFormError("Todos los campos son obligatorios")
      return
    }

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
        user_metadata: {
          full_name: newUserName,
        },
      })

      if (authError) throw authError

      // 2. Asignar rol al usuario
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: newUserRole,
      })

      if (roleError) throw roleError

      setFormSuccess("Usuario creado exitosamente")
      setIsCreateDialogOpen(false)

      // Limpiar formulario
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserName("")
      setNewUserRole("operador")

      // Actualizar lista de usuarios
      fetchUsers()
    } catch (error: any) {
      console.error("Error al crear usuario:", error)
      setFormError(error.message)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    setFormError(null)
    setFormSuccess(null)

    try {
      // Actualizar rol del usuario
      const { error: roleError } = await supabase.from("user_roles").upsert({
        user_id: selectedUser.id,
        role: newUserRole,
      })

      if (roleError) throw roleError

      // Actualizar nombre del usuario si ha cambiado
      if (newUserName !== selectedUser.full_name) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(selectedUser.id, {
          user_metadata: {
            full_name: newUserName,
          },
        })

        if (updateError) throw updateError
      }

      setFormSuccess("Usuario actualizado exitosamente")
      setIsEditDialogOpen(false)

      // Actualizar lista de usuarios
      fetchUsers()
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error)
      setFormError(error.message)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error

      // Actualizar lista de usuarios
      fetchUsers()
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error)
      setError(error.message)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setNewUserName(user.full_name)
    setNewUserRole(user.role)
    setIsEditDialogOpen(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            No tienes permisos para gestionar usuarios. Contacta con un administrador.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Completa el formulario para crear un nuevo usuario en el sistema.</DialogDescription>
            </DialogHeader>

            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {formSuccess && (
              <Alert>
                <AlertDescription>{formSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ejemplo@usinaleads.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="********"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="encargado">Encargado</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuarios..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="capitalize">{user.role}</span>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario seleccionado.</DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {formSuccess && (
            <Alert>
              <AlertDescription>{formSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input id="edit-name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input id="edit-email" type="email" value={selectedUser?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="encargado">Encargado</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
