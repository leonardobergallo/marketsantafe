// Página dedicada para Inmobiliaria en Equipo
// URL: /inmobiliaria-en-equipo
// Esta página tiene el chatbot integrado y está enfocada en propiedades (alquileres, ventas, etc.)

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { ChatbotErrorHandler } from '@/components/chatbot-error-handler'
import Script from 'next/script'
import { Home, Building2, MapPin, Search, Phone, Mail, LandPlot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getListings, type ListingFilters } from '@/lib/db-queries'
import { getListingById } from '@/lib/db-queries'

export const metadata: Metadata = {
  title: 'Inmobiliaria en Equipo - Alquileres y Ventas en Santa Fe',
  description: 'Encontrá tu propiedad ideal en Santa Fe. Alquileres, ventas y asesoramiento inmobiliario con asistente virtual.',
}

export default async function InmobiliariaEnEquipoPage() {
  // Obtener propiedades de inmobiliaria (alquileres e inmuebles)
  const filters: ListingFilters = {
    category: '1', // Alquileres
  }
  
  const alquileres = await getListings(filters)
  
  const filtersInmuebles: ListingFilters = {
    category: '2', // Inmuebles
  }
  
  const inmuebles = await getListings(filtersInmuebles)
  
  // Combinar y asegurar que el listing 85 esté incluido
  let allProperties = [...alquileres, ...inmuebles]
  
  // Obtener el listing 85 específicamente
  const listing85 = await getListingById('85')
  if (listing85) {
    // Convertir a formato Listing básico
    const listing85Basic = {
      id: listing85.id,
      title: listing85.title,
      price: listing85.price,
      categoryId: listing85.categoryId,
      zoneId: listing85.zoneId,
      condition: listing85.condition,
      description: listing85.description,
      imageUrl: listing85.imageUrl,
      images: listing85.images,
      createdAt: listing85.createdAt,
      whatsapp: listing85.whatsapp,
      phone: listing85.phone,
      featured: listing85.featured,
      views: listing85.views,
      active: listing85.active,
      currency: listing85.currency,
    }
    
    if (!allProperties.find(p => p.id === '85')) {
      allProperties.unshift(listing85Basic)
    }
  }
  
  // Remover duplicados
  const uniqueProperties = allProperties.filter((listing, index, self) =>
    index === self.findIndex((l) => l.id === listing.id)
  )
  
  // Ordenar: featured primero, luego por fecha
  const sortedProperties = uniqueProperties.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  
  // Separar el listing 85 para destacarlo
  const featuredListing = sortedProperties.find(l => l.id === '85') || sortedProperties[0]
  const otherProperties = sortedProperties.filter(l => l.id !== '85').slice(0, 5)
  return (
    <>
      <div className="min-h-screen">
        <Header />
        <main>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                  Inmobiliaria en Equipo
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Tu asistente virtual para encontrar la propiedad ideal en Santa Fe
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/inmobiliaria-en-equipo/buscar">
                      Buscar Propiedades
                      <Search className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/inmobiliaria-en-equipo/publicar">
                      Publicar Propiedad
                      <Building2 className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Propiedades Destacadas */}
          <section id="propiedades" className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Propiedades Destacadas
                </h2>
                <p className="text-muted-foreground text-lg">
                  Encontrá la propiedad ideal para vos
                </p>
              </div>

              {/* Propiedad Destacada (Listing 85 o primera disponible) */}
              {featuredListing && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                  <div className="lg:col-span-2">
                    <ListingCard listing={featuredListing} />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <LandPlot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Información</h3>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Categoría</p>
                          <p className="text-sm font-medium">{featuredListing.categoryId === '1' ? 'Alquiler' : 'Venta'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Condición</p>
                          <p className="text-sm font-medium capitalize">{featuredListing.condition || 'N/A'}</p>
                        </div>
                        {featuredListing.price > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Precio</p>
                            <p className="text-lg font-bold text-primary">
                              ${featuredListing.price.toLocaleString('es-AR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button asChild className="w-full" size="lg">
                        <Link href={`/aviso/${featuredListing.id}`}>
                          Ver Detalles
                          <Search className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/inmobiliaria-en-equipo/buscar">
                          Ver Todas
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Más Propiedades */}
              {otherProperties.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Más Propiedades</h3>
                    <p className="text-muted-foreground">Explorá otras opciones disponibles</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {otherProperties.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <Button asChild size="lg" variant="outline">
                      <Link href="/inmobiliaria-en-equipo/buscar">
                        Ver Todas las Propiedades
                        <Search className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {sortedProperties.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No hay propiedades disponibles en este momento.</p>
                  <Button asChild>
                    <Link href="/publicar">Publicar una Propiedad</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Servicios */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Nuestros Servicios
                </h2>
                <p className="text-muted-foreground text-lg">
                  Te ayudamos a encontrar o vender tu propiedad
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* Alquileres */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Alquileres</h3>
                  <p className="text-muted-foreground">
                    Encontrá el departamento o casa que buscás para alquilar en Santa Fe
                  </p>
                </div>

                {/* Ventas */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ventas</h3>
                  <p className="text-muted-foreground">
                    Comprá tu propiedad ideal o vendé la tuya con nuestro asesoramiento
                  </p>
                </div>

                {/* Asesoramiento */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Asesoramiento</h3>
                  <p className="text-muted-foreground">
                    Consultá con nuestro asistente virtual sobre propiedades, zonas y más
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Chatbot */}
          <section className="py-16 md:py-20 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-card border border-border rounded-lg p-8 md:p-12">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    ¿Buscás una propiedad?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Nuestro asistente virtual está disponible 24/7 para ayudarte a encontrar
                    lo que buscás. Hacé clic en el botón de chat en la esquina inferior derecha
                    y empezá a buscar.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link href="/inmobiliaria-en-equipo/buscar">
                        Buscar Propiedades
                        <Search className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/inmobiliaria-en-equipo/publicar">
                        Publicar mi Propiedad
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section id="contacto" className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Contactanos
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  ¿Tenés dudas? Nuestro asistente virtual está disponible para ayudarte,
                  o podés contactarnos directamente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" size="lg" asChild>
                    <Link href="mailto:contacto@marketsantafe.com">
                      <Mail className="mr-2 h-5 w-5" />
                      Email
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="tel:+543425000000">
                      <Phone className="mr-2 h-5 w-5" />
                      Llamar
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      {/* Handler para silenciar errores del chatbot */}
      <ChatbotErrorHandler />

      {/* Chatbot Widget - Solo en esta página */}
      {/* Configuración del chatbot ANTES de cargar el widget */}
      <Script id="chatbot-config" strategy="beforeInteractive">
        {`(function() {
          // Configurar la URL del servidor ANTES de cargar el widget (según documentación)
          // Usamos rutas proxy locales en lugar del servidor externo
          window.INMOBILIARIA_CHATBOT_API = window.location.origin;
          
          // Interceptar fetch para redirigir peticiones al servidor externo hacia proxy local
          // Esto DEBE estar antes de que el widget se cargue
          if (!window.__chatbotFetchIntercepted) {
            window.__chatbotFetchIntercepted = true;
            
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
              const url = args[0];
              if (typeof url === 'string' && url.includes('inmobiliariaenquipo.vercel.app')) {
                // Reemplazar URL externa con ruta proxy local
                const proxyUrl = url.replace(
                  'https://inmobiliariaenquipo.vercel.app',
                  window.location.origin
                );
                console.log('🔄 [Chatbot] Interceptando fetch:', url, '→', proxyUrl);
                const newArgs = [proxyUrl, ...Array.from(args).slice(1)];
                return originalFetch.apply(this, newArgs);
              }
              return originalFetch.apply(this, args);
            };
            
            // También interceptar XMLHttpRequest
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...rest) {
              if (typeof url === 'string' && url.includes('inmobiliariaenquipo.vercel.app')) {
                const proxyUrl = url.replace(
                  'https://inmobiliariaenquipo.vercel.app',
                  window.location.origin
                );
                console.log('🔄 [Chatbot] Interceptando XHR:', url, '→', proxyUrl);
                return originalXHROpen.call(this, method, proxyUrl, ...rest);
              }
              return originalXHROpen.call(this, method, url, ...rest);
            };
            
            console.log('✅ [Chatbot] Interceptor instalado correctamente');
          }
        })();`}
      </Script>
      <Script
        id="chatbot-widget-script"
        src="https://inmobiliariaenquipo.vercel.app/chatbot-widget.js"
        strategy="afterInteractive"
      />
    </>
  )
}

