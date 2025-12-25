// Hero del HUB principal - Home
// TypeScript: Client Component con navegación
// En JavaScript sería similar pero sin tipos

'use client'

import { Button } from '@/components/ui/button'
import { ZoneSelector } from '@/components/zone-selector'
import { ShoppingBag, UtensilsCrossed, Building2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HubHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Banner hero - altura fija para web, responsive en móvil */}
      <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
        <Image
          src="/banner_hero.png"
          alt="MarketSantaFe - Comprá, vendé y comé cerca tuyo"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Contenido debajo del banner */}
      <div className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Título principal */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight">
                Comprá, vendé y comé{' '}
                <span className="text-primary">cerca tuyo</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Marketplace local de Santa Fe
              </p>
            </div>

            {/* Selector de zona */}
            <div className="flex justify-center items-center gap-3 py-4">
              <span className="text-sm text-muted-foreground">📍</span>
              <ZoneSelector />
            </div>

            {/* CTAs principales */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center pt-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto flex-1 sm:flex-none"
              >
                <Link href="/mercado" className="flex items-center justify-center gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  Ver mercado
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold transition-all w-full sm:w-auto flex-1 sm:flex-none"
              >
                <Link href="/comer" className="flex items-center justify-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5" />
                  Qué comer hoy
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold transition-all w-full sm:w-auto flex-1 sm:flex-none"
              >
                <Link href="/inmobiliaria-en-equipo" className="flex items-center justify-center gap-2">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Inmobiliaria
                </Link>
              </Button>
            </div>

            {/* Texto de apoyo */}
            <p className="text-sm text-muted-foreground pt-4">
              Gente real de Santa Fe • Publicá fácil, vendé directo
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
