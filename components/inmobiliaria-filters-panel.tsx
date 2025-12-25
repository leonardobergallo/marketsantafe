// Panel de filtros específico para inmobiliaria
'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { zones } from '@/lib/zones'
import { X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export interface InmobiliariaFilters {
  q?: string
  tipo?: string // alquiler, venta, terreno
  zone?: string
  min?: number
  max?: number
}

export function InmobiliariaFiltersPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const currentFilters: InmobiliariaFilters = {
    q: searchParams.get('q') || undefined,
    tipo: searchParams.get('tipo') || undefined,
    zone: searchParams.get('zone') || undefined,
    min: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
    max: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
  }

  const updateFilters = (newFilters: Partial<InmobiliariaFilters>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  const hasActiveFilters = Object.values(currentFilters).some((value) => value !== undefined && value !== '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Tipo de Propiedad */}
      <div>
        <Label htmlFor="tipo">Tipo de Propiedad</Label>
        <Select
          value={currentFilters.tipo || 'all'}
          onValueChange={(value) => updateFilters({ tipo: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="alquiler">Alquiler</SelectItem>
            <SelectItem value="venta">Venta</SelectItem>
            <SelectItem value="terreno">Terreno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Zona */}
      <div>
        <Label htmlFor="zone">Zona</Label>
        <Select
          value={currentFilters.zone || 'all'}
          onValueChange={(value) => updateFilters({ zone: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las zonas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las zonas</SelectItem>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Precio Mínimo */}
      <div>
        <Label htmlFor="min">Precio Mínimo</Label>
        <Input
          id="min"
          type="number"
          placeholder="0"
          value={currentFilters.min || ''}
          onChange={(e) => {
            const value = e.target.value
            updateFilters({ min: value ? Number(value) : undefined })
          }}
        />
      </div>

      {/* Precio Máximo */}
      <div>
        <Label htmlFor="max">Precio Máximo</Label>
        <Input
          id="max"
          type="number"
          placeholder="Sin límite"
          value={currentFilters.max || ''}
          onChange={(e) => {
            const value = e.target.value
            updateFilters({ max: value ? Number(value) : undefined })
          }}
        />
      </div>
    </div>
  )
}

