// Página para ver y gestionar mis productos individuales (sin tienda)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Package, Plus, Loader2, Edit, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { ListingCard } from '@/components/listing-card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  condition: string
  imageUrl: string
  images?: string[]
  featured: boolean
  active: boolean
  views: number
  createdAt: string
  category: {
    id: string
    name: string
    slug: string
  }
  zone: {
    id: string
    name: string
    slug: string
  }
}

export default function MisProductosPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/mis-productos')
          return
        }

        setIsAuthenticated(true)
        fetchListings()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/mis-productos')
      } finally {
        setIsCheckingAuth(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings/me')
      if (response.ok) {
        const data = await response.json()
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error)
      toast.error('Error al cargar los productos')
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    try {
      setDeletingListingId(listingId)
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el producto')
        return
      }

      toast.success('Producto eliminado exitosamente')
      fetchListings()
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar el producto')
    } finally {
      setDeletingListingId(null)
    }
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Mis Productos
              </h1>
              <p className="text-muted-foreground">
                Gestioná tus productos individuales
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/publicar">
              <Plus className="mr-2 h-4 w-4" />
              Publicar producto gratis
            </Link>
          </Button>
        </div>

        {/* Productos */}
        {listings.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tenés productos individuales aún</h3>
            <p className="text-muted-foreground mb-4">
              Publicá productos individuales que no estén asociados a una tienda
            </p>
            <Button asChild>
              <Link href="/publicar">
                <Plus className="mr-2 h-4 w-4" />
                Publicar primer producto
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="flex flex-col">
                <div className="flex-1 mb-3">
                  <ListingCard listing={listing} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/editar-producto/${listing.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/aviso/${listing.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Link>
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingListingId === listing.id}
                      >
                        {deletingListingId === listing.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </>
                        )}
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
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

