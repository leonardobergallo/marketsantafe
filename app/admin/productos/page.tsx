// Página de gestión de productos/listings (admin)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Shield, Package, Search, ArrowLeft, MapPin, DollarSign, Eye, Trash2, Power } from 'lucide-react'
import Link from 'next/link'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  condition: string | null
  image_url: string | null
  featured: boolean
  active: boolean
  views: number
  created_at: string
  user_name: string | null
  category_name: string | null
  zone_name: string | null
  store_name: string | null
}

export default function AdminProductosPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingListingId, setUpdatingListingId] = useState<string | null>(null)
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/admin/productos')
          return
        }

        const data = await response.json()
        if (!data.user?.is_admin) {
          router.push('/')
          return
        }

        setIsAdmin(true)
        fetchListings()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/admin/productos')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchListings = async (searchTerm: string = search, filter: string = activeFilter, pageNum: number = page) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filter) params.append('active', filter)
      params.append('page', pageNum.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/listings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchListings(search, activeFilter, 1)
  }

  const getConditionLabel = (condition: string | null) => {
    if (!condition) return 'Sin especificar'
    switch (condition) {
      case 'nuevo':
        return 'Nuevo'
      case 'usado':
        return 'Usado'
      case 'reacondicionado':
        return 'Reacondicionado'
      default:
        return condition
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleToggleActive = async (listing: Listing) => {
    try {
      setUpdatingListingId(listing.id)
      const response = await fetch(`/api/admin/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !listing.active }),
      })

      if (response.ok) {
        toast.success(`Producto ${!listing.active ? 'activado' : 'desactivado'}`)
        fetchListings()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar producto')
      }
    } catch (error) {
      console.error('Error actualizando producto:', error)
      toast.error('Error al actualizar producto')
    } finally {
      setUpdatingListingId(null)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    try {
      setDeletingListingId(listingId)
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Producto eliminado exitosamente')
        fetchListings()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar producto')
    } finally {
      setDeletingListingId(null)
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
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestión de Productos
              </h1>
              <p className="text-muted-foreground">
                Administrá y gestioná los productos de la plataforma
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
                  fetchListings(search, e.target.value, 1)
                }}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </form>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando productos...</p>
          </Card>
        ) : listings.length > 0 ? (
          <>
            <div className="space-y-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="p-6">
                  <div className="flex items-start gap-4">
                    {listing.image_url && (
                      <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{listing.title}</h3>
                            {listing.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Destacado</Badge>
                            )}
                            {listing.active ? (
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                            )}
                            {listing.condition && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {getConditionLabel(listing.condition)}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold text-foreground">
                                {formatPrice(listing.price)}
                              </span>
                            </div>
                            {listing.zone_name && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{listing.zone_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              {listing.category_name && <span>{listing.category_name}</span>}
                              <span>• {listing.views} vistas</span>
                            </div>
                            {listing.user_name && (
                              <div>Publicado por: {listing.user_name}</div>
                            )}
                            {listing.store_name && (
                              <div>Tienda: {listing.store_name}</div>
                            )}
                            <div>
                              Creado: {new Date(listing.created_at).toLocaleDateString('es-AR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/aviso/${listing.id}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(listing)}
                            disabled={updatingListingId === listing.id}
                          >
                            {updatingListingId === listing.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="mr-2 h-4 w-4" />
                            )}
                            {listing.active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingListingId === listing.id}
                              >
                                {deletingListingId === listing.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el producto "{listing.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteListing(listing.id)}
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
                  onClick={() => fetchListings(search, activeFilter, page - 1)}
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
                  onClick={() => fetchListings(search, activeFilter, page + 1)}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground">
              {search ? 'Intenta con otros términos de búsqueda' : 'No hay productos registrados'}
            </p>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

