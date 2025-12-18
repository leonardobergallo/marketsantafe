import { Card } from "@/components/ui/card"
import { Home, Building2, Car, Laptop, Sofa, Wrench } from "lucide-react"

const categories = [
  {
    name: "Alquileres",
    icon: Home,
    count: "2,340",
  },
  {
    name: "Inmuebles",
    icon: Building2,
    count: "1,820",
  },
  {
    name: "Vehículos",
    icon: Car,
    count: "980",
  },
  {
    name: "Tecnología",
    icon: Laptop,
    count: "1,560",
  },
  {
    name: "Hogar",
    icon: Sofa,
    count: "2,100",
  },
  {
    name: "Servicios",
    icon: Wrench,
    count: "890",
  },
]

export function Categories() {
  return (
    <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
          Explorá por categoría
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">Encontrá lo que necesitás en Santa Fe</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
        {categories.map((category) => (
          <Card
            key={category.name}
            className="group cursor-pointer border border-border bg-card hover:border-primary hover:shadow-md transition-all duration-200 p-4 sm:p-5 md:p-6"
          >
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <category.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-1">{category.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{category.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
