// Zonas/barrios de Santa Fe disponibles para filtrar
// TypeScript: definimos un tipo para las zonas
export interface Zone {
  id: string
  name: string
  slug: string
}

export const zones: Zone[] = [
  {
    id: "1",
    name: "Centro",
    slug: "centro",
  },
  {
    id: "2",
    name: "Barrio Sur",
    slug: "barrio-sur",
  },
  {
    id: "3",
    name: "Barrio Norte",
    slug: "barrio-norte",
  },
  {
    id: "4",
    name: "San Martín",
    slug: "san-martin",
  },
  {
    id: "5",
    name: "Villa María Selva",
    slug: "villa-maria-selva",
  },
  {
    id: "6",
    name: "Barranquitas",
    slug: "barranquitas",
  },
  {
    id: "7",
    name: "San Agustín",
    slug: "san-agustin",
  },
  {
    id: "8",
    name: "Candioti",
    slug: "candioti",
  },
  {
    id: "9",
    name: "7 Jefes",
    slug: "7-jefes",
  },
  {
    id: "10",
    name: "Alto Verde",
    slug: "alto-verde",
  },
  {
    id: "11",
    name: "Toda la ciudad",
    slug: "toda-la-ciudad",
  },
]

// Helper para obtener zona por slug
export function getZoneBySlug(slug: string): Zone | undefined {
  return zones.find((zone) => zone.slug === slug)
}

// Helper para obtener zona por id
export function getZoneById(id: string): Zone | undefined {
  return zones.find((zone) => zone.id === id)
}













