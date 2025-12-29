// Página para gestionar propiedades inmobiliarias
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Home, Plus, Edit, Eye, Loader2, MapPin, DollarSign, MessageCircle, CheckCircle2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Property {
  id: number
  type: 'alquiler' | 'venta' | 'alquiler-temporal'
  title: string
  description: string
  price: number
  currency: string
  rooms: number | null
  bathrooms: number | null
  area_m2: number | null
  address: string | null
  image_url: string | null
  images: string[] | null
  professional_service: boolean
  active: boolean
  views: number
  created_at: string
}

export default function MisPropiedadesPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [showServiceDialog, setShowServiceDialog] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/inmobiliaria-en-equipo/mis-propiedades')
          return
        }

        setIsAuthenticated(true)
        fetchProperties()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/inmobiliaria-en-equipo/mis-propiedades')
      } finally {
        setIsCheckingAuth(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties/me')
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Error obteniendo propiedades:', error)
    }
  }

  const handleRequestProfessionalService = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/professional-service`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Error al solicitar servicio profesional')
        return
      }

      toast.success('¡Servicio profesional activado! Te contactaremos pronto por el chatbot.')
      
      // Cerrar diálogo
      setShowServiceDialog(false)
      setSelectedPropertyId(null)
      
      // Recargar propiedades
      fetchProperties()
      
      // Activar chatbot (si está disponible) después de un pequeño delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Intentar diferentes métodos comunes de chatbot
          if ((window as any).chatbot) {
            (window as any).chatbot.open()
          } else if ((window as any).openChatbot) {
            (window as any).openChatbot()
          } else if ((window as any).chatbotOpen) {
            (window as any).chatbotOpen()
          } else {
            // Si no hay chatbot, mostrar mensaje
            console.log('Chatbot no disponible. Contactate con nosotros para más información.')
          }
        }
      }, 500)
    } catch (error) {
      console.error('Error solicitando servicio profesional:', error)
      toast.error('Error al solicitar servicio profesional')
    }
  }

  const openServiceDialog = (propertyId: number) => {
    setSelectedPropertyId(propertyId)
    setShowServiceDialog(true)
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
  if (!isAuthenticated) {
    return null
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
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Mis Propiedades
              </h1>
              <p className="text-muted-foreground">
                Gestioná tus propiedades inmobiliarias
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/inmobiliaria-en-equipo/publicar">
              <Plus className="mr-2 h-4 w-4" />
              Publicar propiedad gratis
            </Link>
          </Button>
        </div>

        {/* Propiedades */}
        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tenés propiedades publicadas</h3>
            <p className="text-muted-foreground mb-4">
              Empezá a publicar tus propiedades de forma gratuita
            </p>
            <Button asChild>
              <Link href="/inmobiliaria-en-equipo/publicar">
                <Plus className="mr-2 h-4 w-4" />
                Publicar primera propiedad
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                {property.image_url && (
                  <div className="relative h-48 w-full">
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge className={getTypeColor(property.type)}>
                        {getTypeLabel(property.type)}
                      </Badge>
                      {property.professional_service && (
                        <Badge className="bg-primary text-primary-foreground">
                          Profesional
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-foreground">
                        {formatPrice(property.price, property.currency)}
                      </span>
                    </div>
                    {property.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{property.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.rooms && <span>{property.rooms} amb.</span>}
                      {property.bathrooms && <span>{property.bathrooms} baños</span>}
                      {property.area_m2 && <span>{property.area_m2} m²</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{property.views} vistas</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    {property.professional_service ? (
                      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            Servicio profesional activo
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Te contactaremos pronto
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Dialog open={showServiceDialog && selectedPropertyId === property.id} onOpenChange={setShowServiceDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openServiceDialog(property.id)}
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Contratar servicio profesional
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              Servicio Profesional
                            </DialogTitle>
                            <DialogDescription>
                              Mejorá la visibilidad de tu propiedad con nuestro servicio profesional
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-sm">¿Qué incluye?</h4>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>Destacado en búsquedas de propiedades</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>Asesoramiento profesional personalizado</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>Gestión de consultas y visitas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>Contacto directo con nuestro equipo</span>
                                </li>
                              </ul>
                            </div>
                            <div className="pt-4 border-t">
                              <p className="text-sm text-muted-foreground mb-4">
                                Al contratar el servicio, te contactaremos a través del chatbot para coordinar los detalles.
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleRequestProfessionalService(property.id)}
                                  className="flex-1"
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Contratar ahora
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowServiceDialog(false)
                                    setSelectedPropertyId(null)
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/inmobiliaria-en-equipo/editar/${property.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/propiedad/${property.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

