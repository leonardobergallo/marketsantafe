// Panel de filtros para la página de explorar
// TypeScript: definimos las props con una interfaz
// En JavaScript esto sería: export function FiltersPanel({ filters, onFilterChange, onClear }) { ... }

'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'
import { type Condition } from '@/lib/mockListings'
import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export interface Filters {
  q?: string
  category?: string
  zone?: string
  min?: number
  max?: number
  condition?: Condition
}

export function FiltersPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtenemos los valores actuales de los query params
  // TypeScript: searchParams.get puede retornar null, por eso usamos || undefined
  const currentFilters: Filters = {
    q: searchParams.get('q') || undefined,
    category: searchParams.get('cat') || undefined,
    zone: searchParams.get('zone') || undefined,
    min: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
    max: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
    condition: (searchParams.get('cond') as Condition) || undefined,
  }

  // Función para actualizar los query params
  // En JavaScript esto sería una función normal sin tipos
  const updateFilters = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Mapeo de claves internas a query params
    // TypeScript: definimos un objeto de mapeo con tipos
    // En JavaScript sería: const paramMap = { ... }
    const paramMap: Record<string, string> = {
      q: 'q',
      category: 'cat',
      zone: 'zone',
      min: 'min',
      max: 'max',
      condition: 'cond',
    }

    // Actualizamos cada filtro
    // TypeScript: filtramos valores vacíos y "all" (valor especial para "todas")
    // En JavaScript sería similar pero sin tipos
    Object.entries(newFilters).forEach(([key, value]) => {
      const paramKey = paramMap[key] || key
      if (value && value !== '' && value !== 'all') {
        params.set(paramKey, String(value))
      } else {
        params.delete(paramKey)
      }
    })

    // Navegamos a la nueva URL con los filtros actualizados
    router.push(`/explorar?${params.toString()}`)
  }

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    router.push('/explorar')
  }

  // Verificamos si hay filtros activos
  const hasActiveFilters = Object.values(currentFilters).some((value) => value !== undefined && value !== '')

  return (
    <div className="space-y-6">
      {/* Título y botón limpiar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Búsqueda por texto */}
      <div className="space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Buscar productos..."
          value={currentFilters.q || ''}
          onChange={(e) => updateFilters({ q: e.target.value })}
        />
      </div>

      {/* Filtro por categoría */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select
          value={currentFilters.category || 'all'}
          onValueChange={(value) => updateFilters({ category: value })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por zona */}
      <div className="space-y-2">
        <Label htmlFor="zone">Zona</Label>
        <Select
          value={currentFilters.zone || 'all'}
          onValueChange={(value) => updateFilters({ zone: value })}
        >
          <SelectTrigger id="zone">
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

      {/* Filtro por condición */}
      <div className="space-y-2">
        <Label htmlFor="condition">Condición</Label>
        <Select
          value={currentFilters.condition || 'all'}
          onValueChange={(value) => updateFilters({ condition: value === 'all' ? undefined : (value as Condition) })}
        >
          <SelectTrigger id="condition">
            <SelectValue placeholder="Todas las condiciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las condiciones</SelectItem>
            <SelectItem value="nuevo">Nuevo</SelectItem>
            <SelectItem value="usado">Usado</SelectItem>
            <SelectItem value="reacondicionado">Reacondicionado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por precio */}
      <div className="space-y-4">
        <Label>Rango de precio</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">
              Mínimo
            </Label>
            <Input
              id="min-price"
              type="number"
              placeholder="0"
              value={currentFilters.min || ''}
              onChange={(e) => updateFilters({ min: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">
              Máximo
            </Label>
            <Input
              id="max-price"
              type="number"
              placeholder="Sin límite"
              value={currentFilters.max || ''}
              onChange={(e) => updateFilters({ max: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

