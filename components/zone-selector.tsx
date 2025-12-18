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
    if (pathname === '/mercado' || pathname === '/comer') {
      const params = new URLSearchParams(window.location.search)
      if (zoneId === 'all') {
        params.delete('zone')
      } else {
        params.set('zone', zoneId)
      }
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // Obtenemos el nombre de la zona seleccionada
  const selectedZoneName = zones.find((z) => z.id === selectedZone)?.name || 'Toda la ciudad'

  return (
    <div className="flex items-center gap-3">
      {/* Badge zona Santa Fe - completo sin cortes, más grande */}
      <div className="relative w-auto h-12 sm:h-14 md:h-16 flex-shrink-0">
        <Image
          src="/badge_zona_santafe.png"
          alt="Zona Santa Fe"
          width={180}
          height={64}
          className="object-contain h-full w-auto"
          priority
        />
      </div>
      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      <Select value={selectedZone} onValueChange={handleZoneChange}>
        <SelectTrigger className="w-[180px] sm:w-[200px] border-none shadow-none focus:ring-0 h-auto p-0">
          <SelectValue>
            <span className="text-sm sm:text-base font-medium text-foreground">{selectedZoneName}</span>
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

