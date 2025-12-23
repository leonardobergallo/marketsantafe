// Página para ver y gestionar mis publicaciones
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import { type Listing } from '@/lib/mockListings'

export default function MisVentasPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadListings()
  }, [])

  const checkAuthAndLoadListings = async () => {
    try {
      // Verificar autenticación
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        router.push('/login?returnUrl=/mis-ventas')
        return
      }
      setIsAuthenticated(true)

      // Cargar mis publicaciones
      const listingsResponse = await fetch('/api/listings/my')
      if (!listingsResponse.ok) {
        toast.error('Error al cargar tus publicaciones')
        setIsLoading(false)
        return
      }

      const data = await listingsResponse.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar tus publicaciones')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(id)

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar la publicación')
        setDeletingId(null)
        return
      }

      toast.success('Publicación eliminada exitosamente')
      // Recargar la lista
      checkAuthAndLoadListings()
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('Error al eliminar la publicación')
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    )
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
                <Package className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0" />
                <span>Mis ventas</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Gestioná tus publicaciones, editá o eliminá lo que ya no necesitás
              </p>
            </div>
            <Button asChild size="lg" className="hidden sm:inline-flex flex-shrink-0">
              <Link href="/publicar">
                <Plus className="h-4 w-4 mr-2" />
                Nueva publicación
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-foreground">{listings.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total publicaciones</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {listings.filter(l => l.featured).length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Destacadas</div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {listings.reduce((sum, l) => sum + (l.views || 0), 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Visualizaciones totales</div>
          </Card>
        </div>

        {/* Lista de publicaciones */}
        {listings.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              No tenés publicaciones aún
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Empezá a vender publicando tu primer producto
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/publicar">
                <Plus className="h-4 w-4 mr-2" />
                Crear primera publicación
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Botón para nueva publicación en móvil */}
            <div className="sm:hidden">
              <Button asChild className="w-full" size="lg">
                <Link href="/publicar">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva publicación
                </Link>
              </Button>
            </div>

            {/* Grid de publicaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow relative group">
                  <div className="relative">
                    <ListingCard listing={listing} />
                    {/* Botones de acción */}
                    <div className="absolute top-2 right-2 flex gap-1.5 sm:gap-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-background/95 hover:bg-background border border-border/50 shadow-md"
                        asChild
                      >
                        <Link href={`/editar/${listing.id}`}>
                          <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 shadow-md"
                        onClick={() => handleDelete(listing.id, listing.title)}
                        disabled={deletingId === listing.id}
                      >
                        {deletingId === listing.id ? (
                          <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

