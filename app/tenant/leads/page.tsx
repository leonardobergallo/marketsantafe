// Dashboard Tenant - Bandeja de leads
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Lead, FlowType, LeadStatus } from '@/lib/leads-types'
import { ArrowRight, Filter, Download, Search } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TenantLeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    flow_type: '',
    zone: '',
  })
  const [tenantId, setTenantId] = useState<number | null>(null)

  useEffect(() => {
    // Obtener tenant_id del usuario actual
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.tenant_id) {
          setTenantId(data.user.tenant_id)
          loadLeads(data.user.tenant_id)
        }
      })
      .catch(console.error)
  }, [])

  const loadLeads = async (tid: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.flow_type) params.append('flow_type', filters.flow_type)
      if (filters.zone) params.append('zone', filters.zone)

      const response = await fetch(`/api/tenant/${tid}/leads?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Error cargando leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      loadLeads(tenantId)
    }
  }, [filters, tenantId])

  const getStatusBadge = (status: LeadStatus) => {
    const variants: Record<LeadStatus, 'default' | 'secondary' | 'outline'> = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'default',
      closed: 'outline',
      discarded: 'outline',
      draft: 'secondary',
    }
    const labels: Record<LeadStatus, string> = {
      new: 'Nuevo',
      contacted: 'Contactado',
      qualified: 'Calificado',
      closed: 'Cerrado',
      discarded: 'Descartado',
      draft: 'Borrador',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getFlowTypeLabel = (flowType: FlowType) => {
    const labels: Record<FlowType, string> = {
      ALQUILAR: 'Alquilar',
      COMPRAR: 'Comprar',
      VENDER: 'Vender',
      TASACION: 'Tasación',
      CONTACTO: 'Contacto',
    }
    return labels[flowType] || flowType
  }

  if (!tenantId) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bandeja de Leads</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y sigue tus leads
          </p>
        </div>
        <Button onClick={() => {/* Exportar CSV */}} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="contacted">Contactado</SelectItem>
                <SelectItem value="qualified">Calificado</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
                <SelectItem value="discarded">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de flujo</label>
            <Select value={filters.flow_type} onValueChange={(value) => setFilters({ ...filters, flow_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="ALQUILAR">Alquilar</SelectItem>
                <SelectItem value="COMPRAR">Comprar</SelectItem>
                <SelectItem value="VENDER">Vender</SelectItem>
                <SelectItem value="TASACION">Tasación</SelectItem>
                <SelectItem value="CONTACTO">Contacto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zona</label>
            <Input
              placeholder="Buscar zona..."
              value={filters.zone}
              onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Tabla de leads */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay leads para mostrar
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell className="font-medium">{lead.name || '-'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.whatsapp && <div className="text-sm">📱 {lead.whatsapp}</div>}
                      {lead.email && <div className="text-sm">{lead.email}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getFlowTypeLabel(lead.flow_type)}</TableCell>
                  <TableCell>{lead.zone || '-'}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/tenant/leads/${lead.id}`)}
                    >
                      Ver <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}


