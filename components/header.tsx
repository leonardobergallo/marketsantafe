// Header del sitio con navegación principal
// TypeScript: este componente no recibe props
// En JavaScript sería similar pero sin tipos

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ZoneSelector } from "@/components/zone-selector"
import { UserMenu } from "@/components/user-menu"
import Image from "next/image"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 md:px-8 gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base sm:text-lg md:text-xl">M</span>
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 hidden sm:inline whitespace-nowrap">MarketSantaFe</span>
            <span className="text-lg font-bold text-orange-600 sm:hidden whitespace-nowrap">MSF</span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 max-w-xl mx-4 justify-center">
          <Link
            href="/mercado"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all whitespace-nowrap"
          >
            Mercado
          </Link>
          <Link
            href="/comer"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all whitespace-nowrap"
          >
            Gastronomía
          </Link>
          <Link
            href="/inmobiliaria-en-equipo"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all whitespace-nowrap"
          >
            Inmobiliaria
          </Link>
          <Link
            href="/publicar"
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all whitespace-nowrap"
          >
            Publicar
          </Link>
        </nav>

        {/* Selector de zona en header - Desktop */}
        <div className="hidden xl:flex items-center flex-shrink-0">
          <ZoneSelector />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Menú de usuario (incluye botones de login/registro o perfil) */}
          <UserMenu />
          
          {/* Menú mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden px-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menú de navegación</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-4">
                <Link
                  href="/mercado"
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-all"
                >
                  Mercado
                </Link>
                <Link
                  href="/comer"
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-all"
                >
                  Gastronomía
                </Link>
                <Link
                  href="/inmobiliaria-en-equipo"
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-all"
                >
                  Inmobiliaria
                </Link>
                <Link
                  href="/publicar"
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-all"
                >
                  Publicar
                </Link>
                <div className="pt-4 border-t">
                  <ZoneSelector />
                </div>
                <div className="pt-4 border-t">
                  <UserMenu />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
