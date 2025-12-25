// Página de búsqueda completa para inmobiliaria
// URL: /inmobiliaria-en-equipo/buscar

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { SearchInput } from '@/components/search-input'
import { getListings, type ListingFilters } from '@/lib/db-queries'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Filter, Building2 } from 'lucide-react'
import Link from 'next/link'
import { InmobiliariaFiltersPanel } from '@/components/inmobiliaria-filters-panel'
import { ChatbotErrorHandler } from '@/components/chatbot-error-handler'
import Script from 'next/script'

interface BuscarInmobiliariaPageProps {
  searchParams?: {
    q?: string
    tipo?: string // alquiler, venta, terreno
    zone?: string
    min?: string
    max?: string
  }
}

export default async function BuscarInmobiliariaPage({ searchParams }: BuscarInmobiliariaPageProps) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams || {})
  
  // Convertir tipo de propiedad a categoría
  let categoryId: string | undefined
  if (resolvedParams.tipo === 'alquiler') {
    categoryId = '1'
  } else if (resolvedParams.tipo === 'venta' || resolvedParams.tipo === 'terreno') {
    categoryId = '2'
  }
  
  const filters: ListingFilters = {
    q: resolvedParams.q || undefined,
    category: categoryId,
    zone: resolvedParams.zone || undefined,
    min: resolvedParams.min ? Number(resolvedParams.min) : undefined,
    max: resolvedParams.max ? Number(resolvedParams.max) : undefined,
  }

  // Obtener propiedades inmobiliarias con filtros aplicados
  // SIEMPRE filtrar solo categorías 1 (Alquileres) y 2 (Inmuebles)
  let filteredListings: any[] = []
  
  if (categoryId) {
    // Si hay tipo específico, solo obtener esa categoría
    filteredListings = await getListings(filters)
  } else {
    // Obtener ambas categorías (alquileres e inmuebles) - SIEMPRE solo estas dos
    const alquileres = await getListings({ ...filters, category: '1' })
    const inmuebles = await getListings({ ...filters, category: '2' })
    filteredListings = [...alquileres, ...inmuebles]
    
    // Remover duplicados por ID
    const uniqueIds = new Set()
    filteredListings = filteredListings.filter(l => {
      if (uniqueIds.has(l.id)) return false
      uniqueIds.add(l.id)
      return true
    })
  }
  
  // Asegurar que SOLO sean propiedades inmobiliarias (categorías 1 o 2)
  filteredListings = filteredListings.filter((listing: any) => {
    const catId = listing.categoryId || listing.category_id
    return catId === '1' || catId === '2' || catId === 1 || catId === 2
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section con texto - Solo para búsqueda */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-16 mb-6 sm:mb-8">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 mb-4 md:mb-6">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4">
                Buscar Propiedades
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Encontrá tu propiedad ideal en Santa Fe
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* Buscador principal */}
          <div className="mb-6">
            <div className="max-w-2xl mx-auto">
              <SearchInput />
            </div>
          </div>

          <div className="flex gap-6">
            {/* Panel de filtros - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <InmobiliariaFiltersPanel />
              </div>
            </aside>

            {/* Listado de propiedades */}
            <div className="flex-1">
              {/* Botón de filtros - Mobile */}
              <div className="lg:hidden mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <InmobiliariaFiltersPanel />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Resultados */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredListings.length} {filteredListings.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/inmobiliaria-en-equipo/publicar">
                    Publicar Propiedad
                  </Link>
                </Button>
              </div>

              {/* Grid de propiedades */}
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground mb-4">
                    No se encontraron propiedades
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                  <Button asChild>
                    <Link href="/inmobiliaria-en-equipo/publicar">
                      Publicar Primera Propiedad
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Handler para silenciar errores del chatbot */}
      <ChatbotErrorHandler />

      {/* Chatbot Widget - Cargar en todas las páginas de inmobiliaria */}
      <Script id="chatbot-config" strategy="beforeInteractive">
        {`(function() {
          // Configurar la URL del servidor ANTES de cargar el widget
          window.INMOBILIARIA_CHATBOT_API = window.location.origin;
          
          // Interceptar fetch para redirigir peticiones al servidor externo hacia proxy local
          if (!window.__chatbotFetchIntercepted) {
            window.__chatbotFetchIntercepted = true;
            
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
              const url = args[0];
              if (typeof url === 'string' && url.includes('inmobiliariaenquipo.vercel.app')) {
                const proxyUrl = url.replace(
                  'https://inmobiliariaenquipo.vercel.app',
                  window.location.origin
                );
                const newArgs = [proxyUrl, ...Array.from(args).slice(1)];
                return originalFetch.apply(this, newArgs);
              }
              return originalFetch.apply(this, args);
            };
            
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...rest) {
              if (typeof url === 'string' && url.includes('inmobiliariaenquipo.vercel.app')) {
                const proxyUrl = url.replace(
                  'https://inmobiliariaenquipo.vercel.app',
                  window.location.origin
                );
                return originalXHROpen.call(this, method, proxyUrl, ...rest);
              }
              return originalXHROpen.call(this, method, url, ...rest);
            };
          }
        })();`}
      </Script>
      <Script
        id="chatbot-widget-script"
        src="https://inmobiliariaenquipo.vercel.app/chatbot-widget.js"
        strategy="afterInteractive"
      />
    </div>
  )
}

