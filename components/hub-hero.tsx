import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HubHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-16 sm:pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 md:mb-8 text-balance leading-tight">
            Comprá, vendé o alquilá en <span className="text-primary">Santa Fe</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty mb-8 md:mb-10 leading-relaxed">
            El marketplace local donde <span className="font-semibold text-foreground">particulares y negocios</span>{" "}
            conectan sin intermediarios
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-8 max-w-md sm:max-w-none mx-auto">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
            >
              <a href="/publicar">
                Publicar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold transition-all w-full sm:w-auto bg-transparent"
            >
              <a href="/negocios">Ver planes</a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm text-muted-foreground max-w-2xl mx-auto">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-xl text-accent">✓</span>
              <span className="font-medium">100% gratis para particulares</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-xl text-accent">✓</span>
              <span className="font-medium">+15,000 usuarios activos</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-lg sm:text-xl text-accent">✓</span>
              <span className="font-medium">Local de Santa Fe</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
