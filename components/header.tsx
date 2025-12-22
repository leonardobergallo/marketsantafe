// Header del sitio con navegación principal
// TypeScript: este componente no recibe props
// En JavaScript sería similar pero sin tipos

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ZoneSelector } from "@/components/zone-selector"
import { UserMenu } from "@/components/user-menu"
import Image from "next/image"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 md:px-8 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base md:text-lg">M</span>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">MarketSantaFe</span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 max-w-md mx-8">
          <Link
            href="/mercado"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Mercado
          </Link>
          <Link
            href="/comer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Gastronomía
          </Link>
          <Link
            href="/publicar"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Publicar
          </Link>
        </nav>

        {/* Selector de zona en header */}
        <div className="hidden lg:flex items-center">
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
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/mercado"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  Mercado
                </Link>
                <Link
                  href="/comer"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  Gastronomía
                </Link>
                <Link
                  href="/publicar"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
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
