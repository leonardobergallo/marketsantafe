// Página principal (HOME) - HUB del marketplace
// TypeScript: este componente no recibe props en Next.js App Router
// En JavaScript sería similar pero sin tipos

import { Header } from '@/components/header'
import { HubHero } from '@/components/hub-hero'
import { Footer } from '@/components/footer'
import { ListingCard } from '@/components/listing-card'
import { CategoryGrid } from '@/components/category-grid'
import { BusinessSection } from '@/components/business-section'
import { getListings, type ListingFilters } from '@/lib/db-queries'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HomeProps {
  searchParams?: {
    zone?: string
  }
}

export default async function Home({ searchParams }: HomeProps) {
  // Resolver searchParams si es una Promise
  const resolvedParams = searchParams instanceof Promise ? await searchParams : (searchParams || {})
  
  // Obtener listings destacados con filtro de zona si existe
  const filters: ListingFilters = {
    zone: resolvedParams.zone || undefined,
  }
  
  const allListings = await getListings(filters)
  // Obtener las primeras 6 publicaciones (priorizando destacadas)
  const featuredListings = allListings.slice(0, 6)

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero HUB */}
        <HubHero />

        {/* Lo que se vende en tu zona */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                Lo que se vende en tu zona
              </h2>
              <p className="text-muted-foreground">
                Publicaciones cercanas a vos
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/mercado">
                Ver todo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="text-center sm:hidden">
            <Button asChild variant="outline" size="lg">
              <Link href="/mercado">
                Ver todo el mercado
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Qué comer cerca tuyo - Oculto para segunda etapa */}
        {/* <section className="bg-muted/30 py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />
                  Qué comer cerca tuyo
                </h2>
                <p className="text-muted-foreground">
                  Locales y restaurantes de tu zona
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:flex">
                <Link href="/comer">
                  Ver todo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Próximamente: restaurantes y locales gastronómicos
                </p>
              </div>
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button asChild variant="outline" size="lg">
                <Link href="/comer">
                  Ver gastronomía
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section> */}

        {/* Categorías del Mercado */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Explorá por categoría
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Encontrá lo que necesitás en Santa Fe
            </p>
          </div>
          <CategoryGrid />
        </section>

        {/* Sección para negocios */}
        <BusinessSection />
      </main>
      <Footer />
    </div>
  )
}
