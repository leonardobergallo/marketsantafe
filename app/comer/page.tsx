// Página de Gastronomía - Qué comer cerca, ahora
// TypeScript: Next.js App Router usa searchParams como prop
// En JavaScript esto sería: export default function ComerPage({ searchParams }) { ... }

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SimpleRestaurantMap } from '@/components/simple-restaurant-map'
import { MapPin, Clock, Truck, Store, Map, UtensilsCrossed } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { getRestaurants } from '@/lib/restaurant-queries'
import Image from 'next/image'
import Link from 'next/link'

interface ComerPageProps {
  searchParams?: {
    zone?: string
    type?: string
  }
}

export default async function ComerPage({ searchParams }: ComerPageProps) {
  // Resolvemos searchParams si es una Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams || {})
  const zoneParam = resolvedParams.zone || ''
  
  // Obtener restaurantes de la base de datos
  const restaurants = await getRestaurants({
    zone: zoneParam && zoneParam !== 'all' ? zoneParam : undefined,
    active: true,
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Banner gastronomía - full ancho */}
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[300px] lg:h-[380px] xl:h-[450px] 2xl:h-[520px] mb-6 sm:mb-8">
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
            restaurants={restaurants
              .filter((r) => r.latitude && r.longitude)
              .map((r) => ({
                id: r.id.toString(),
                name: r.name,
                latitude: r.latitude!,
                longitude: r.longitude!,
                address: r.address || '',
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
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="group border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Imagen */}
                    <Link href={`/restaurantes/${restaurant.id}`}>
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted cursor-pointer">
                        {restaurant.image_url ? (
                          <Image
                            src={restaurant.image_url}
                            alt={restaurant.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">
                            Abierto
                          </Badge>
                        </div>
                      </div>
                    </Link>

                    {/* Contenido */}
                    <div className="p-4 space-y-3">
                      {/* Zona - MUY VISIBLE */}
                      {restaurant.zone_name && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">
                            {restaurant.zone_name}
                          </span>
                        </div>
                      )}

                      {/* Nombre del local */}
                      <Link href={`/restaurantes/${restaurant.id}`}>
                        <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors cursor-pointer">
                          {restaurant.name}
                        </h3>
                      </Link>

                      {/* Tipo de comida */}
                      {restaurant.food_type && (
                        <div>
                          <Badge variant="outline">{restaurant.food_type}</Badge>
                        </div>
                      )}

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

                      {/* CTAs */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/restaurantes/${restaurant.id}`}>
                            Ver Menú
                          </Link>
                        </Button>
                        {restaurant.whatsapp && (
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            asChild
                          >
                            <a
                              href={`https://wa.me/54${restaurant.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No hay restaurantes disponibles en este momento
                  </p>
                </div>
              )}
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
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="group border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    {/* Imagen */}
                    <Link href={`/restaurantes/${restaurant.id}`}>
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted cursor-pointer">
                        {restaurant.image_url ? (
                          <Image
                            src={restaurant.image_url}
                            alt={restaurant.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Contenido */}
                    <div className="p-4 space-y-3">
                      {/* Zona - MUY VISIBLE */}
                      {restaurant.zone_name && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">
                            {restaurant.zone_name}
                          </span>
                        </div>
                      )}

                      {/* Nombre del local */}
                      <Link href={`/restaurantes/${restaurant.id}`}>
                        <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors cursor-pointer">
                          {restaurant.name}
                        </h3>
                      </Link>

                      {/* Tipo de comida */}
                      {restaurant.food_type && (
                        <div>
                          <Badge variant="outline">{restaurant.food_type}</Badge>
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/restaurantes/${restaurant.id}`}>
                            Ver Menú
                          </Link>
                        </Button>
                        {restaurant.whatsapp && (
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            asChild
                          >
                            <a
                              href={`https://wa.me/54${restaurant.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No hay restaurantes disponibles en esta zona
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

