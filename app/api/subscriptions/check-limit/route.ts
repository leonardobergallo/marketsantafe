// API para verificar si el usuario puede publicar
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { checkCanPublish } from '@/lib/subscription-check'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'listing' | 'property' | 'store_product'

    if (!type || !['listing', 'property', 'store_product'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser: listing, property o store_product' },
        { status: 400 }
      )
    }

    const result = await checkCanPublish(user.id, type)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error verificando límite:', error)
    return NextResponse.json(
      { error: 'Error al verificar el límite' },
      { status: 500 }
    )
  }
}




