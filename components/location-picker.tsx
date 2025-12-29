'use client'

import { useEffect, useState } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Importar Leaflet dinámicamente para evitar problemas de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface LocationPickerProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  onLocationChange: (lat: number, lng: number, address: string) => void
  disabled?: boolean
}

// Componente interno para manejar clicks en el mapa
function MapClickHandler({ onMapClick, disabled }: { onMapClick: (lat: number, lng: number) => void; disabled: boolean }) {
  // Importar dinámicamente para evitar problemas en el build
  if (typeof window === 'undefined') return null
  
  const { useMapEvents } = require('react-leaflet')
  useMapEvents({
    click: (e: any) => {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export function LocationPicker({ 
  latitude, 
  longitude, 
  address,
  onLocationChange,
  disabled = false 
}: LocationPickerProps) {
  const [selectedLat, setSelectedLat] = useState<number | null>(latitude || null)
  const [selectedLng, setSelectedLng] = useState<number | null>(longitude || null)
  const [selectedAddress, setSelectedAddress] = useState<string>(address || '')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)

  // Coordenadas por defecto: Centro de Santa Fe Capital
  const defaultCenter: [number, number] = [-31.6333, -60.7000]
  const initialPosition: [number, number] = selectedLat && selectedLng 
    ? [selectedLat, selectedLng]
    : defaultCenter

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return

    // Cargar estilos de Leaflet solo en el cliente
    import('leaflet/dist/leaflet.css')

    // Fix para los iconos de Leaflet en Next.js (solo en el cliente)
    const fixLeafletIcons = async () => {
      const L = await import('leaflet')
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }
    fixLeafletIcons()

    // Inicializar valores si vienen como props
    if (latitude && longitude) {
      setSelectedLat(latitude)
      setSelectedLng(longitude)
    }
    if (address) {
      setSelectedAddress(address)
    }
    
    // Marcar mapa como listo después de un pequeño delay
    const timer = setTimeout(() => setIsMapReady(true), 300)
    return () => clearTimeout(timer)
  }, [latitude, longitude, address])

  const handleMapClick = async (lat: number, lng: number) => {
    if (disabled) return
    
    setSelectedLat(lat)
    setSelectedLng(lng)
    
    // Obtener dirección usando Nominatim (geocodificación inversa gratuita)
    try {
      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MarketSantaFe/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        const fullAddress = data.display_name
        setSelectedAddress(fullAddress)
        onLocationChange(lat, lng, fullAddress)
      } else {
        const coordAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setSelectedAddress(coordAddress)
        onLocationChange(lat, lng, coordAddress)
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error)
      const coordAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setSelectedAddress(coordAddress)
      onLocationChange(lat, lng, coordAddress)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkerDrag = async (e: any) => {
    if (disabled) return
    
    const lat = e.target.getLatLng().lat
    const lng = e.target.getLatLng().lng
    await handleMapClick(lat, lng)
  }

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingresá una dirección para buscar')
      return
    }

    setIsSearching(true)
    try {
      // Buscar dirección usando Nominatim (geocodificación directa)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MarketSantaFe/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        const fullAddress = result.display_name
        
        setSelectedLat(lat)
        setSelectedLng(lng)
        setSelectedAddress(fullAddress)
        onLocationChange(lat, lng, fullAddress)
        
        // Centrar el mapa en la ubicación encontrada
        if (mapInstance) {
          mapInstance.setView([lat, lng], 16)
        }
        
        toast.success('Dirección encontrada')
      } else {
        toast.error('No se encontró la dirección. Intentá con más detalles.')
      }
    } catch (error) {
      console.error('Error buscando dirección:', error)
      toast.error('Error al buscar la dirección')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchAddress()
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        handleMapClick(lat, lng)
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error)
        toast.error('No se pudo obtener tu ubicación actual')
        setIsLoading(false)
      }
    )
  }

  if (!isMapReady) {
    return (
      <div className="space-y-2">
        <Label>Ubicación en el mapa</Label>
        <div className="relative border border-border rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Cargando mapa...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Ubicación en el mapa</Label>
      <div className="space-y-3">
        {/* Campo de búsqueda */}
        {!disabled && (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar dirección (ej: San Martín 1234, Santa Fe)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                disabled={isSearching || isLoading}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={handleSearchAddress}
              disabled={isSearching || isLoading || !searchQuery.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </div>
        )}

        {/* Mapa */}
        <div className="relative border border-border rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <MapContainer
            center={initialPosition}
            zoom={selectedLat && selectedLng ? 16 : 13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            whenCreated={(map) => setMapInstance(map)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedLat && selectedLng && (
              <Marker 
                position={[selectedLat, selectedLng]} 
                draggable={!disabled}
                eventHandlers={{
                  dragend: handleMarkerDrag
                }}
              >
                <Popup>
                  {selectedAddress || 'Ubicación seleccionada'}
                </Popup>
              </Marker>
            )}
            {!disabled && (
              <MapClickHandler onMapClick={handleMapClick} disabled={disabled} />
            )}
          </MapContainer>
          {isLoading && (
            <div className="absolute top-2 right-2 bg-background/90 px-3 py-2 rounded-lg shadow-md z-[1000]">
              <p className="text-xs text-muted-foreground">Obteniendo dirección...</p>
            </div>
          )}
        </div>

        {/* Información y botones */}
        {!disabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex-1">
                {selectedAddress || 'Hacé clic en el mapa o buscá una dirección para seleccionar la ubicación exacta'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                disabled={isLoading || isSearching}
                className="ml-4"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Mi ubicación
              </Button>
            </div>
          </div>
        )}
        {selectedLat && selectedLng && (
          <p className="text-xs text-muted-foreground">
            Coordenadas: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  )
}
