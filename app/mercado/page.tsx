// Página de Mercado - Todo lo NO gastronómico
// TypeScript: Next.js App Router usa searchParams como prop
// En JavaScript esto sería: export default function MercadoPage({ searchParams }) { ... }

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { FiltersPanel } from '@/components/filters-panel'
import { SearchInput } from '@/components/search-input'
import { ChatbotActivator } from '@/components/chatbot-activator'
import { getListings, type ListingFilters } from '@/lib/db-queries'
import { type Listing } from '@/lib/mockListings'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, Store } from 'lucide-react'
import Image from 'next/image'

interface MercadoPageProps {
  searchParams?: {
    q?: string
    cat?: string
    zone?: string
    min?: string
    max?: string
    cond?: string
  }
}

export default async function MercadoPage({ searchParams }: MercadoPageProps) {
  // TypeScript: En Next.js 15+, searchParams puede ser una Promise
  // En JavaScript sería: const params = await searchParams
  // Resolvemos searchParams si es una Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams || {})
  
  // Convertimos los searchParams a filtros
  const filters: ListingFilters = {
    q: resolvedParams.q || undefined,
    category: resolvedParams.cat || undefined,
    zone: resolvedParams.zone || undefined,
    min: resolvedParams.min ? Number(resolvedParams.min) : undefined,
    max: resolvedParams.max ? Number(resolvedParams.max) : undefined,
    condition: (resolvedParams.cond as ListingFilters['condition']) || undefined,
  }

  // Obtener listings de la base de datos
  const filteredListings = await getListings(filters)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ChatbotActivator delay={2000} />
      <main className="flex-1">
        {/* Banner mercado - full ancho */}
        <div className="relative w-screen h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] mb-6 overflow-hidden -mx-4 sm:-mx-6 md:-mx-8">
          <Image
            src="/uploads/portada productos.jpg"
            alt="Mercado - Lo que se vende cerca tuyo"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* Header de la página */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-background rounded-2xl p-8 md:p-12 text-center border border-blue-500/20">
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                  <Store className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Mercado
                </h1>
                <p className="text-xl md:text-2xl text-foreground mb-3 font-semibold">
                  Encontrá lo que buscás cerca tuyo
                </p>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Conectate con gente real de tu zona. Comprá y vendé de forma directa, sin intermediarios.
                </p>
              </div>
            </div>
          </div>

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
              <FiltersPanel />
            </div>
          </aside>

          {/* Listado de publicaciones */}
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
                  <FiltersPanel />
                </SheetContent>
              </Sheet>
            </div>

            {/* Resultados */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredListings.length} {filteredListings.length === 1 ? 'publicación encontrada' : 'publicaciones encontradas'}
              </p>
            </div>

            {/* Grid de publicaciones */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  No se encontraron publicaciones
                </p>
                <p className="text-sm text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

