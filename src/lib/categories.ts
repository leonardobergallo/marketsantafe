// Categorías disponibles en el marketplace
// TypeScript: definimos un tipo para las categorías (en JS sería solo un objeto)
export interface Category {
  id: string
  name: string
  slug: string
  icon: string // Nombre del icono de lucide-react
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Alquileres",
    slug: "alquileres",
    icon: "Home",
  },
  {
    id: "2",
    name: "Inmuebles",
    slug: "inmuebles",
    icon: "Building2",
  },
  {
    id: "3",
    name: "Vehículos",
    slug: "vehiculos",
    icon: "Car",
  },
  {
    id: "4",
    name: "Tecnología",
    slug: "tecnologia",
    icon: "Laptop",
  },
  {
    id: "5",
    name: "Hogar y Muebles",
    slug: "hogar-muebles",
    icon: "Sofa",
  },
  {
    id: "6",
    name: "Servicios",
    slug: "servicios",
    icon: "Wrench",
  },
  {
    id: "7",
    name: "Electrodomésticos",
    slug: "electrodomesticos",
    icon: "Microwave",
  },
  {
    id: "8",
    name: "Ropa y Accesorios",
    slug: "ropa-accesorios",
    icon: "Shirt",
  },
  {
    id: "9",
    name: "Deportes",
    slug: "deportes",
    icon: "Dumbbell",
  },
  {
    id: "10",
    name: "Mascotas",
    slug: "mascotas",
    icon: "Dog",
  },
]

// Helper para obtener categoría por slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug)
}

// Helper para obtener categoría por id
export function getCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id)
}













