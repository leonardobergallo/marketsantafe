import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-lg font-bold text-foreground">MarketSantaFe</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              El marketplace local de Santa Fe para comprar, vender y alquilar.
            </p>
            <div className="flex gap-3">
              <Link
                href="#"
                className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
              >
                <Facebook className="h-4 w-4 text-foreground" />
              </Link>
              <Link
                href="#"
                className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
              >
                <Instagram className="h-4 w-4 text-foreground" />
              </Link>
              <Link
                href="#"
                className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-accent transition-colors"
              >
                <Twitter className="h-4 w-4 text-foreground" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Alquileres
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Inmuebles
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Vehículos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Tecnología
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Cómo publicar
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Reglas de publicación
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Consejos de seguridad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} MarketSantaFe. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
