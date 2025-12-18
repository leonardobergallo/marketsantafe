// Datos mock de publicaciones para desarrollo
// TypeScript: definimos el tipo Listing para tipado fuerte
// En JavaScript esto sería solo objetos sin tipo

import { categories } from './categories'
import { zones } from './zones'

export type Condition = 'nuevo' | 'usado' | 'reacondicionado'

export interface Listing {
  id: string
  title: string
  price: number
  categoryId: string
  zoneId: string
  condition: Condition
  description: string
  imageUrl: string
  createdAt: string // ISO date string
  whatsapp?: string
  phone?: string
  featured?: boolean // Para destacados en home
}

// Generamos publicaciones mock variadas
// En JavaScript esto sería un array simple sin el "as const"
export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Departamento 2 ambientes en Centro',
    price: 85000,
    categoryId: '1',
    zoneId: '1',
    condition: 'nuevo',
    description: 'Hermoso departamento de 2 ambientes completamente amueblado, excelente ubicación en el centro de la ciudad. Incluye servicios.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    whatsapp: '3425123456',
    phone: '3425123456',
    featured: true,
  },
  {
    id: '2',
    title: 'iPhone 13 Pro Max 256GB',
    price: 450000,
    categoryId: '4',
    zoneId: '2',
    condition: 'usado',
    description: 'iPhone 13 Pro Max en excelente estado, con caja y cargador original. Pantalla perfecta, batería al 92%.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-14T15:30:00Z',
    whatsapp: '3425234567',
    featured: true,
  },
  {
    id: '3',
    title: 'Ford Fiesta 2018 Kinetic',
    price: 3200000,
    categoryId: '3',
    zoneId: '3',
    condition: 'usado',
    description: 'Ford Fiesta 2018 en muy buen estado, 45000 km, service al día, único dueño. Papeles en regla.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-13T09:20:00Z',
    whatsapp: '3425345678',
    phone: '3425345678',
    featured: true,
  },
  {
    id: '4',
    title: 'Sofá 3 cuerpos moderno',
    price: 180000,
    categoryId: '5',
    zoneId: '4',
    condition: 'usado',
    description: 'Sofá de 3 cuerpos en excelente estado, color gris, muy cómodo. Se retira por zona San Martín.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-12T14:10:00Z',
    whatsapp: '3425456789',
    featured: true,
  },
  {
    id: '5',
    title: 'Servicio de plomería 24hs',
    price: 0,
    categoryId: '6',
    zoneId: '1',
    condition: 'nuevo',
    description: 'Servicio de plomería profesional, trabajos de instalación, reparación y mantenimiento. Presupuesto sin cargo.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-11T11:00:00Z',
    whatsapp: '3425567890',
    phone: '3425567890',
    featured: true,
  },
  {
    id: '6',
    title: 'Casa 3 dormitorios en Barranquitas',
    price: 125000,
    categoryId: '2',
    zoneId: '6',
    condition: 'nuevo',
    description: 'Casa amplia con 3 dormitorios, 2 baños, cocina, living y patio. Ideal para familia. Alquiler mensual.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-10T16:45:00Z',
    whatsapp: '3425678901',
    phone: '3425678901',
    featured: true,
  },
  {
    id: '7',
    title: 'Notebook Dell Inspiron 15',
    price: 280000,
    categoryId: '4',
    zoneId: '5',
    condition: 'usado',
    description: 'Notebook Dell Inspiron 15, Intel i5, 8GB RAM, 256GB SSD. Perfecto estado, ideal para trabajo o estudio.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-09T13:20:00Z',
    whatsapp: '3425789012',
    featured: true,
  },
  {
    id: '8',
    title: 'Heladera No Frost 350L',
    price: 320000,
    categoryId: '7',
    zoneId: '7',
    condition: 'usado',
    description: 'Heladera No Frost marca BGH, 350 litros, excelente estado, funciona perfectamente. Se retira por San Agustín.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-08T10:30:00Z',
    whatsapp: '3425890123',
    featured: true,
  },
  {
    id: '9',
    title: 'Bicicleta Mountain Bike',
    price: 95000,
    categoryId: '9',
    zoneId: '8',
    condition: 'usado',
    description: 'Bicicleta mountain bike rodado 26, cambios Shimano, frenos a disco. Muy buen estado general.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-07T15:00:00Z',
    whatsapp: '3425901234',
  },
  {
    id: '10',
    title: 'Mesa de comedor extensible',
    price: 120000,
    categoryId: '5',
    zoneId: '9',
    condition: 'usado',
    description: 'Mesa de comedor de madera, extensible para 6-8 personas. Incluye 6 sillas. Excelente estado.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-06T12:15:00Z',
    whatsapp: '3425012345',
  },
  {
    id: '11',
    title: 'Perro Labrador cachorro',
    price: 0,
    categoryId: '10',
    zoneId: '10',
    condition: 'nuevo',
    description: 'Hermoso cachorro Labrador de 2 meses, vacunado y desparasitado. Busca familia responsable.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-05T09:00:00Z',
    whatsapp: '3425123456',
  },
  {
    id: '12',
    title: 'TV Smart 55 pulgadas',
    price: 380000,
    categoryId: '4',
    zoneId: '1',
    condition: 'usado',
    description: 'Smart TV Samsung 55 pulgadas, 4K, excelente estado. Incluye control remoto y base.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-04T14:30:00Z',
    whatsapp: '3425234567',
  },
  {
    id: '13',
    title: 'Local comercial en Centro',
    price: 95000,
    categoryId: '2',
    zoneId: '1',
    condition: 'nuevo',
    description: 'Local comercial 40m² en pleno centro, excelente ubicación, ideal para negocio. Alquiler mensual.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-03T11:20:00Z',
    whatsapp: '3425345678',
    phone: '3425345678',
  },
  {
    id: '14',
    title: 'Lavarropas automático 8kg',
    price: 250000,
    categoryId: '7',
    zoneId: '2',
    condition: 'usado',
    description: 'Lavarropas automático marca LG, 8kg de capacidad, carga frontal. Funciona perfectamente.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-02T16:00:00Z',
    whatsapp: '3425456789',
  },
  {
    id: '15',
    title: 'Servicio de electricidad',
    price: 0,
    categoryId: '6',
    zoneId: '3',
    condition: 'nuevo',
    description: 'Electricista matriculado, instalaciones, reparaciones, tableros. Trabajos garantizados.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2024-01-01T10:00:00Z',
    whatsapp: '3425567890',
    phone: '3425567890',
  },
  {
    id: '16',
    title: 'Zapatillas Nike Air Max',
    price: 85000,
    categoryId: '8',
    zoneId: '4',
    condition: 'usado',
    description: 'Zapatillas Nike Air Max talle 42, usadas pero en buen estado. Modelo clásico.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-31T13:45:00Z',
    whatsapp: '3425678901',
  },
  {
    id: '17',
    title: 'Moto Honda Twister 250',
    price: 1800000,
    categoryId: '3',
    zoneId: '5',
    condition: 'usado',
    description: 'Honda Twister 250 año 2019, 15000 km, muy buen estado. Papeles al día.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-30T15:30:00Z',
    whatsapp: '3425789012',
    phone: '3425789012',
  },
  {
    id: '18',
    title: 'Cama matrimonial con base',
    price: 150000,
    categoryId: '5',
    zoneId: '6',
    condition: 'usado',
    description: 'Cama matrimonial con base y colchón, muy buen estado. Se retira por Barranquitas.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-29T12:00:00Z',
    whatsapp: '3425890123',
  },
  {
    id: '19',
    title: 'PlayStation 5 con juegos',
    price: 420000,
    categoryId: '4',
    zoneId: '7',
    condition: 'usado',
    description: 'PlayStation 5 con 3 juegos incluidos (FIFA 24, Spider-Man, God of War). Excelente estado.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-28T14:20:00Z',
    whatsapp: '3425901234',
  },
  {
    id: '20',
    title: 'Gimnasio en casa completo',
    price: 200000,
    categoryId: '9',
    zoneId: '8',
    condition: 'usado',
    description: 'Set completo de gimnasio: banco, pesas, mancuernas, barra. Todo en muy buen estado.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-27T11:10:00Z',
    whatsapp: '3425012345',
  },
  {
    id: '21',
    title: 'Microondas 20L',
    price: 45000,
    categoryId: '7',
    zoneId: '9',
    condition: 'usado',
    description: 'Microondas marca Atma, 20 litros, funciona perfectamente. Se retira por 7 Jefes.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-26T09:30:00Z',
    whatsapp: '3425123456',
  },
  {
    id: '22',
    title: 'Casa en alquiler Alto Verde',
    price: 65000,
    categoryId: '1',
    zoneId: '10',
    condition: 'nuevo',
    description: 'Casa 2 dormitorios en Alto Verde, patio grande, cochera. Alquiler mensual, requiere garantía.',
    imageUrl: '/placeholder.jpg',
    createdAt: '2023-12-25T16:00:00Z',
    whatsapp: '3425234567',
    phone: '3425234567',
  },
]

// Helper para obtener todas las publicaciones destacadas
export function getFeaturedListings(): Listing[] {
  return mockListings.filter((listing) => listing.featured === true)
}

// Helper para obtener publicación por ID
export function getListingById(id: string): Listing | undefined {
  return mockListings.find((listing) => listing.id === id)
}

// Helper para filtrar publicaciones
export interface ListingFilters {
  q?: string // Búsqueda de texto
  category?: string // ID de categoría
  zone?: string // ID de zona
  min?: number // Precio mínimo
  max?: number // Precio máximo
  condition?: Condition // Condición
}

export function filterListings(filters: ListingFilters): Listing[] {
  let filtered = [...mockListings]

  // Filtro por búsqueda de texto (título y descripción)
  if (filters.q) {
    const searchTerm = filters.q.toLowerCase()
    filtered = filtered.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
    )
  }

  // Filtro por categoría
  if (filters.category) {
    filtered = filtered.filter((listing) => listing.categoryId === filters.category)
  }

  // Filtro por zona
  if (filters.zone) {
    filtered = filtered.filter((listing) => listing.zoneId === filters.zone)
  }

  // Filtro por precio mínimo
  if (filters.min !== undefined) {
    filtered = filtered.filter((listing) => listing.price >= filters.min!)
  }

  // Filtro por precio máximo
  if (filters.max !== undefined) {
    filtered = filtered.filter((listing) => listing.price <= filters.max!)
  }

  // Filtro por condición
  if (filters.condition) {
    filtered = filtered.filter((listing) => listing.condition === filters.condition)
  }

  return filtered
}

