'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { zones } from '@/lib/zones'
import { X, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export function PropertiesFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  // Estado local solo para inputs de texto (que el usuario puede estar escribiendo)
  const [localFilters, setLocalFilters] = useState({
    q: '',
    min: '',
    max: '',
    min_area: '',
    max_area: '',
  })

  // Leer valores actuales de los query params (sin estado para evitar hidratación)
  const currentFilters = {
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    zone: searchParams.get('zone') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    rooms: searchParams.get('rooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    min_area: searchParams.get('min_area') || '',
    max_area: searchParams.get('max_area') || '',
  }

  // Sincronizar estado local con searchParams cuando cambian
  useEffect(() => {
    setLocalFilters({
      q: searchParams.get('q') || '',
      min: searchParams.get('min') || '',
      max: searchParams.get('max') || '',
      min_area: searchParams.get('min_area') || '',
      max_area: searchParams.get('max_area') || '',
    })
  }, [searchParams])

  const updateLocalFilter = (key: keyof typeof localFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== '' && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/propiedades?${params.toString()}`)
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Aplicar filtros locales
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/propiedades?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    router.push('/propiedades')
    setIsOpen(false)
  }

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== '')

  return (
    <>
      {/* Botón para abrir filtros en móvil */}
      <div className="md:hidden mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {Object.values(currentFilters).filter(v => v !== '').length}
            </span>
          )}
        </Button>
      </div>

      {/* Panel de filtros */}
      <Card className={`p-4 md:p-6 lg:sticky lg:top-6 lg:mb-0 mb-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Búsqueda de texto */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              type="text"
              placeholder="Buscar por título o descripción..."
              value={localFilters.q}
              onChange={(e) => updateLocalFilter('q', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters()
                }
              }}
            />
          </div>

          {/* Tipo de operación */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de operación</Label>
            <Select
              value={currentFilters.type || 'all'}
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler-temporal">Alquiler Temporal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zona */}
          <div className="space-y-2">
            <Label htmlFor="zone">Zona</Label>
            <Select
              value={currentFilters.zone || 'all'}
              onValueChange={(value) => updateFilter('zone', value)}
            >
              <SelectTrigger id="zone">
                <SelectValue placeholder="Todas las zonas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las zonas</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={zone.slug}>
                    {zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <Label>Rango de precio</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Mínimo
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={localFilters.min}
                  onChange={(e) => updateLocalFilter('min', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Máximo
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Sin límite"
                  value={localFilters.max}
                  onChange={(e) => updateLocalFilter('max', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Ambientes */}
          <div className="space-y-2">
            <Label htmlFor="rooms">Mín. ambientes</Label>
            <Select
              value={currentFilters.rooms || 'all'}
              onValueChange={(value) => updateFilter('rooms', value)}
            >
              <SelectTrigger id="rooms">
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquiera</SelectItem>
                <SelectItem value="1">1 ambiente</SelectItem>
                <SelectItem value="2">2 ambientes</SelectItem>
                <SelectItem value="3">3 ambientes</SelectItem>
                <SelectItem value="4">4 ambientes</SelectItem>
                <SelectItem value="5">5+ ambientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Baños */}
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Mín. baños</Label>
            <Select
              value={currentFilters.bathrooms || 'all'}
              onValueChange={(value) => updateFilter('bathrooms', value)}
            >
              <SelectTrigger id="bathrooms">
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquiera</SelectItem>
                <SelectItem value="1">1 baño</SelectItem>
                <SelectItem value="2">2 baños</SelectItem>
                <SelectItem value="3">3 baños</SelectItem>
                <SelectItem value="4">4+ baños</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Superficie */}
          <div className="space-y-2">
            <Label>Superficie (m²)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="min-area" className="text-xs text-muted-foreground">
                  Mínimo
                </Label>
                <Input
                  id="min-area"
                  type="number"
                  placeholder="0"
                  value={localFilters.min_area}
                  onChange={(e) => updateLocalFilter('min_area', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="max-area" className="text-xs text-muted-foreground">
                  Máximo
                </Label>
                <Input
                  id="max-area"
                  type="number"
                  placeholder="Sin límite"
                  value={localFilters.max_area}
                  onChange={(e) => updateLocalFilter('max_area', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Botón aplicar (solo en móvil) */}
          <div className="md:hidden pt-4 border-t">
            <Button
              type="button"
              onClick={applyFilters}
              className="w-full"
            >
              Aplicar filtros
            </Button>
          </div>

          {/* Aplicar automáticamente en desktop */}
          <div className="hidden md:block">
            <Button
              type="button"
              onClick={applyFilters}
              className="w-full"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

