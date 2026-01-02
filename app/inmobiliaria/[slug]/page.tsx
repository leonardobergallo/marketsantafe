'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, DollarSign, Phone, Mail, MessageCircle, Home, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'
import { exampleAgencies } from '@/lib/mocks/exampleData'
import type { Agency } from '@/lib/types'

interface Property {
  id: string
  title: string
  price: number
  currency: string
  type: string
  rooms?: number
  bathrooms?: number
  area_m2?: number
  address?: string
  image_url?: string
  views: number
}

interface InmobiliariaPageProps {
  params: Promise<{ slug: string }>
}

export default function InmobiliariaPage({ params }: InmobiliariaPageProps) {
  const [slug, setSlug] = useState<string>('')
  const [agency, setAgency] = useState<Agency | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadParams = async () => {
      const resolved = await params
      setSlug(resolved.slug)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!slug) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Primero buscar en las agencies de ejemplo
        let foundAgency = exampleAgencies.find((a: Agency) => {
          const agencySlug = a.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          return agencySlug === slug
        })

        // Si no se encuentra en ejemplos, buscar en la DB por business_name
        if (!foundAgency) {
          try {
            const userResponse = await fetch(`/api/users/by-slug?slug=${encodeURIComponent(slug)}`)
            if (userResponse.ok) {
              const userData = await userResponse.json()
              if (userData.user && userData.user.is_business && userData.user.business_name) {
                // Crear agency desde el usuario de la DB
                foundAgency = {
                  id: `user-${userData.user.id}`,
                  name: userData.user.business_name,
                  whatsapp: userData.user.whatsapp || '',
                  email: userData.user.email || undefined,
                  logoUrl: userData.user.avatar_url || undefined,
                }
              }
            }
          } catch (error) {
            console.error('Error buscando usuario:', error)
          }
        }

        if (!foundAgency) {
          console.error('Inmobiliaria no encontrada')
          setIsLoading(false)
          return
        }

        setAgency(foundAgency)

        // Cargar propiedades de esta inmobiliaria usando el nuevo endpoint
        if (foundAgency.id.startsWith('user-')) {
          // Para usuarios de la DB, usar el nuevo endpoint
          const userId = foundAgency.id.replace('user-', '')
          const userResponse = await fetch(`/api/users/by-slug?slug=${encodeURIComponent(slug)}`)
          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.user && userData.user.business_name) {
              // Generar slug correcto
              const businessSlug = userData.user.business_name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
              
              const propertiesResponse = await fetch(`/api/inmobiliarias/properties/${businessSlug}`)
              if (propertiesResponse.ok) {
                const propertiesData = await propertiesResponse.json()
                setProperties(propertiesData.properties.map((prop: any) => ({
                  id: prop.id.toString(),
                  title: prop.title,
                  price: prop.price,
                  currency: prop.currency || 'ARS',
                  type: prop.type,
                  rooms: prop.rooms,
                  bathrooms: prop.bathrooms,
                  area_m2: prop.area_m2,
                  address: prop.address,
                  image_url: prop.image_url,
                  views: prop.views || 0,
                })))
              }
            }
          }
        } else {
          // Para agencies de ejemplo, mantener el comportamiento anterior
          const response = await fetch('/api/properties')
          if (response.ok) {
            const data = await response.json()
            
            // Filtrar propiedades según la inmobiliaria
            const filteredProperties = (data.properties || []).filter((prop: any) => {
              // Si es Solar Propiedades, buscar por user_id 33 o user_name
              if (foundAgency.id === 'agency-002') {
                return prop.user_id === 33 || prop.user_name === 'Solar Propiedades'
              }
              // Si es Santa Fe Centro, buscar por professional_service
              if (foundAgency.id === 'agency-001') {
                return prop.professional_service === true
              }
              
              return false
            })

            setProperties(filteredProperties.map((prop: any) => ({
              id: prop.id.toString(),
              title: prop.title,
              price: prop.price,
              currency: prop.currency || 'ARS',
              type: prop.type,
              rooms: prop.rooms,
              bathrooms: prop.bathrooms,
              area_m2: prop.area_m2,
              address: prop.address,
              image_url: prop.image_url,
              views: prop.views || 0,
            })))
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [slug])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando inmobiliaria...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Inmobiliaria no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              La inmobiliaria que buscas no existe o fue eliminada.
            </p>
            <Button asChild>
              <Link href="/propiedades">Ver todas las propiedades</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
          {/* Header de la Inmobiliaria */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {agency.logoUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <SafeImage
                    src={agency.logoUrl}
                    alt={agency.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">{agency.name}</h1>
                </div>
                <p className="text-muted-foreground mb-4">
                  Trabajamos con inmobiliarias locales. Te conectamos con la más adecuada para tu búsqueda.
                </p>
                <div className="flex flex-wrap gap-4">
                  {agency.whatsapp && (
                    <Button asChild variant="default">
                      <a
                        href={`https://wa.me/${agency.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {agency.email && (
                    <Button asChild variant="outline">
                      <a href={`mailto:${agency.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Propiedades */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Propiedades ({properties.length})
              </h2>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link key={property.id} href={`/propiedad/${property.id}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full flex flex-col">
                      {property.image_url && (
                        <div className="relative h-48 w-full">
                          <img
                            src={property.image_url}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className={getTypeColor(property.type)}>
                              {getTypeLabel(property.type)}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <div className="space-y-2 flex-1">
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
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No hay propiedades disponibles</h3>
                <p className="text-muted-foreground">
                  Esta inmobiliaria aún no tiene propiedades publicadas.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

