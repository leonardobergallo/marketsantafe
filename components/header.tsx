// Header del sitio con navegación principal
// TypeScript: este componente no recibe props
// En JavaScript sería similar pero sin tipos

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 md:px-8 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">MarketSantaFe</span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center gap-6 flex-1 max-w-md mx-8">
          <Link
            href="/explorar"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Explorar
          </Link>
          <Link
            href="/publicar"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Publicar
          </Link>
          <Link
            href="/negocios"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Negocios
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3 sm:px-4"
          >
            <Link href="/publicar">
              <span className="hidden sm:inline">Publicar gratis</span>
              <span className="sm:hidden">Publicar</span>
            </Link>
          </Button>
          
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
                  href="/explorar"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  Explorar
                </Link>
                <Link
                  href="/publicar"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  Publicar
                </Link>
                <Link
                  href="/negocios"
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  Negocios
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
