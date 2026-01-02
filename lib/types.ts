// Tipos para el módulo multi-inmobiliario

export type Agency = {
  id: string
  name: string
  whatsapp: string
  email?: string
  logoUrl?: string
}

export type Property = {
  id: string
  title: string
  price: number
  operation: 'venta' | 'alquiler'
  agencyId?: string | null
}



