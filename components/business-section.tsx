import { Button } from "@/components/ui/button"
import { Check, Store } from "lucide-react"

const benefits = [
  "Panel de control propio",
  "Mayor visibilidad en búsquedas",
  "Gestión de inventario",
  "Tráfico incluido desde el primer día",
]

export function BusinessSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-background py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                <Store className="h-3 sm:h-4 w-3 sm:w-4" />
                Para negocios
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
                Vendé con tu propia <span className="text-primary">tienda online</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 leading-relaxed">
                Creá tu tienda dentro de MarketSantaFe y llegá a miles de clientes potenciales. Sin costos ocultos, sin
                complicaciones.
              </p>

              <ul className="space-y-3 sm:space-y-4 md:space-y-5 mb-8 md:mb-10">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 sm:gap-4">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" strokeWidth={3} />
                    </div>
                    <span className="text-foreground font-medium text-sm sm:text-base md:text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <a href="/negocios">Ver planes</a>
              </Button>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-card-foreground mb-1 sm:mb-2">
                      Panel de análisis
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Seguí tus ventas en tiempo real</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">👥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-card-foreground mb-1 sm:mb-2">
                      Base de clientes
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">+15,000 usuarios activos</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-primary/80 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-card-foreground mb-1 sm:mb-2">
                      Configuración rápida
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Tu tienda lista en minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
