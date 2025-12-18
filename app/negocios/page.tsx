// Página de planes para negocios
// TypeScript: esta es una página estática sin props
// En JavaScript sería similar pero sin tipos

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Store, TrendingUp, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function NegociosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6" variant="secondary">
                <Store className="h-4 w-4 mr-2" />
                Para negocios
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Tu tienda online en <span className="text-primary">MarketSantaFe</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Llegá a miles de clientes locales sin complicaciones. Panel de control, gestión de inventario y más.
              </p>
            </div>
          </div>
        </section>

        {/* Planes */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Plan Básico */}
              <Card className="p-8 border-2">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Plan Básico</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$0</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Perfecto para empezar</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Hasta 10 publicaciones</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Panel de control básico</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Soporte por email</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" size="lg">
                  Empezar gratis
                </Button>
              </Card>

              {/* Plan Pro */}
              <Card className="p-8 border-2 border-primary relative">
                <Badge className="absolute top-4 right-4" variant="default">
                  Popular
                </Badge>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Plan Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$9.999</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Para negocios en crecimiento</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Publicaciones ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Panel avanzado con estadísticas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Destacado en búsquedas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Soporte prioritario</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Gestión de inventario</span>
                  </li>
                </ul>
                <Button className="w-full" size="lg">
                  Ver planes
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Todo lo que necesitás para vender online
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Mayor visibilidad</h3>
                  <p className="text-sm text-muted-foreground">
                    Aparecé primero en las búsquedas y llegá a más clientes
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Estadísticas en tiempo real</h3>
                  <p className="text-sm text-muted-foreground">
                    Seguí tus ventas, visitas y conversiones desde tu panel
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Base de clientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Accedé a más de 15,000 usuarios activos en Santa Fe
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Creá tu tienda en minutos y comenzá a vender hoy mismo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/publicar">Crear mi tienda</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explorar">Ver ejemplos</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

