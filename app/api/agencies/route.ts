// API route para obtener inmobiliarias
import { NextRequest, NextResponse } from 'next/server'
import { exampleAgencies } from '@/lib/mocks/exampleData'
import type { Agency } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Por ahora, devolvemos solo los datos de ejemplo
    // En el futuro, si existe tabla agencies en DB, se puede consultar aquí
    const agencies: Agency[] = exampleAgencies

    return NextResponse.json({ agencies }, { status: 200 })
  } catch (error) {
    console.error('Error obteniendo inmobiliarias:', error)
    // En caso de error, devolver datos de ejemplo como fallback
    return NextResponse.json(
      { agencies: exampleAgencies },
      { status: 200 }
    )
  }
}

