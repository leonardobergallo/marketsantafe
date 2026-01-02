// Helper para derivar leads según la propiedad
import type { Property } from './types'

/**
 * Determina a qué inmobiliaria derivar un lead basado en la propiedad
 * @param property - La propiedad para la cual se está generando el lead
 * @returns El ID de la inmobiliaria o null si debe gestionarse por la plataforma
 */
export function routeLead(property: Property): string | null {
  // Si la propiedad tiene una inmobiliaria asignada, derivar a esa
  if (property.agencyId) {
    return property.agencyId
  }

  // Si no tiene inmobiliaria, gestionar por la plataforma
  // TODO: Implementar reglas futuras de rotación/prioridad aquí
  return null
}



