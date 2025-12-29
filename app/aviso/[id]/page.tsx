// Página de detalle de un aviso
// TypeScript: Next.js App Router pasa params como prop
// En JavaScript esto sería: export default function AvisoPage({ params }) { ... }

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getListingById } from '@/lib/db-queries'
import { type Listing } from '@/lib/mockListings'
import { getCategoryById } from '@/lib/categories'
import { getZoneById } from '@/lib/zones'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageGallery } from '@/components/image-gallery'
import { SafeImage } from '@/components/safe-image'

interface AvisoPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AvisoPage({ params }: AvisoPageProps) {
  // TypeScript: En Next.js 15+, params es una Promise y debe ser await
  // En JavaScript sería: const { id } = await params
  const { id } = await params
  
  // Obtener listing de la base de datos
  const listing = await getListingById(id)

  // Si no existe, mostramos 404
  if (!listing) {
    notFound()
  }

  // Obtenemos información relacionada
  const category = getCategoryById(listing.categoryId)
  const zone = getZoneById(listing.zoneId)

  // Formateamos la fecha
  const date = new Date(listing.createdAt)
  const formattedDate = date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Mapeamos la condición
  const conditionLabels: Record<string, string> = {
    nuevo: 'Nuevo',
    usado: 'Usado',
    reacondicionado: 'Reacondicionado',
  }

  // URLs para contacto
  const whatsappUrl = listing.whatsapp
    ? `https://wa.me/54${listing.whatsapp.replace(/\D/g, '')}`
    : null
  const phoneUrl = listing.phone ? `tel:+54${listing.phone.replace(/\D/g, '')}` : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
        {/* Botón volver */}
        <Link
          href="/explorar"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a explorar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Columna principal - Imagen y descripción */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card className="overflow-hidden p-4">
              {listing.images && listing.images.length > 0 ? (
                <ImageGallery images={listing.images} alt={listing.title} maxPreview={3} />
              ) : (
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted rounded-lg">
                  <SafeImage
                    src={listing.imageUrl || '/placeholder.jpg'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </Card>

            {/* Información principal */}
            <Card className="p-6">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {category && (
                    <Badge variant="secondary">{category.name}</Badge>
                  )}
                  {zone && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {zone.name}
                    </Badge>
                  )}
                  <Badge variant="outline">{conditionLabels[listing.condition]}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Publicado el {formattedDate}</span>
                </div>
              </div>

              {/* Precio */}
              <div className="border-t border-border pt-4">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {listing.price > 0 ? formatPrice(listing.price) : 'Consultar precio'}
                </div>
              </div>
            </Card>

            {/* Descripción */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Descripción</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </Card>
          </div>

          {/* Columna lateral - Contacto */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contacto</h2>
              <div className="space-y-3">
                {whatsappUrl && (
                  <Button
                    asChild
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar por WhatsApp
                    </a>
                  </Button>
                )}
                {phoneUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <a href={phoneUrl}>
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </a>
                  </Button>
                )}
                {!whatsappUrl && !phoneUrl && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay información de contacto disponible
                  </p>
                )}
              </div>

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">{category?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zona:</span>
                  <span className="font-medium">{zone?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condición:</span>
                  <span className="font-medium">{conditionLabels[listing.condition]}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

