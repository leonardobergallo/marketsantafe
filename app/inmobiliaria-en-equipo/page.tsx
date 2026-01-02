'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Home, MessageSquare, Loader2, Phone, Mail, Plus, Eye, Edit } from 'lucide-react'
import { fetchAgencies } from '@/lib/services/properties'
import type { Agency } from '@/lib/types'
import { SafeImage } from '@/components/safe-image'
import Link from 'next/link'

interface Lead {
  id: string
  propertyId: string
  propertyTitle: string
  agencyId: string | null
  agencyName: string | null
  nombre: string
  telefono: string
  email?: string
  mensaje: string
  estado: 'nuevo' | 'contactado' | 'cerrado'
  createdAt: string
}

interface PropertyWithAgency {
  id: string
  title: string
  price: number
  operation: string
  agencyId: string | null
  agencyName: string | null
  image_url?: string
  views: number
}

export default function InmobiliariaEnEquipoPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [properties, setProperties] = useState<PropertyWithAgency[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/inmobiliaria-en-equipo')
          return
        }
        setIsAuthenticated(true)
        loadData()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/inmobiliaria-en-equipo')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar agencies
      const agenciesData = await fetchAgencies()
      setAgencies(agenciesData)

      // Cargar properties del usuario
      const propsResponse = await fetch('/api/properties/me')
      if (propsResponse.ok) {
        const propsData = await propsResponse.json()
        const propsWithAgency = (propsData.properties || []).map((prop: any) => {
          // Mapeo temporal: asignar agencies según el usuario o professional_service
          let agencyId = null
          let agencyName = null
          
          // Si el usuario es Solar Propiedades (ID 33 o nombre)
          if (prop.user_id === 33 || prop.user_name === 'Solar Propiedades') {
            agencyId = 'agency-002'
            agencyName = 'Solar Propiedades'
          } else if (prop.professional_service) {
            agencyId = 'agency-001'
            agencyName = 'Inmobiliaria Santa Fe Centro'
          }
          
          return {
            id: prop.id.toString(),
            title: prop.title,
            price: prop.price,
            operation: prop.type,
            agencyId,
            agencyName,
            image_url: prop.image_url,
            views: prop.views || 0,
          }
        })
        setProperties(propsWithAgency)
      }

      // Cargar leads (por ahora vacío, en el futuro vendría de la API)
      setLeads([])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800'
      case 'contactado':
        return 'bg-yellow-100 text-yellow-800'
      case 'cerrado':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case 'alquiler':
        return 'Alquiler'
      case 'venta':
        return 'Venta'
      case 'alquiler-temporal':
        return 'Alquiler Temporal'
      default:
        return operation
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR').format(price)
  }

  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
        <Footer />
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Inmobiliaria en Equipo
              </h1>
              <p className="text-muted-foreground">
                Gestioná tus propiedades, inmobiliarias asociadas y leads
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Trabajamos con inmobiliarias locales. Te conectamos con la más adecuada para tu búsqueda.
              </p>
            </div>
            <Button asChild>
              <Link href="/inmobiliaria-en-equipo/publicar">
                <Plus className="mr-2 h-4 w-4" />
                Publicar propiedad
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">
              <Home className="mr-2 h-4 w-4" />
              Mis Propiedades ({properties.length})
            </TabsTrigger>
            <TabsTrigger value="leads">
              <MessageSquare className="mr-2 h-4 w-4" />
              Leads ({leads.length})
            </TabsTrigger>
            <TabsTrigger value="agencies">
              <Building2 className="mr-2 h-4 w-4" />
              Inmobiliarias ({agencies.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Propiedades */}
          <TabsContent value="properties" className="mt-6">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Mis Propiedades</h2>
                  <p className="text-sm text-muted-foreground">
                    {properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'} publicadas
                  </p>
                </div>
                <Button asChild>
                  <Link href="/inmobiliaria-en-equipo/publicar">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva propiedad
                  </Link>
                </Button>
              </div>
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {property.image_url && (
                        <div className="relative h-40 w-full">
                          <img
                            src={property.image_url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{property.title}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{getOperationLabel(property.operation)}</span>
                            <span className="font-semibold">${formatPrice(property.price)}</span>
                          </div>
                          <div className="pt-2 border-t">
                            {property.agencyName ? (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                <span>{property.agencyName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Gestionado por la plataforma
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{property.views} vistas</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/inmobiliaria-en-equipo/editar/${property.id}`}>
                              <Edit className="mr-2 h-3 w-3" />
                              Editar
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={`/propiedad/${property.id}`}>
                              <Eye className="mr-2 h-3 w-3" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                        <div className="mt-2">
                          <select
                            className="w-full text-xs border rounded px-2 py-1"
                            defaultValue={property.agencyId || ''}
                            onChange={(e) => {
                              // Solo UI, no persiste
                              console.log('Cambiar inmobiliaria de', property.id, 'a', e.target.value)
                            }}
                          >
                            <option value="">Asignar a plataforma</option>
                            {agencies.map((agency) => (
                              <option key={agency.id} value={agency.id}>
                                {agency.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tenés propiedades publicadas</p>
                  <Button asChild className="mt-4">
                    <Link href="/inmobiliaria-en-equipo/publicar">
                      <Plus className="mr-2 h-4 w-4" />
                      Publicar primera propiedad
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tab Leads */}
          <TabsContent value="leads" className="mt-6">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Leads Recibidos</h2>
                <p className="text-sm text-muted-foreground">
                  {leads.length} {leads.length === 1 ? 'lead' : 'leads'} en total
                </p>
              </div>
              {leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{lead.nombre}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{lead.mensaje}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Propiedad: {lead.propertyTitle}</span>
                            {lead.agencyName && (
                              <span>Inmobiliaria: {lead.agencyName}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {lead.telefono && (
                              <a
                                href={`tel:${lead.telefono}`}
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" />
                                {lead.telefono}
                              </a>
                            )}
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </a>
                            )}
                          </div>
                        </div>
                        <Badge className={getEstadoColor(lead.estado)}>
                          {lead.estado}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay leads disponibles</p>
                  <p className="text-sm mt-2">
                    Los leads aparecerán aquí cuando los usuarios envíen consultas sobre tus propiedades
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tab Inmobiliarias */}
          <TabsContent value="agencies" className="mt-6">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Inmobiliarias Asociadas</h2>
                <p className="text-sm text-muted-foreground">
                  {agencies.length} {agencies.length === 1 ? 'inmobiliaria' : 'inmobiliarias'} registradas
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Trabajamos con inmobiliarias locales. Te conectamos con la más adecuada para tu búsqueda.
                </p>
              </div>
              {agencies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {agency.logoUrl && (
                          <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                            <SafeImage
                              src={agency.logoUrl}
                              alt={agency.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{agency.name}</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {agency.whatsapp && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <a
                                  href={`https://wa.me/${agency.whatsapp.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {agency.whatsapp}
                                </a>
                              </div>
                            )}
                            {agency.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a
                                  href={`mailto:${agency.email}`}
                                  className="text-primary hover:underline"
                                >
                                  {agency.email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay inmobiliarias registradas</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

