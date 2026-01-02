// Página pública para buscar propiedades inmobiliarias
'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, MapPin, DollarSign, Eye, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PropertiesFilters } from '@/components/properties-filters'
import { PropertiesMap } from '@/components/properties-map'

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
  latitude?: number | null
  longitude?: number | null
  image_url?: string
  images?: string[]
  professional_service: boolean
  featured: boolean
  views: number
  created_at: string
  zone_id: string
  zone_name?: string
  zone_slug?: string
}

export default function PropiedadesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Activar chatbot cuando se carga la página
  useEffect(() => {
    // Delay para asegurar que el chatbot esté cargado
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const w = window as any
        // Intentar métodos comunes de chatbot
        if (w.chatbot?.open) {
          w.chatbot.open()
        } else if (w.openChatbot) {
          w.openChatbot()
        } else {
          // Disparar evento personalizado para el chatbot
          const event = new CustomEvent('open-chatbot')
          window.dispatchEvent(event)
        }
      }
    }, 2000) // Delay de 2 segundos para que la página y el chatbot carguen

    return () => clearTimeout(timer)
  }, [])

  // Cargar propiedades
  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        const q = searchParams.get('q')
        const type = searchParams.get('type')
        const zone = searchParams.get('zone')
        const min = searchParams.get('min')
        const max = searchParams.get('max')
        const rooms = searchParams.get('rooms')
        const bathrooms = searchParams.get('bathrooms')
        const min_area = searchParams.get('min_area')
        const max_area = searchParams.get('max_area')

        if (q) params.append('q', q)
        if (type) params.append('type', type)
        if (zone) params.append('zone', zone)
        if (min) params.append('min', min)
        if (max) params.append('max', max)
        if (rooms) params.append('rooms', rooms)
        if (bathrooms) params.append('bathrooms', bathrooms)
        if (min_area) params.append('min_area', min_area)
        if (max_area) params.append('max_area', max_area)

        const response = await fetch(`/api/properties?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Error cargando propiedades:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [searchParams])

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
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Propiedades en Santa Fe
                </h1>
                <p className="text-muted-foreground">
                  Encontrá tu próximo hogar o inversión
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Trabajamos con inmobiliarias locales. Te conectamos con la más adecuada para tu búsqueda.
                </p>
              </div>
            </div>
          </div>

          {/* Layout: Filtros a la izquierda, Mapa y Propiedades a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Columna izquierda: Filtros */}
            <div className="lg:col-span-1">
              <PropertiesFilters />
            </div>

            {/* Columna derecha: Mapa y Propiedades */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mapa */}
              {!isLoading && properties.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Ubicación de las propiedades</h2>
                  <PropertiesMap properties={properties} />
                </div>
              )}

              {/* Resultados */}
              <div>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Cargando...' : `${properties.length} ${properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`}
                </p>
              </div>

              {/* Grid de propiedades */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 w-full bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link key={property.id} href={`/propiedad/${property.id}`}>
                  <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                    {property.image_url && (
                      <div className="relative h-48 w-full">
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No se encontraron propiedades</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </Card>
          )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
