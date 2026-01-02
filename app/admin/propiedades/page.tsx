// Página de gestión de propiedades (admin)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Shield, Home, Search, ArrowLeft, MapPin, DollarSign, Eye, Trash2, Power } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Property {
  id: string
  type: string
  title: string
  description: string
  price: number
  currency: string
  rooms: number | null
  bathrooms: number | null
  area_m2: number | null
  address: string | null
  image_url: string | null
  professional_service: boolean
  featured: boolean
  active: boolean
  views: number
  created_at: string
  user_name: string | null
  zone_name: string | null
}

export default function AdminPropiedadesPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingPropertyId, setUpdatingPropertyId] = useState<string | null>(null)
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/admin/propiedades')
          return
        }

        const data = await response.json()
        if (!data.user?.is_admin) {
          router.push('/')
          return
        }

        setIsAdmin(true)
        fetchProperties()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/admin/propiedades')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchProperties = async (searchTerm: string = search, filter: string = activeFilter, pageNum: number = page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filter) params.append('active', filter)
      params.append('page', pageNum.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/properties?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error obteniendo propiedades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProperties(search, activeFilter, 1)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'alquiler':
        return 'Alquiler'
      case 'venta':
        return 'Venta'
      case 'alquiler-temporal':
        return 'Alquiler Temporal'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alquiler':
        return 'bg-blue-100 text-blue-800'
      case 'venta':
        return 'bg-green-100 text-green-800'
      case 'alquiler-temporal':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number, currency: string) => {
    const formatted = new Intl.NumberFormat('es-AR').format(price)
    return currency === 'USD' ? `U$S ${formatted}` : `$${formatted}`
  }

  const handleToggleActive = async (property: Property) => {
    try {
      setUpdatingPropertyId(property.id)
      const response = await fetch(`/api/admin/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !property.active }),
      })

      if (response.ok) {
        toast.success(`Propiedad ${!property.active ? 'activada' : 'desactivada'}`)
        fetchProperties()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar propiedad')
      }
    } catch (error) {
      console.error('Error actualizando propiedad:', error)
      toast.error('Error al actualizar propiedad')
    } finally {
      setUpdatingPropertyId(null)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      setDeletingPropertyId(propertyId)
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Propiedad eliminada exitosamente')
        fetchProperties()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar propiedad')
      }
    } catch (error) {
      console.error('Error eliminando propiedad:', error)
      toast.error('Error al eliminar propiedad')
    } finally {
      setDeletingPropertyId(null)
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
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestión de Propiedades
              </h1>
              <p className="text-muted-foreground">
                Administrá y gestioná las propiedades de la plataforma
              </p>
            </div>
          </div>

          {/* Filtros */}
          <form onSubmit={handleSearch} className="mt-4 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Buscar por título o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value)
                  fetchProperties(search, e.target.value, 1)
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Todas</option>
                <option value="true">Activas</option>
                <option value="false">Inactivas</option>
              </select>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </form>
        </div>

        {/* Lista de propiedades */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando propiedades...</p>
          </Card>
        ) : properties.length > 0 ? (
          <>
            <div className="space-y-4">
              {properties.map((property) => (
                <Card key={property.id} className="p-6">
                  <div className="flex items-start gap-4">
                    {property.image_url && (
                      <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{property.title}</h3>
                            <Badge className={getTypeColor(property.type)}>
                              {getTypeLabel(property.type)}
                            </Badge>
                            {property.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Destacada</Badge>
                            )}
                            {property.professional_service && (
                              <Badge className="bg-purple-100 text-purple-800">Profesional</Badge>
                            )}
                            {property.active ? (
                              <Badge className="bg-green-100 text-green-800">Activa</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold text-foreground">
                                {formatPrice(property.price, property.currency)}
                              </span>
                            </div>
                            {property.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{property.address}</span>
                                {property.zone_name && <span>• {property.zone_name}</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              {property.rooms && <span>{property.rooms} amb.</span>}
                              {property.bathrooms && <span>{property.bathrooms} baños</span>}
                              {property.area_m2 && <span>{property.area_m2} m²</span>}
                              <span>• {property.views} vistas</span>
                            </div>
                            {property.user_name && (
                              <div>Publicado por: {property.user_name}</div>
                            )}
                            <div>
                              Creada: {new Date(property.created_at).toLocaleDateString('es-AR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/propiedad/${property.id}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(property)}
                            disabled={updatingPropertyId === property.id}
                          >
                            {updatingPropertyId === property.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="mr-2 h-4 w-4" />
                            )}
                            {property.active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingPropertyId === property.id}
                              >
                                {deletingPropertyId === property.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar propiedad?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la propiedad "{property.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProperty(property.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
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
                  onClick={() => fetchProperties(search, activeFilter, page - 1)}
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
                  onClick={() => fetchProperties(search, activeFilter, page + 1)}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No se encontraron propiedades</h3>
            <p className="text-muted-foreground">
              {search ? 'Intenta con otros términos de búsqueda' : 'No hay propiedades registradas'}
            </p>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

