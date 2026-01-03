// Página de gestión de leads (admin)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Shield, MessageSquare, Search, ArrowLeft, Building2, User, MapPin, DollarSign, Calendar, Filter } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Lead {
  id: number
  tenant_id: number | null
  tenant_name: string | null
  tenant_slug: string | null
  property_id: number | null
  property_title: string | null
  flow_type: string
  user_type: string
  source: string
  status: string
  name: string | null
  email: string | null
  whatsapp: string | null
  zone: string | null
  property_type: string | null
  budget_min: number | null
  budget_max: number | null
  budget: number | null
  bedrooms: number | null
  area_m2: number | null
  condition: string | null
  address: string | null
  assigned_to_name: string | null
  created_at: string
  updated_at: string
  submitted_at: string | null
}

export default function AdminLeadsPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [flowTypeFilter, setFlowTypeFilter] = useState<string>('')
  const [tenantFilter, setTenantFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/admin/leads')
          return
        }

        const data = await response.json()
        if (!data.user?.is_admin) {
          router.push('/')
          return
        }

        setIsAdmin(true)
        fetchLeads()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/admin/leads')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (isAdmin) {
      fetchLeads()
    }
  }, [page, statusFilter, flowTypeFilter, tenantFilter, isAdmin])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (flowTypeFilter) params.append('flow_type', flowTypeFilter)
      if (tenantFilter) params.append('tenant_id', tenantFilter)
      params.append('page', page.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/leads?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLeads(data.leads || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      } else {
        toast.error('Error al cargar leads')
      }
    } catch (error) {
      console.error('Error cargando leads:', error)
      toast.error('Error al cargar leads')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'qualified':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'discarded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFlowTypeLabel = (flowType: string) => {
    switch (flowType) {
      case 'ALQUILAR':
        return 'Alquilar'
      case 'COMPRAR':
        return 'Comprar'
      case 'VENDER':
        return 'Vender'
      case 'TASACION':
        return 'Tasación'
      case 'CONTACTO':
        return 'Contacto'
      default:
        return flowType
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'web:property':
        return 'Página de Propiedad'
      case 'web:home':
        return 'Página Principal'
      case 'web:landing':
        return 'Landing Page'
      case 'web:inmobiliaria':
        return 'Página Inmobiliaria'
      case 'ads':
        return 'Publicidad'
      case 'whatsapp':
        return 'WhatsApp'
      default:
        return source
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.whatsapp?.toLowerCase().includes(searchLower) ||
      lead.property_title?.toLowerCase().includes(searchLower) ||
      lead.tenant_name?.toLowerCase().includes(searchLower)
    )
  })

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando permisos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Bandeja de Leads
              </h1>
              <p className="text-muted-foreground">
                Gestioná todas las consultas y mensajes recibidos
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, propiedad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Calificado</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
                <SelectItem value="discarded">Descartado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flowTypeFilter || 'all'} onValueChange={(value) => setFlowTypeFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de flujo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ALQUILAR">Alquilar</SelectItem>
                <SelectItem value="COMPRAR">Comprar</SelectItem>
                <SelectItem value="VENDER">Vender</SelectItem>
                <SelectItem value="TASACION">Tasación</SelectItem>
                <SelectItem value="CONTACTO">Contacto</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('')
                setFlowTypeFilter('')
                setTenantFilter('')
                setSearch('')
                setPage(1)
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Leads</div>
            <div className="text-2xl font-bold">{total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Nuevos</div>
            <div className="text-2xl font-bold text-blue-600">
              {leads.filter((l) => l.status === 'new').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Contactados</div>
            <div className="text-2xl font-bold text-yellow-600">
              {leads.filter((l) => l.status === 'contacted').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Calificados</div>
            <div className="text-2xl font-bold text-green-600">
              {leads.filter((l) => l.status === 'qualified').length}
            </div>
          </Card>
        </div>

        {/* Lista de leads */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información principal */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <Badge variant="outline">
                            {getFlowTypeLabel(lead.flow_type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getSourceLabel(lead.source)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {lead.name || 'Sin nombre'}
                        </h3>
                        {lead.property_title && (
                          <p className="text-sm text-muted-foreground">
                            Propiedad: {lead.property_title}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(lead.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.whatsapp && (
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.whatsapp}</span>
                        </div>
                      )}
                      {lead.zone && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.zone}</span>
                        </div>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {lead.property_type && (
                        <div>
                          <div className="text-muted-foreground">Tipo</div>
                          <div className="font-semibold">{lead.property_type}</div>
                        </div>
                      )}
                      {(lead.budget_min || lead.budget_max || lead.budget) && (
                        <div>
                          <div className="text-muted-foreground">Presupuesto</div>
                          <div className="font-semibold">
                            {lead.budget
                              ? formatPrice(lead.budget)
                              : lead.budget_min && lead.budget_max
                              ? `${formatPrice(lead.budget_min)} - ${formatPrice(lead.budget_max)}`
                              : lead.budget_min
                              ? `Desde ${formatPrice(lead.budget_min)}`
                              : `Hasta ${formatPrice(lead.budget_max!)}`}
                          </div>
                        </div>
                      )}
                      {lead.bedrooms && (
                        <div>
                          <div className="text-muted-foreground">Ambientes</div>
                          <div className="font-semibold">{lead.bedrooms}</div>
                        </div>
                      )}
                      {lead.area_m2 && (
                        <div>
                          <div className="text-muted-foreground">Área</div>
                          <div className="font-semibold">{lead.area_m2} m²</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información de inmobiliaria y acciones */}
                  <div className="lg:col-span-1 space-y-4 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                    {lead.tenant_name && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold text-muted-foreground">
                            Inmobiliaria
                          </span>
                        </div>
                        <div className="font-semibold">{lead.tenant_name}</div>
                      </div>
                    )}
                    {lead.assigned_to_name && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Asignado a
                        </div>
                        <div className="font-semibold">{lead.assigned_to_name}</div>
                      </div>
                    )}
                    {lead.property_id && (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/propiedad/${lead.property_id}`}>
                          Ver Propiedad
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No se encontraron leads</h3>
            <p className="text-muted-foreground">
              {search || statusFilter || flowTypeFilter
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay leads registrados'}
            </p>
          </Card>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

