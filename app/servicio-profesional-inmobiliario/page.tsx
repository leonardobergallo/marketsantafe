// Página pública informativa sobre el Servicio Profesional Inmobiliario
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  DollarSign, 
  Home, 
  Camera, 
  Globe, 
  Calendar, 
  FileText, 
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

export default function ServicioProfesionalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Servicio Profesional Inmobiliario
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Maximizá las oportunidades de venta o alquiler de tu propiedad con nuestro servicio completo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/inmobiliaria-en-equipo/publicar">
                    Publicar con Servicio Profesional
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/propiedades">
                    Ver Propiedades
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios Incluidos */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Qué incluye el servicio?
            </h2>
            <p className="text-lg text-muted-foreground">
              Un servicio completo para que tu propiedad destaque y se venda o alquile más rápido
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Tasación y Precio */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Tasación y Asesoramiento en Precio
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Tasación profesional basada en análisis de mercado actualizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Comparativa de precios con propiedades similares en la zona</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Estrategia de precio optimizada para venta rápida o máximo rendimiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Asesoramiento continuo para ajustar precio según demanda del mercado</span>
                </li>
              </ul>
            </Card>

            {/* Fotografía Profesional */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Fotografía Profesional y Marketing
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Sesión fotográfica profesional con equipo especializado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Recorrido virtual 360° para explorar la propiedad desde cualquier lugar</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Edición profesional de imágenes para destacar los mejores espacios</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Video promocional de alta calidad para redes sociales y portales</span>
                </li>
              </ul>
            </Card>

            {/* Publicación Multiplataforma */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Publicación Multiplataforma
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Publicación destacada en MarketSantaFe con mayor visibilidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Portales inmobiliarios aliados (Zonaprop, Argenprop, MercadoLibre Inmuebles)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Redes sociales (Instagram, Facebook) con campañas dirigidas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>SEO optimizado para que tu propiedad aparezca en búsquedas</span>
                </li>
              </ul>
            </Card>

            {/* Coordinación de Visitas */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Coordinación de Visitas y Gestión
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Agenda de visitas coordinada según tu disponibilidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Preselección de interesados verificando capacidad económica y seriedad</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Acompañamiento en visitas por parte de nuestro equipo profesional</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Gestión de consultas y seguimiento personalizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Negociación asistida para obtener las mejores condiciones</span>
                </li>
              </ul>
            </Card>

            {/* Asesoramiento Legal */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Asesoramiento Legal y Documentación
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Revisión de documentación (título, escritura, boletos, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Asesoramiento legal en contratos y cláusulas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Verificación de habilitaciones y estado de deudas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Coordinación con escribanos y gestores para la operación</span>
                </li>
              </ul>
            </Card>

            {/* Soporte Continuo */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Soporte y Seguimiento Continuo
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Chatbot 24/7 para consultas inmediatas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>WhatsApp directo con tu asesor inmobiliario</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Reportes periódicos de visitas, consultas y estadísticas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Reuniones de seguimiento para ajustar estrategia según resultados</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Precios y Comisiones */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Precios y Comisiones
              </h2>
              <p className="text-lg text-muted-foreground">
                Modelo tradicional: Pagás solo cuando se concreta la operación
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Venta */}
              <Card className="p-6 text-center border-2 border-primary/30">
                <Home className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Venta</h3>
                <div className="text-3xl font-bold text-primary mb-2">3%</div>
                <p className="text-sm text-muted-foreground mb-4">
                  del valor de venta
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Sin pago inicial</p>
                  <p>✅ Se paga al concretar</p>
                  <p>✅ Incluye todos los servicios</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Ejemplo: $50M → Comisión $1.5M
                  </p>
                </div>
              </Card>

              {/* Alquiler */}
              <Card className="p-6 text-center border-2 border-primary/30">
                <Calendar className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Alquiler</h3>
                <div className="text-3xl font-bold text-primary mb-2">1 mes</div>
                <p className="text-sm text-muted-foreground mb-4">
                  de alquiler
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Sin pago inicial</p>
                  <p>✅ Se paga al firmar</p>
                  <p>✅ Incluye todos los servicios</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Ejemplo: $200k/mes → Comisión $200k
                  </p>
                </div>
              </Card>

              {/* Alquiler Temporal */}
              <Card className="p-6 text-center border-2 border-primary/30">
                <Calendar className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Temporal</h3>
                <div className="text-3xl font-bold text-primary mb-2">15%</div>
                <p className="text-sm text-muted-foreground mb-4">
                  del contrato total
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✅ Sin pago inicial</p>
                  <p>✅ Se paga al concretar</p>
                  <p>✅ Incluye todos los servicios</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Ejemplo: $500k → Comisión $75k
                  </p>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-background/80 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Cómo funciona el pago?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Publicación es GRATIS</strong> - Podés publicar tu propiedad sin costo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Servicio profesional SIN pago inicial</strong> - No pagás nada hasta concretar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Comisión al concretar</strong> - Pagás solo cuando se vende o alquila</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Incluye todos los servicios</strong> - Tasación, fotos, publicación, visitas, asesoramiento</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Listo para maximizar tu propiedad?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Publicá tu propiedad con nuestro servicio profesional. Sin pago inicial, comisión del 3% solo al concretar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/inmobiliaria-en-equipo/publicar">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Publicar con Servicio Profesional
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/propiedades">
                  Ver Propiedades Disponibles
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 max-w-4xl">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              ¿Tenés dudas sobre el servicio?
            </h2>
            <p className="text-muted-foreground mb-6">
              Contactanos y te explicamos todos los detalles
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg">
                <a href="https://wa.me/5493425123456" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="mailto:info@marketsantafe.com.ar">
                  <Mail className="mr-2 h-5 w-5" />
                  Email
                </a>
              </Button>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}

