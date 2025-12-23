// Componente de mapa de Google Maps para mostrar restaurantes
// TypeScript: Client Component que carga Google Maps
// En JavaScript sería similar pero sin tipos

'use client'

import { useEffect, useRef } from 'react'

interface Restaurant {
  id: string | number
  name: string
  latitude: number
  longitude: number
  food_type?: string
  zone?: string
}

interface RestaurantMapProps {
  restaurants: Restaurant[]
  center?: { lat: number; lng: number }
  zoom?: number
}

export function RestaurantMap({ restaurants, center, zoom = 13 }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Coordenadas por defecto: Centro de Santa Fe Capital
  const defaultCenter = center || { lat: -31.6333, lng: -60.7000 }

  useEffect(() => {
    // Cargar Google Maps solo si no está cargado
    if (typeof window === 'undefined' || !mapRef.current) return

    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps) {
      initMap()
    } else {
      // Cargar el script de Google Maps
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initMap()
      }
      document.head.appendChild(script)
    }

    function initMap() {
      if (!mapRef.current || !window.google) return

      // Crear el mapa
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        styles: [
          // Estilo minimalista
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      mapInstanceRef.current = map

      // Limpiar marcadores anteriores
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      // Agregar marcadores para cada restaurante
      restaurants.forEach((restaurant) => {
        if (restaurant.latitude && restaurant.longitude) {
          const marker = new window.google.maps.Marker({
            position: { lat: restaurant.latitude, lng: restaurant.longitude },
            map: map,
            title: restaurant.name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="#fff" stroke-width="2"/>
                  <text x="16" y="20" font-size="16" fill="white" text-anchor="middle">🍔</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
            },
          })

          // Info window con información del restaurante
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${restaurant.name}</h3>
                ${restaurant.food_type ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${restaurant.food_type}</p>` : ''}
                ${restaurant.zone ? `<p style="margin: 0; color: #666; font-size: 12px;">📍 ${restaurant.zone}</p>` : ''}
              </div>
            `,
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })

          markersRef.current.push(marker)
        }
      })

      // Ajustar el zoom para mostrar todos los marcadores
      if (restaurants.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        restaurants.forEach((restaurant) => {
          if (restaurant.latitude && restaurant.longitude) {
            bounds.extend({ lat: restaurant.latitude, lng: restaurant.longitude })
          }
        })
        if (restaurants.length > 1) {
          map.fitBounds(bounds)
        }
      }
    }

    // Cleanup
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null))
    }
  }, [restaurants, defaultCenter, zoom])

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

// Extender el tipo Window para incluir Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}




