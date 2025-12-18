// Página de Gastronomía - Qué comer cerca, ahora
// TypeScript: Next.js App Router usa searchParams como prop
// En JavaScript esto sería: export default function ComerPage({ searchParams }) { ... }

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SimpleRestaurantMap } from '@/components/simple-restaurant-map'
import { MapPin, Clock, Truck, Store, Map } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface ComerPageProps {
  searchParams?: {
    zone?: string
    type?: string
  }
}

// Datos mock de restaurantes con coordenadas - se reemplazará con datos de la DB
const mockRestaurants = [
  {
    id: '1',
    name: 'Pizzería El Buen Sabor',
    foodType: 'Pizza',
    zone: 'Centro',
    imageUrl: '/placeholder.jpg',
    isOpen: true,
    delivery: true,
    pickup: true,
    hours: '12:00 - 15:00, 19:00 - 23:00',
    latitude: -31.6333,
    longitude: -60.7000,
    address: 'San Martín 2500, Centro',
    whatsapp: '3425345678',
  },
  {
    id: '2',
    name: 'Restaurante La Esquina',
    foodType: 'Comida Casera',
    zone: 'Barrio Norte',
    imageUrl: '/placeholder.jpg',
    isOpen: true,
    delivery: true,
    pickup: true,
    hours: '12:00 - 15:00, 19:00 - 23:00',
    latitude: -31.6200,
    longitude: -60.7100,
    address: 'Av. Freyre 3200, Barrio Norte',
    whatsapp: '3425456789',
  },
  {
    id: '3',
    name: 'Sushi Bar Tokio',
    foodType: 'Sushi',
    zone: 'Centro',
    imageUrl: '/placeholder.jpg',
    isOpen: true,
    delivery: true,
    pickup: true,
    hours: '12:00 - 15:00, 19:00 - 23:00',
    latitude: -31.6350,
    longitude: -60.6950,
    address: '25 de Mayo 2800, Centro',
    whatsapp: '3425567890',
  },
  {
    id: '4',
    name: 'Parrilla Don Juan',
    foodType: 'Parrilla',
    zone: 'San Martín',
    imageUrl: '/placeholder.jpg',
    isOpen: true,
    delivery: false,
    pickup: true,
    hours: '12:00 - 15:00, 19:00 - 23:00',
    latitude: -31.6400,
    longitude: -60.6900,
    address: 'San Martín 1800, San Martín',
    whatsapp: '3425678901',
  },
  {
    id: '5',
    name: 'Café Central',
    foodType: 'Cafetería',
    zone: 'Centro',
    imageUrl: '/placeholder.jpg',
    isOpen: true,
    delivery: true,
    pickup: true,
    hours: '08:00 - 20:00',
    latitude: -31.6320,
    longitude: -60.7020,
    address: 'Rivadavia 2700, Centro',
    whatsapp: '3425789012',
  },
  {
    id: '6',
    name: 'Heladería La Italiana',
    foodType: 'Heladería',
    zone: 'Barrio Sur',
    imageUrl: '/placeholder.jpg',
    isOpen: true,
    delivery: true,
    pickup: true,
    hours: '10:00 - 22:00',
    latitude: -31.6450,
    longitude: -60.7050,
    address: 'Av. Belgrano 2100, Barrio Sur',
    whatsapp: '3425890123',
  },
]

export default async function ComerPage({ searchParams }: ComerPageProps) {
  // TypeScript: En Next.js 15+, searchParams puede ser una Promise
  // En JavaScript sería: const params = await searchParams
  // Resolvemos searchParams si es una Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams || {})
  const zoneParam = resolvedParams.zone || ''
  
  // Filtrar por zona si está seleccionada
  let restaurants = [...mockRestaurants]
  
  if (zoneParam && zoneParam !== 'all') {
    // Filtrar por zona cuando tengamos datos reales
    // Mapeo simple de zonas - se mejorará con datos de DB
    const zoneMap: Record<string, string> = {
      '1': 'Centro',
      '2': 'Barrio Sur',
      '3': 'Barrio Norte',
      '4': 'San Martín',
    }
    
    const zoneName = zoneMap[zoneParam] || zoneParam
    restaurants = restaurants.filter((r) => r.zone === zoneName)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Banner gastronomía - full ancho */}
        <div className="relative w-full h-[200px] md:h-[250px] lg:h-[300px] mb-8">
          <Image
            src="/banner_gastronomia.png"
            alt="Gastronomía - Qué comer cerca tuyo"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* Header de la página */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Qué comer hoy
            </h1>
            <p className="text-muted-foreground">
              Locales y restaurantes cerca tuyo
            </p>
          </div>

        {/* Mapa de restaurantes */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Dónde están los locales
            </h2>
          </div>
          <SimpleRestaurantMap
            restaurants={restaurants.map((r) => ({
              id: r.id,
              name: r.name,
              latitude: r.latitude,
              longitude: r.longitude,
              address: r.address,
            }))}
            center={{ lat: -31.6333, lng: -60.7000 }}
            zoom={13}
          />
        </section>

        {/* Secciones */}
        <div className="space-y-12">
          {/* Abierto ahora */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Abierto ahora
                </h2>
                <p className="text-sm text-muted-foreground">
                  Locales disponibles en este momento
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {restaurants
                .filter((r) => r.isOpen)
                .map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="group cursor-pointer border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Imagen */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {restaurant.isOpen && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">
                            Abierto
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-4 space-y-3">
                      {/* Zona - MUY VISIBLE */}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {restaurant.zone}
                        </span>
                      </div>

                      {/* Nombre del local */}
                      <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>

                      {/* Tipo de comida */}
                      <div>
                        <Badge variant="outline">{restaurant.foodType}</Badge>
                      </div>

                      {/* Horarios */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.hours}</span>
                      </div>

                      {/* Delivery / Retiro */}
                      <div className="flex items-center gap-3 text-sm">
                        {restaurant.delivery && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span>Delivery</span>
                          </div>
                        )}
                        {restaurant.pickup && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Store className="h-4 w-4" />
                            <span>Retiro</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        asChild
                      >
                        <a href={`https://wa.me/54${restaurant.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          Pedir por WhatsApp
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </section>

          {/* Cerca tuyo */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Cerca tuyo
                </h2>
                <p className="text-sm text-muted-foreground">
                  Locales en tu zona
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {restaurants.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="group cursor-pointer border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Imagen */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-3">
                    {/* Zona - MUY VISIBLE */}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {restaurant.zone}
                      </span>
                    </div>

                    {/* Nombre del local */}
                    <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>

                    {/* Tipo de comida */}
                    <div>
                      <Badge variant="outline">{restaurant.foodType}</Badge>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      asChild
                    >
                      <a href={`https://wa.me/54${restaurant.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        Pedir por WhatsApp
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

