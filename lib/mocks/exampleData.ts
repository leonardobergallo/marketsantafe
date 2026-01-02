// Datos de ejemplo para fallback cuando no hay base de datos

import type { Agency, Property } from '../types'

export const exampleAgencies: Agency[] = [
  {
    id: 'agency-001',
    name: 'Inmobiliaria Santa Fe Centro',
    whatsapp: '5493425000000',
    email: 'contacto@sfcentro.com',
    logoUrl: '/logos/sf-centro.png'
  },
  {
    id: 'agency-002',
    name: 'Solar Propiedades',
    whatsapp: '5493425123456',
    email: 'info@solarpropiedades.com',
    logoUrl: '/logos/solar-propiedades.png'
  }
]

// Mantener compatibilidad con código existente
export const exampleAgency = exampleAgencies[0]

export const exampleProperties: Property[] = [
  {
    id: 'prop-001',
    title: 'Departamento 2 dormitorios – Centro',
    price: 85000,
    operation: 'venta',
    agencyId: 'agency-001'
  },
  {
    id: 'prop-002',
    title: 'Casa con patio – Barrio Candioti',
    price: 140000,
    operation: 'venta',
    agencyId: 'agency-001'
  },
  {
    id: 'prop-003',
    title: 'Monoambiente amoblado – Recoleta Santa Fe',
    price: 45000,
    operation: 'alquiler',
    agencyId: 'agency-002' // Solar Propiedades
  },
  {
    id: 'prop-004',
    title: 'Terreno en zona norte',
    price: 30000,
    operation: 'venta',
    agencyId: null
  },
  {
    id: 'prop-005',
    title: 'Casa moderna 3 dormitorios – Barrio Sur',
    price: 180000,
    operation: 'venta',
    agencyId: 'agency-002' // Solar Propiedades
  },
  {
    id: 'prop-006',
    title: 'Departamento 1 dormitorio – Centro',
    price: 55000,
    operation: 'alquiler',
    agencyId: 'agency-002' // Solar Propiedades
  }
]

