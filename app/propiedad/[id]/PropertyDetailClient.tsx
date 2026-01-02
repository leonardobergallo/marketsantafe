'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, Instagram, Eye, ArrowLeft, MessageCircle, Sparkles, Info, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'
import { WHATSAPP_PLATAFORMA } from '@/lib/constants'
import { routeLead } from '@/lib/routeLead'
import type { Agency } from '@/lib/types'
import { toast } from 'sonner'

interface Property {
  id: string
  type: string
  title: string
  description: string
  price: number
  currency: string
  rooms?: number
  bathrooms?: number
  area_m2?: number
  address?: string
  images?: string[]
  image_url?: string
  phone?: string
  whatsapp?: string
  email?: string
  instagram?: string
  professional_service: boolean
  featured: boolean
  views: number
  zone_name?: string
  user_name?: string
  user_id?: number
}

interface PropertyDetailClientProps {
  property: Property
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [isLoadingAgency, setIsLoadingAgency] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    mensaje: '',
  })

  // Determinar agencyId basado en la propiedad
  // Por ahora, usamos un mapeo basado en el usuario o professional_service
  // En el futuro, esto vendría del campo agencyId de la DB
  const getAgencyId = async (): Promise<string | null> => {
    // Si el usuario es "Solar Propiedades", asignar a Solar
    if (property.user_name === 'Solar Propiedades' || property.user_id === 33) {
      return 'agency-002' // Solar Propiedades
    }
    
    // Propiedades con professional_service van a Santa Fe Centro
    if (property.professional_service) {
      return 'agency-001'
    }
    
    return null
  }

  useEffect(() => {
    const loadAgency = async () => {
      setIsLoadingAgency(true)
      try {
        const agencyId = await getAgencyId()
        if (!agencyId) {
          setAgency(null)
          setIsLoadingAgency(false)
          return
        }

        const response = await fetch('/api/agencies')
        if (response.ok) {
          const data = await response.json()
          const foundAgency = data.agencies.find((a: Agency) => a.id === agencyId)
          setAgency(foundAgency || null)
        }
      } catch (error) {
        console.error('Error cargando inmobiliaria:', error)
        setAgency(null)
      } finally {
        setIsLoadingAgency(false)
      }
    }

    loadAgency()
  }, [property.id, property.user_name, property.user_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const agencyId = await getAgencyId()
      const routedAgencyId = routeLead({
        id: property.id,
        title: property.title,
        price: property.price,
        operation: property.type === 'alquiler' ? 'alquiler' : 'venta',
        agencyId: agencyId || undefined,
      })

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          agencyId: routedAgencyId,
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email || undefined,
          mensaje: formData.mensaje,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar consulta')
      }

      toast.success('Tu consulta ha sido enviada correctamente')
      setFormData({ nombre: '', telefono: '', email: '', mensaje: '' })
    } catch (error) {
      console.error('Error enviando consulta:', error)
      toast.error('Error al enviar tu consulta. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
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

  // Determinar WhatsApp a usar
  const whatsappToUse = agency?.whatsapp || property.whatsapp || WHATSAPP_PLATAFORMA

  return (
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

          {/* Inmobiliaria */}
          {isLoadingAgency ? (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando información de inmobiliaria...</span>
            </div>
          ) : agency ? (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                {agency.logoUrl && (
                  <img
                    src={agency.logoUrl}
                    alt={agency.name}
                    className="w-12 h-12 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{agency.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gestionado por inmobiliaria asociada
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Gestionado por la plataforma
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Trabajamos con inmobiliarias locales. Te conectamos con la más adecuada para tu búsqueda.
              </p>
            </div>
          )}

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
        <Card className="p-6 sticky top-20 space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-4">Contacto</h2>
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <a
                  href={`https://wa.me/${whatsappToUse.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {agency ? `Contactar ${agency.name}` : 'Contactar por WhatsApp'}
                </a>
              </Button>
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
          </div>

          {/* Formulario de consulta */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-4">Enviar consulta</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Tu teléfono"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="mensaje">Mensaje *</Label>
                <Textarea
                  id="mensaje"
                  required
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="Tu consulta sobre esta propiedad..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar consulta'
                )}
              </Button>
            </form>
          </div>

          {/* Info adicional */}
          <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
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
  )
}

