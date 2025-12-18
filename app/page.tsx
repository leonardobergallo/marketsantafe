// Página principal (Home) del marketplace
// TypeScript: este componente no recibe props en Next.js App Router
// En JavaScript sería similar pero sin tipos

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { SearchBar } from "@/components/search-bar"
import { CategoryGrid } from "@/components/category-grid"
import { ListingCard } from "@/components/listing-card"
import { BusinessSection } from "@/components/business-section"
import { IndividualSection } from "@/components/individual-section"
import { Footer } from "@/components/footer"
import { getFeaturedListings } from "@/lib/mockListings"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  // Obtenemos las publicaciones destacadas (las primeras 8)
  const featuredListings = getFeaturedListings().slice(0, 8)

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero section con buscador */}
        <HeroSection />
        <SearchBar />
        
        {/* Categorías */}
        <CategoryGrid />
        
        {/* Publicaciones destacadas */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
              Publicaciones destacadas
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Los mejores productos y servicios de Santa Fe
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/explorar">
                Ver todas las publicaciones
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Sección para negocios */}
        <BusinessSection />
        
        {/* Sección para particulares */}
        <IndividualSection />
      </main>
      <Footer />
    </div>
  )
}
