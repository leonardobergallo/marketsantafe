// Selector de zona - componente clave de la app
// TypeScript: Client Component con estado local
// En JavaScript sería similar pero sin tipos

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin } from 'lucide-react'
import { zones } from '@/lib/zones'
import Image from 'next/image'

export function ZoneSelector() {
  const router = useRouter()
  const pathname = usePathname()
  // Estado para la zona seleccionada
  // TypeScript: puede ser string o undefined
  // En JavaScript sería: const [selectedZone, setSelectedZone] = useState()
  const [selectedZone, setSelectedZone] = useState<string>('all')

  // Cargamos la zona desde localStorage o query params
  useEffect(() => {
    // Intentamos obtener de localStorage primero
    const savedZone = localStorage.getItem('selectedZone')
    if (savedZone) {
      setSelectedZone(savedZone)
    }

    // También podemos leer de query params si existe
    const params = new URLSearchParams(window.location.search)
    const zoneParam = params.get('zone')
    if (zoneParam) {
      setSelectedZone(zoneParam)
    }
  }, [])

  // Función para cambiar la zona
  const handleZoneChange = (zoneId: string) => {
    setSelectedZone(zoneId)
    localStorage.setItem('selectedZone', zoneId)

    // Actualizamos la URL si estamos en una página que usa filtros
    if (pathname === '/mercado' || pathname === '/comer' || pathname === '/') {
      const params = new URLSearchParams(window.location.search)
      if (zoneId === 'all') {
        params.delete('zone')
      } else {
        params.set('zone', zoneId)
      }
      const queryString = params.toString()
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
    }
  }

  // Obtenemos el nombre de la zona seleccionada
  const selectedZoneName = zones.find((z) => z.id === selectedZone)?.name || 'Toda la ciudad'

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Select value={selectedZone} onValueChange={handleZoneChange}>
        <SelectTrigger className="w-[140px] sm:w-[160px] border border-border bg-background hover:bg-muted/50 h-9 text-sm">
          <SelectValue>
            <span className="text-sm font-medium text-foreground truncate">{selectedZoneName}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toda la ciudad</SelectItem>
          {zones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id}>
              {zone.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

