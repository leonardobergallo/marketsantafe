// Página de gestión de usuarios (admin)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Shield, Users, Search, ArrowLeft, Mail, Phone, Building2, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  is_business: boolean
  business_name: string | null
  avatar_url: string | null
  verified: boolean
  is_admin: boolean
  created_at: string
}

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<Partial<User>>({})
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/admin/usuarios')
          return
        }

        const data = await response.json()
        if (!data.user?.is_admin) {
          router.push('/')
          return
        }

        setCurrentAdminId(data.user.id)
        setIsAdmin(true)
        fetchUsers()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/admin/usuarios')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchUsers = async (searchTerm: string = search, pageNum: number = page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', pageNum.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(search, 1)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      is_business: user.is_business,
      business_name: user.business_name || '',
      verified: user.verified,
      is_admin: user.is_admin,
    })
    setDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        toast.success('Usuario actualizado exitosamente')
        setEditingUser(null)
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar usuario')
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      toast.error('Error al actualizar usuario')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      setDeletingUserId(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Usuario eliminado exitosamente')
        fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      toast.error('Error al eliminar usuario')
    } finally {
      setDeletingUserId(null)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando permisos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestión de Usuarios
              </h1>
              <p className="text-muted-foreground">
                Administrá y gestioná los usuarios de la plataforma
              </p>
            </div>
          </div>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre, email o nombre de negocio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </form>
        </div>

        {/* Lista de usuarios */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </Card>
        ) : users.length > 0 ? (
          <>
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary font-semibold">
                            {user.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          {user.is_admin && (
                            <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                          )}
                          {user.is_business && (
                            <Badge className="bg-blue-100 text-blue-800">Negocio</Badge>
                          )}
                          {user.verified && (
                            <Badge className="bg-green-100 text-green-800">Verificado</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {user.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.is_business && user.business_name && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{user.business_name}</span>
                            </div>
                          )}
                          <div>
                            Registrado: {new Date(user.created_at).toLocaleDateString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Editar Usuario</DialogTitle>
                            <DialogDescription>
                              Modificá los datos del usuario
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="edit-name">Nombre</Label>
                              <Input
                                id="edit-name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-phone">Teléfono</Label>
                              <Input
                                id="edit-phone"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                              <Input
                                id="edit-whatsapp"
                                value={editForm.whatsapp || ''}
                                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                              />
                            </div>
                            {editForm.is_business && (
                              <div>
                                <Label htmlFor="edit-business-name">Nombre del Negocio</Label>
                                <Input
                                  id="edit-business-name"
                                  value={editForm.business_name || ''}
                                  onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-verified"
                                checked={editForm.verified || false}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, verified: checked as boolean })}
                              />
                              <Label htmlFor="edit-verified" className="cursor-pointer">
                                Verificado
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-is-admin"
                                checked={editForm.is_admin || false}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, is_admin: checked as boolean })}
                              />
                              <Label htmlFor="edit-is-admin" className="cursor-pointer">
                                Administrador
                              </Label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={handleUpdateUser}>
                                Guardar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {currentAdminId !== user.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario "{user.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(search, page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(search, page + 1)}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No se encontraron usuarios</h3>
            <p className="text-muted-foreground">
              {search ? 'Intenta con otros términos de búsqueda' : 'No hay usuarios registrados'}
            </p>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

