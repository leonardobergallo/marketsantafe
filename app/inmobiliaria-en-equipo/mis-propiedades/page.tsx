// Página para administrar propiedades inmobiliarias del usuario
// URL: /inmobiliaria-en-equipo/mis-propiedades

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Building2, Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Listing } from '@/lib/mockListings'

export default function MisPropiedadesPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndLoadListings()
  }, [])

  const checkAuthAndLoadListings = async () => {
    try {
      // Verificar autenticación
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        router.push('/login?redirect=/inmobiliaria-en-equipo/mis-propiedades')
        return
      }
      setIsAuthenticated(true)

      // Obtener mis listings
      const listingsResponse = await fetch('/api/listings/my')
      if (listingsResponse.ok) {
        const data = await listingsResponse.json()
        // Filtrar solo propiedades inmobiliarias (categorías 1 y 2)
        const inmobiliariaListings = data.listings.filter(
          (listing: Listing) => listing.categoryId === '1' || listing.categoryId === '2'
        )
        setListings(inmobiliariaListings)
      }
    } catch (error) {
      console.error('Error cargando propiedades:', error)
      toast.error('Error al cargar tus propiedades')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta propiedad?')) {
      return
    }

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Propiedad eliminada exitosamente')
        checkAuthAndLoadListings()
      } else {
        toast.error('Error al eliminar la propiedad')
      }
    } catch (error) {
      console.error('Error eliminando propiedad:', error)
      toast.error('Error al eliminar la propiedad')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0" />
                <span>Mis Propiedades</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Administrá tus propiedades inmobiliarias publicadas
              </p>
            </div>
            <Button asChild size="lg" className="hidden sm:inline-flex flex-shrink-0">
              <Link href="/inmobiliaria-en-equipo/publicar">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propiedad
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-lg sm:text-2xl font-bold">{listings.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Activas</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {listings.filter(l => l.active !== false).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Destacadas</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {listings.filter(l => l.featured).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Listado de propiedades */}
        {listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="relative group">
                  <ListingCard listing={listing} />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <Link href={`/editar/${listing.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(listing.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tenés propiedades publicadas</h3>
            <p className="text-muted-foreground mb-6">
              Empezá a publicar tus propiedades inmobiliarias
            </p>
            <Button asChild size="lg">
              <Link href="/inmobiliaria-en-equipo/publicar">
                <Plus className="h-4 w-4 mr-2" />
                Publicar Primera Propiedad
              </Link>
            </Button>
          </Card>
        )}

        {/* Botón mobile */}
        <div className="fixed bottom-4 right-4 sm:hidden z-50">
          <Button asChild size="lg" className="rounded-full shadow-lg">
            <Link href="/inmobiliaria-en-equipo/publicar">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

