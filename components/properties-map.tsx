'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

// Importar Leaflet dinámicamente para evitar problemas de SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface Property {
  id: string
  title: string
  price: number
  currency: string
  address?: string
  latitude: number | null
  longitude: number | null
  image_url?: string
  type: string
}

interface PropertiesMapProps {
  properties: Property[]
}

// Coordenadas por defecto: Centro de Santa Fe Capital
const defaultCenter: [number, number] = [-31.6333, -60.7000]
const defaultZoom = 13

export function PropertiesMap({ properties }: PropertiesMapProps) {
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter)
  const [mapZoom, setMapZoom] = useState(defaultZoom)

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

    // Calcular centro del mapa basado en las propiedades con coordenadas
    const propertiesWithCoords = properties.filter(
      p => p.latitude !== null && p.longitude !== null
    )

    if (propertiesWithCoords.length > 0) {
      const avgLat = propertiesWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / propertiesWithCoords.length
      const avgLng = propertiesWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / propertiesWithCoords.length
      setMapCenter([avgLat, avgLng])
      
      // Ajustar zoom basado en la cantidad de propiedades
      if (propertiesWithCoords.length === 1) {
        setMapZoom(15)
      } else if (propertiesWithCoords.length <= 5) {
        setMapZoom(14)
      } else {
        setMapZoom(13)
      }
    }

    // Reducir z-index de elementos Leaflet para que no tapen modales (z-50)
    const style = document.createElement('style')
    style.id = 'leaflet-z-index-fix'
    style.textContent = `
      .leaflet-container { z-index: 0 !important; }
      .leaflet-pane { z-index: 1 !important; }
      .leaflet-popup { z-index: 10 !important; }
      .leaflet-control { z-index: 10 !important; }
    `
    // Solo agregar si no existe
    if (!document.getElementById('leaflet-z-index-fix')) {
      document.head.appendChild(style)
    }

    // Marcar mapa como listo después de un pequeño delay
    const timer = setTimeout(() => setIsMapReady(true), 300)
    return () => {
      clearTimeout(timer)
      // No remover el estilo porque puede ser usado por otros mapas
    }
  }, [properties])

  const formatPrice = (price: number, currency: string) => {
    const formatted = new Intl.NumberFormat('es-AR').format(price)
    return currency === 'USD' ? `U$S ${formatted}` : `$${formatted}`
  }

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

  // Filtrar propiedades que tienen coordenadas
  const propertiesWithCoords = properties.filter(
    p => p.latitude !== null && p.longitude !== null
  )

  if (!isMapReady) {
    return (
      <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-border bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-border bg-muted flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay propiedades con ubicación disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border" style={{ position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                {property.image_url && (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{property.title}</h4>
                <p className="text-xs text-muted-foreground mb-1">
                  {getTypeLabel(property.type)}
                </p>
                <p className="text-sm font-semibold text-primary mb-1">
                  {formatPrice(property.price, property.currency)}
                </p>
                {property.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{property.address}</span>
                  </p>
                )}
                <a
                  href={`/propiedad/${property.id}`}
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  Ver detalles →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

