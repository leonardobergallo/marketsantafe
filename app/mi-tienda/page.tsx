// Página para ver y gestionar mi tienda
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Store, Edit, Plus, ExternalLink, Loader2, Package, MapPin, Phone, Mail, Instagram } from 'lucide-react'
import Link from 'next/link'
import { ListingCard } from '@/components/listing-card'

interface Store {
  id: number
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_image_url: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  instagram: string | null
  address: string | null
  zone_name: string | null
  zone_slug: string | null
  products_count: number
  active: boolean
  created_at: string
}

export default function MiTiendaPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          // 401 es esperado si no está autenticado, redirigir silenciosamente
          router.push('/login?redirect=/mi-tienda')
          return
        }

        setIsAuthenticated(true)

        // Obtener tienda
        const storeResponse = await fetch('/api/stores')
        if (storeResponse.ok) {
          const data = await storeResponse.json()
          if (data.store) {
            setStore(data.store)
            // Obtener productos de la tienda
            fetchProducts(data.store.id)
          } else {
            // No tiene tienda, redirigir a crear
            router.push('/crear-tienda')
          }
        }
      } catch (error) {
        // Silenciar errores de red, solo redirigir
        router.push('/login?redirect=/mi-tienda')
      } finally {
        setIsCheckingAuth(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchProducts = async (storeId: number) => {
    try {
      const response = await fetch(`/api/listings?store_id=${storeId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.listings || [])
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error)
    }
  }

  // Mostrar loading mientras se verifica autenticación
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

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated || !store) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
        {/* Header de la tienda */}
        <div className="mb-8">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-background">
            {store.cover_image_url && (
              <div className="absolute inset-0">
                <img
                  src={store.cover_image_url}
                  alt={store.name}
                  className="w-full h-48 object-cover opacity-20"
                />
              </div>
            )}
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="h-20 w-20 rounded-lg object-cover border-2 border-background"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-primary/20 flex items-center justify-center border-2 border-background">
                    <Store className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {store.name}
                    </h1>
                    {store.active && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Activa
                      </span>
                    )}
                  </div>
                  {store.description && (
                    <p className="text-muted-foreground mb-3">{store.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {store.zone_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{store.zone_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{store.products_count} productos</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/tienda/${store.slug}`} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver tienda pública
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/crear-tienda?edit=true">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de contacto */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Información de contacto</h2>
              <div className="space-y-3">
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${store.phone}`} className="text-foreground hover:text-primary">
                      {store.phone}
                    </a>
                  </div>
                )}
                {store.whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`https://wa.me/54${store.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary"
                    >
                      WhatsApp: {store.whatsapp}
                    </a>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${store.email}`} className="text-foreground hover:text-primary">
                      {store.email}
                    </a>
                  </div>
                )}
                {store.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary"
                    >
                      @{store.instagram.replace('@', '')}
                    </a>
                  </div>
                )}
                {store.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-foreground">{store.address}</span>
                  </div>
                )}
                {!store.phone && !store.whatsapp && !store.email && !store.instagram && !store.address && (
                  <p className="text-sm text-muted-foreground">
                    No hay información de contacto configurada
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Productos */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Mis productos</h2>
              <Button asChild size="sm">
                <Link href="/publicar">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar producto
                </Link>
              </Button>
            </div>

            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No tenés productos aún</h3>
                <p className="text-muted-foreground mb-4">
                  Empezá a vender agregando tu primer producto
                </p>
                <Button asChild>
                  <Link href="/publicar">
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar primer producto
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <ListingCard key={product.id} listing={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

