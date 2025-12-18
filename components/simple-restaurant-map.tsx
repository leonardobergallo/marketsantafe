// Componente de mapa simple usando Google Maps Embed API (iframe)
// TypeScript: Componente simple que no requiere JavaScript API
// En JavaScript sería similar pero sin tipos

interface Restaurant {
  id: string | number
  name: string
  latitude: number
  longitude: number
  address?: string
}

interface SimpleRestaurantMapProps {
  restaurants: Restaurant[]
  center?: { lat: number; lng: number }
  zoom?: number
}

export function SimpleRestaurantMap({ restaurants, center, zoom = 13 }: SimpleRestaurantMapProps) {
  // Coordenadas por defecto: Centro de Santa Fe Capital
  const defaultCenter = center || { lat: -31.6333, lng: -60.7000 }

  // Si hay restaurantes, calculamos el centro promedio
  let mapCenter = defaultCenter
  if (restaurants.length > 0 && restaurants[0].latitude && restaurants[0].longitude) {
    const avgLat = restaurants.reduce((sum, r) => sum + r.latitude, 0) / restaurants.length
    const avgLng = restaurants.reduce((sum, r) => sum + r.longitude, 0) / restaurants.length
    mapCenter = { lat: avgLat, lng: avgLng }
  }

  // Construimos la URL de Google Maps Embed (formato ULTRA simple)
  // TypeScript: template string para construir la URL
  // En JavaScript sería: const url = `https://www.google.com/maps?q=...&output=embed`
  
  // Formato más simple posible: usar coordenadas directamente sin API key
  // Este formato funciona sin necesidad de API key de Google
  let finalUrl = ''
  
  if (restaurants.length > 0 && restaurants[0].latitude && restaurants[0].longitude) {
    // Si hay restaurantes, mostrar el primero
    const firstRestaurant = restaurants[0]
    // Formato simple sin API key - funciona directamente
    finalUrl = `https://www.google.com/maps?q=${firstRestaurant.latitude},${firstRestaurant.longitude}&hl=es&z=${zoom}&output=embed`
  } else {
    // Si no hay restaurantes, mostrar el centro de Santa Fe
    finalUrl = `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=es&z=${zoom}&output=embed`
  }

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-border">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={finalUrl}
        title="Mapa de restaurantes en Santa Fe"
      />
    </div>
  )
}

