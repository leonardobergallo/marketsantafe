// Página de explorar/listado de publicaciones con filtros
// TypeScript: Next.js App Router usa searchParams como prop
// En JavaScript esto sería: export default function ExplorarPage({ searchParams }) { ... }

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { FiltersPanel } from '@/components/filters-panel'
import { SearchInput } from '@/components/search-input'
import { getListings, type ListingFilters } from '@/lib/db-queries'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Filter } from 'lucide-react'

interface ExplorarPageProps {
  searchParams?: {
    q?: string
    cat?: string
    zone?: string
    min?: string
    max?: string
    cond?: string
  }
}

export default async function ExplorarPage({ searchParams }: ExplorarPageProps) {
  // TypeScript: En Next.js 15+, searchParams puede ser una Promise
  // En JavaScript sería: const params = await searchParams
  // Resolvemos searchParams si es una Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams || {})
  
  // Convertimos los searchParams a filtros para la función getListings
  // TypeScript: necesitamos convertir los strings a números para min/max
  const filters: ListingFilters = {
    q: resolvedParams.q,
    category: resolvedParams.cat,
    zone: resolvedParams.zone,
    min: resolvedParams.min ? Number(resolvedParams.min) : undefined,
    max: resolvedParams.max ? Number(resolvedParams.max) : undefined,
    condition: resolvedParams.cond as ListingFilters['condition'],
  }

  // Obtener listings de la base de datos con los filtros aplicados
  const filteredListings = await getListings(filters)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
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
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
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
      </main>
      <Footer />
    </div>
  )
}

