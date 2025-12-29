// Página pública para ver una tienda
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ListingCard } from '@/components/listing-card'
import { Store, MapPin, Phone, Mail, Instagram, Package } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pool } from '@/lib/db'

interface StorePageProps {
  params: Promise<{ slug: string }>
}

async function getStore(slug: string) {
  try {
    // Obtener tienda
    const storeResult = await pool.query(
      `SELECT s.*, z.name as zone_name, z.slug as zone_slug,
              u.name as user_name, u.avatar_url as user_avatar
       FROM stores s
       LEFT JOIN zones z ON s.zone_id = z.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.slug = $1 AND s.active = true`,
      [slug]
    )

    if (storeResult.rows.length === 0) {
      return null
    }

    const store = storeResult.rows[0]

    // Obtener productos de la tienda
    const productsResult = await pool.query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       WHERE l.store_id = $1 AND l.active = true
       ORDER BY l.created_at DESC
       LIMIT 50`,
      [store.id]
    )

    store.products = productsResult.rows.map((row: any) => {
      // Parsear imágenes
      let images: string[] = []
      if (row.images) {
        try {
          images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
        } catch (e) {
          images = []
        }
      }
      if (images.length === 0 && row.image_url) {
        images = [row.image_url]
      }

      return {
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        condition: row.condition,
        images,
        category_name: row.category_name,
        category_slug: row.category_slug,
        created_at: row.created_at,
      }
    })

    // Contar productos
    store.products_count = store.products.length

    return store
  } catch (error) {
    console.error('Error obteniendo tienda:', error)
    return null
  }
}

export default async function TiendaPage({ params }: StorePageProps) {
  const { slug } = await params
  const store = await getStore(slug)

  if (!store) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Header de la tienda */}
        <div className="bg-gradient-to-br from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg object-cover border-2 border-background shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg bg-primary/20 flex items-center justify-center border-2 border-background shadow-lg">
                  <Store className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-muted-foreground text-lg mb-4 max-w-2xl">
                    {store.description}
                  </p>
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
                    <span>{store.products_count || 0} productos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información de contacto */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
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
                      No hay información de contacto disponible
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Productos */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Productos de {store.name}
                </h2>
                <p className="text-muted-foreground">
                  {store.products_count || 0} productos disponibles
                </p>
              </div>

              {!store.products || store.products.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No hay productos disponibles</h3>
                  <p className="text-muted-foreground">
                    Esta tienda aún no tiene productos publicados
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {store.products.map((product: any) => (
                    <ListingCard key={product.id} listing={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

