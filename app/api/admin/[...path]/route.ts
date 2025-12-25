// API route proxy genérico para todas las rutas del panel de administración del chatbot
// Captura todas las peticiones a /api/admin/* y las redirige al servidor externo
// GET, POST, PUT, DELETE /api/admin/[...path]

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

async function handleRequest(
  request: NextRequest,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  params: { path: string[] }
) {
  try {
    // Verificar autenticación para todas las rutas admin
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
        { error: 'Acceso restringido. Solo para agentes de inmobiliaria' },
        { status: 403, headers: corsHeaders }
      )
    }

    const pathString = params.path.join('/')
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    
    const targetUrl = `${CHATBOT_API_URL}/api/admin/${pathString}${searchParams ? `?${searchParams}` : ''}`
    
    console.log(`[Admin Proxy] ${method} request to: ${targetUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }

      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        try {
          const body = await request.json()
          options.body = JSON.stringify(body)
        } catch (e) {
          // No body, está bien
        }
      }

      const response = await fetch(targetUrl, options)
      clearTimeout(timeoutId)

      const data = await response.json().catch(async () => {
        console.warn(`[Admin Proxy] Response from ${targetUrl} was not JSON. Status: ${response.status}`)
        return await response.text().catch(() => ({}))
      })
      
      return NextResponse.json(data, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('content-type') || 'application/json',
        },
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.error(`[Admin Proxy] ${method} request timed out after 10 seconds:`, error)
      } else {
        console.error(`[Admin Proxy] Error en proxy ${method}:`, error)
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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'GET', params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'POST', params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'PUT', params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, 'DELETE', params)
}

