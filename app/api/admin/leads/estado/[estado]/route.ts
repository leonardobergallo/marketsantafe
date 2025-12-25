// API route proxy para el panel de administración del chatbot
// GET /api/admin/leads/estado/[estado]
// Proxies requests to the external chatbot admin API

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

const CHATBOT_API_URL = 'https://inmobiliariaenquipo.vercel.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { estado: string } }
) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Verificar que sea agente de inmobiliaria
    if (!user.is_inmobiliaria_agent) {
      return NextResponse.json(
        { error: 'Acceso restringido' },
        { status: 403, headers: corsHeaders }
      )
    }

    const estado = params.estado
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    
    const targetUrl = `${CHATBOT_API_URL}/api/admin/leads/estado/${estado}${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`[Admin Proxy] GET request to: ${targetUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json().catch(() => {
        console.warn(`[Admin Proxy] Response from ${targetUrl} was not JSON. Status: ${response.status}`)
        return { error: 'Error al procesar la respuesta' }
      })
      
      return NextResponse.json(data, {
        status: response.status,
        headers: corsHeaders,
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error('[Admin Proxy] GET request timed out after 10 seconds:', error)
      } else {
        console.error('[Admin Proxy] Error en proxy GET:', error)
      }
      
      // Devolver respuesta exitosa pero informativa para evitar que se muestre como error
      return NextResponse.json(
        { 
          success: false,
          message: 'El servidor del chatbot no está disponible temporalmente',
          retry: true,
          silent: true // Flag para que no se muestre como error crítico
        },
        {
          status: 200, // Devolver 200 para que no se trate como error
          headers: corsHeaders,
        }
      )
    }
  } catch (error) {
    console.error('[Admin Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500, headers: corsHeaders }
    )
  }
}

