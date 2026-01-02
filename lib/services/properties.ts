// Servicio para obtener propiedades con fallback
import { exampleProperties, exampleAgencies } from '../mocks/exampleData'
import type { Property, Agency } from '../types'

export interface PropertyWithAgency extends Property {
  agency?: {
    id: string
    name: string
    whatsapp: string
    email?: string
    logoUrl?: string
  } | null
}

export async function fetchProperties(): Promise<PropertyWithAgency[]> {
  try {
    const response = await fetch('/api/properties')
    if (!response.ok) {
      throw new Error('Error al obtener propiedades')
    }
    const data = await response.json()
    
    // Mapear las propiedades del backend al formato esperado
    // El backend devuelve 'type' pero nosotros usamos 'operation'
    const properties = (data.properties || []).map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      price: prop.price,
      operation: prop.type === 'alquiler' ? 'alquiler' as const : 'venta' as const,
      agencyId: null, // Por ahora null ya que no existe agencyId en DB
    }))

    return properties
  } catch (error) {
    console.error('Error obteniendo propiedades, usando fallback:', error)
    // Fallback a datos de ejemplo
    return exampleProperties.map(prop => ({ ...prop, agency: null }))
  }
}

export async function fetchAgencies(): Promise<Agency[]> {
  try {
    const response = await fetch('/api/agencies')
    if (!response.ok) {
      throw new Error('Error al obtener inmobiliarias')
    }
    const data = await response.json()
    return data.agencies || []
  } catch (error) {
    console.error('Error obteniendo inmobiliarias, usando fallback:', error)
    // Fallback a datos de ejemplo
    return exampleAgencies
  }
}

