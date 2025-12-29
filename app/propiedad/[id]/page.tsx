// Página pública para ver una propiedad inmobiliaria
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, MapPin, Phone, Mail, Instagram, Eye, DollarSign, ArrowLeft, MessageCircle, Sparkles, Info } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { pool } from '@/lib/db'
import { SafeImage } from '@/components/safe-image'

interface PropertyPageProps {
  params: Promise<{ id: string }>
}

async function getProperty(id: string) {
  try {
    const propertyId = parseInt(id)

    if (isNaN(propertyId)) {
      return null
    }

    // Obtener propiedad
    const result = await pool.query(
      `SELECT 
        p.*,
        z.name as zone_name,
        z.slug as zone_slug,
        u.name as user_name,
        u.phone as user_phone,
        u.whatsapp as user_whatsapp,
        u.email as user_email
       FROM properties p
       LEFT JOIN zones z ON p.zone_id = z.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1 AND p.active = true`,
      [propertyId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]

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

    // Incrementar vistas
    await pool.query(
      'UPDATE properties SET views = views + 1 WHERE id = $1',
      [propertyId]
    )

    return {
      id: row.id.toString(),
      type: row.type,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      currency: row.currency || 'ARS',
      rooms: row.rooms,
      bathrooms: row.bathrooms,
      area_m2: row.area_m2 ? parseFloat(row.area_m2) : null,
      address: row.address,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      images,
      image_url: row.image_url,
      phone: row.phone || row.user_phone,
      whatsapp: row.whatsapp || row.user_whatsapp,
      email: row.email || row.user_email,
      instagram: row.instagram,
      professional_service: row.professional_service,
      featured: row.featured,
      views: (row.views || 0) + 1,
      created_at: row.created_at,
      zone_name: row.zone_name,
      zone_slug: row.zone_slug,
      user_name: row.user_name,
    }
  } catch (error) {
    console.error('Error obteniendo propiedad:', error)
    return null
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    notFound()
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
          {/* Botón volver */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/propiedades">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a propiedades
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Imágenes */}
              {property.images && property.images.length > 0 && (
                <div className="space-y-4">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <SafeImage
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {property.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {property.images.slice(1, 5).map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          <SafeImage
                            src={img}
                            alt={`${property.title} ${idx + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Información */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(property.type)}>
                        {getTypeLabel(property.type)}
                      </Badge>
                      {property.professional_service && (
                        <Badge className="bg-primary text-primary-foreground">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Servicio Profesional
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {property.title}
                    </h1>
                    {property.zone_name && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property.zone_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(property.price, property.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {property.type === 'alquiler' ? 'por mes' : 'precio de venta'}
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y">
                  {property.rooms && (
                    <div>
                      <div className="text-2xl font-bold text-foreground">{property.rooms}</div>
                      <div className="text-sm text-muted-foreground">Ambientes</div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div>
                      <div className="text-2xl font-bold text-foreground">{property.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Baños</div>
                    </div>
                  )}
                  {property.area_m2 && (
                    <div>
                      <div className="text-2xl font-bold text-foreground">{property.area_m2}</div>
                      <div className="text-sm text-muted-foreground">m²</div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {property.description}
                  </p>
                </div>

                {/* Dirección */}
                {property.address && (
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-3">Ubicación</h2>
                    <p className="text-muted-foreground">{property.address}</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar - Contacto */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h2 className="font-semibold text-lg mb-4">Contacto</h2>
                <div className="space-y-3">
                  {property.whatsapp && (
                    <Button asChild className="w-full" size="lg">
                      <a
                        href={`https://wa.me/54${property.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contactar por WhatsApp
                      </a>
                    </Button>
                  )}
                  {property.phone && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={`tel:${property.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Llamar: {property.phone}
                      </a>
                    </Button>
                  )}
                  {property.email && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={`mailto:${property.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar email
                      </a>
                    </Button>
                  )}
                  {property.instagram && (
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={`https://instagram.com/${property.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="mr-2 h-4 w-4" />
                        @{property.instagram.replace('@', '')}
                      </a>
                    </Button>
                  )}
                </div>

                {/* Info adicional */}
                <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Vistas:</span>
                    <span className="font-semibold text-foreground">{property.views}</span>
                  </div>
                  {property.professional_service && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs">
                          Esta propiedad tiene servicio profesional activo
                        </span>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/servicio-profesional-inmobiliario">
                          <Info className="mr-2 h-4 w-4" />
                          Conocer más sobre el servicio profesional
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

