import { Button } from "@/components/ui/button"
import { User, ArrowRight } from "lucide-react"

export function IndividualSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <User className="h-3 sm:h-4 w-3 sm:w-4" />
            Para particulares
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
            Publicá <span className="text-accent">gratis</span> en minutos
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            ¿Querés vender algo que ya no usás o alquilar tu propiedad?{" "}
            <span className="font-semibold text-foreground">Publicá sin costo</span> y conectá con compradores en tu
            zona
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-10 md:mb-14">
          <div className="group relative">
            <div className="relative bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:border-primary hover:shadow-md transition-all">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl">📸</span>
              </div>
              <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-primary text-primary-foreground h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                1
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">Subí fotos</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Agregá imágenes de tu producto o propiedad</p>
            </div>
          </div>

          <div className="group relative">
            <div className="relative bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:border-accent hover:shadow-md transition-all">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl">✍️</span>
              </div>
              <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-accent text-accent-foreground h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                2
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">Describí</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Contá los detalles importantes y el precio</p>
            </div>
          </div>

          <div className="group relative sm:col-span-2 md:col-span-1">
            <div className="relative bg-card border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center hover:border-primary hover:shadow-md transition-all">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-primary/80 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                <span className="text-3xl sm:text-4xl">🎉</span>
              </div>
              <div className="absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-primary text-primary-foreground h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
                3
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">Publicá</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Llegá a miles de personas al instante</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <a href="/publicar">
              Comenzar a publicar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground px-4">
            Sin registro requerido • Publicación instantánea • 100% gratis
          </p>
        </div>
      </div>
    </section>
  )
}
