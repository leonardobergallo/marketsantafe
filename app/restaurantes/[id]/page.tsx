// Página de detalle de restaurante con menú
// URL: /restaurantes/[id]

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRestaurantById } from '@/lib/restaurant-queries'
import { getCurrentUser } from '@/lib/auth'
import { MapPin, Clock, Truck, Store, Phone, UtensilsCrossed, Edit, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface RestaurantPageProps {
  params: Promise<{ id: string }>
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const resolvedParams = await params
  const restaurantId = parseInt(resolvedParams.id)

  if (isNaN(restaurantId)) {
    notFound()
  }

  const restaurant = await getRestaurantById(restaurantId)
  const user = await getCurrentUser()

  if (!restaurant) {
    notFound()
  }

  const isOwner = user && user.id === restaurant.user_id

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (time: string | null) => {
    if (!time) return ''
    return time.substring(0, 5) // HH:MM
  }

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Imagen del restaurante */}
        {restaurant.image_url && (
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
            <Image
              src={restaurant.image_url}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
            {isOwner && (
              <div className="absolute top-4 right-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/restaurantes/${restaurantId}/menu`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Gestionar Menú
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
          <div className="mb-6">
            <Link
              href="/comer"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a restaurantes
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Columna principal - Menú */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información básica */}
              <Card>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {restaurant.name}
                      </h1>
                      {restaurant.food_type && (
                        <Badge variant="outline" className="mb-2">
                          {restaurant.food_type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {restaurant.description && (
                    <p className="text-muted-foreground mb-4">
                      {restaurant.description}
                    </p>
                  )}

                  {/* Ubicación */}
                  {restaurant.zone_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">{restaurant.zone_name}</span>
                      {restaurant.address && <span>• {restaurant.address}</span>}
                    </div>
                  )}

                  {/* Delivery / Retiro */}
                  <div className="flex items-center gap-4 mb-4">
                    {restaurant.delivery && (
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span>Delivery</span>
                      </div>
                    )}
                    {restaurant.pickup && (
                      <div className="flex items-center gap-2 text-sm">
                        <Store className="h-4 w-4 text-green-600" />
                        <span>Retiro en local</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Menú */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Menú</h2>
                  </div>

                  {restaurant.menu_items && restaurant.menu_items.length > 0 ? (
                    <div className="space-y-4">
                      {restaurant.menu_items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex gap-4 p-4 rounded-lg border ${
                            !item.available ? 'opacity-60' : ''
                          }`}
                        >
                          {item.image_url && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <span className="text-lg font-bold text-primary flex-shrink-0">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.description}
                              </p>
                            )}
                            {!item.available && (
                              <Badge variant="secondary" className="text-xs">
                                No disponible
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Este restaurante aún no tiene menú disponible
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Columna lateral - Información de contacto */}
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold mb-4">Contacto</h3>
                  <div className="space-y-3">
                    {restaurant.whatsapp && (
                      <Button
                        asChild
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <a
                          href={`https://wa.me/54${restaurant.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    {restaurant.phone && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <a
                          href={`tel:${restaurant.phone}`}
                          className="ml-2 text-foreground hover:text-primary"
                        >
                          {restaurant.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Horarios */}
              {restaurant.hours && restaurant.hours.length > 0 && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Horarios</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      {restaurant.hours.map((hour) => (
                        <div key={hour.id} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {daysOfWeek[hour.day_of_week]}
                          </span>
                          {hour.is_closed ? (
                            <span className="text-muted-foreground">Cerrado</span>
                          ) : (
                            <span>
                              {formatTime(hour.open_time)} - {formatTime(hour.close_time)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Botón para gestionar menú (solo para dueño) */}
              {isOwner && (
                <Card>
                  <div className="p-6">
                    <Button asChild className="w-full">
                      <Link href={`/restaurantes/${restaurantId}/menu`}>
                        <UtensilsCrossed className="h-4 w-4 mr-2" />
                        Gestionar Menú
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

