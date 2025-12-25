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
import Image from 'next/image'
import Link from 'next/link'
import { InmobiliariaFiltersPanel } from '@/components/inmobiliaria-filters-panel'

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
        {/* Banner inmobiliaria */}
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[300px] lg:h-[380px] xl:h-[450px] 2xl:h-[520px] mb-6 sm:mb-8">
          <Image
            src="/banner_mercado.png"
            alt="Inmobiliaria en Equipo - Propiedades en Santa Fe"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Buscar Propiedades
              </h1>
            </div>
            <p className="text-muted-foreground">
              Encontrá la propiedad ideal en Santa Fe
            </p>
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
    </div>
  )
}

