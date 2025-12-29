// Página de planes y tarifas
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubscribeButton } from '@/components/subscribe-button'
import { Check, X, Store, User, Home, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PlanesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Planes y Tarifas
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Elegí el plan que mejor se adapte a tus necesidades. Publicá gratis o potenciá tus ventas con nuestros planes premium.
              </p>
            </div>
          </div>
        </section>

        {/* Planes para Usuarios Individuales */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Para Usuarios Individuales
                </h2>
              </div>
              <p className="text-lg text-muted-foreground">
                Perfecto para particulares que quieren vender o alquilar
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Plan Gratis */}
              <Card className="p-6 border-2 relative">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Gratis</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$0</span>
                    <span className="text-muted-foreground">/siempre</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Para empezar</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Hasta 5 publicaciones activas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Publicar productos y servicios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Publicar propiedades (gratis)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Contacto directo con compradores</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Sin destacados</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href="/registro">Registrarse gratis</Link>
                </Button>
              </Card>

              {/* Plan Individual Premium */}
              <Card className="p-6 border-2 border-primary relative">
                <Badge className="absolute top-4 right-4" variant="default">
                  Popular
                </Badge>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Individual Premium</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$4.999</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Para vendedores activos</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Publicaciones ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Destacado en búsquedas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Estadísticas de visitas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Soporte prioritario</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Renovación automática de publicaciones</span>
                  </li>
                </ul>
                <SubscribeButton planType="individual-premium" className="w-full" size="lg">
                  Comenzar ahora
                </SubscribeButton>
              </Card>

              {/* Plan Propiedades Premium */}
              <Card className="p-6 border-2 relative">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground">Propiedades Premium</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$9.999</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Para propiedades</p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Hasta 10 propiedades activas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Destacado en búsquedas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Estadísticas detalladas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Soporte prioritario</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Sin servicio profesional incluido</span>
                  </li>
                </ul>
                <SubscribeButton planType="properties-premium" variant="outline" className="w-full" size="lg">
                  Comenzar ahora
                </SubscribeButton>
              </Card>
            </div>
          </div>
        </section>

        {/* Planes para Negocios */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Store className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Para Negocios
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  Potenciá tu negocio con herramientas profesionales
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Plan Negocio Básico */}
                <Card className="p-8 border-2">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Negocio Básico</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">$9.999</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Para pequeños negocios</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Tienda online personalizada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Hasta 50 productos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Panel de control básico</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Estadísticas básicas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Soporte por email</span>
                    </li>
                  </ul>
                  <SubscribeButton planType="business-basic" variant="outline" className="w-full" size="lg">
                    Empezar ahora
                  </SubscribeButton>
                </Card>

                {/* Plan Negocio Pro */}
                <Card className="p-8 border-2 border-primary relative">
                  <Badge className="absolute top-4 right-4" variant="default">
                    Más Popular
                  </Badge>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Negocio Pro</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">$19.999</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Para negocios en crecimiento</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Todo del plan Básico</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Productos ilimitados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Estadísticas avanzadas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Destacado en búsquedas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Soporte prioritario</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Gestión de inventario</span>
                    </li>
                  </ul>
                  <SubscribeButton planType="business-pro" className="w-full" size="lg">
                    Comenzar ahora
                  </SubscribeButton>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Servicio Profesional Inmobiliario */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Servicio Profesional Inmobiliario
                </h2>
              </div>
              <p className="text-lg text-muted-foreground">
                Servicio completo para maximizar la venta o alquiler de tu propiedad
              </p>
            </div>

            <Card className="p-8 border-2 border-primary">
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-foreground">Consultar</span>
                </div>
                <p className="text-lg text-muted-foreground">
                  Precio personalizado según las características de tu propiedad
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Incluye:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tasación profesional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Fotos profesionales y 360°</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Publicación multiplataforma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Coordinación de visitas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Asesoramiento legal</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Beneficios:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Mayor visibilidad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Venta/alquiler más rápido</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Soporte continuo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Chatbot 24/7</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Reportes periódicos</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/servicio-profesional-inmobiliario">
                    Ver más detalles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/inmobiliaria-en-equipo/publicar">
                    Solicitar cotización
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Formas de Pago */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Formas de Pago
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Aceptamos múltiples métodos de pago para tu comodidad
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">💳</div>
                  <p className="text-sm font-medium">Tarjeta de Crédito</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">🏦</div>
                  <p className="text-sm font-medium">Transferencia</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <p className="text-sm font-medium">Mercado Pago</p>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-sm font-medium">WhatsApp</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿No estás seguro qué plan elegir?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contactanos y te ayudamos a encontrar el plan perfecto para vos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/registro">Registrarse gratis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://wa.me/5493425123456" target="_blank" rel="noopener noreferrer">
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

