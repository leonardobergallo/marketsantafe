// API route proxy genérica para todas las peticiones del chatbot
// Redirige todas las peticiones a /api/web/chat/* hacia el servidor externo del chatbot
// GET /api/web/chat/* - Proxy hacia el servidor externo
// POST /api/web/chat/* - Proxy hacia el servidor externo
// OPTIONS /api/web/chat/* - CORS preflight

import { NextRequest, NextResponse } from 'next/server'

const CHATBOT_API_URL = 'https://inmobiliariaenquipo.vercel.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Manejar CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// Proxy genérico para todas las peticiones
async function handleRequest(
  request: NextRequest,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  params: Promise<{ path: string[] }>
) {
  let timeoutId: NodeJS.Timeout | null = null
  let pathString = 'unknown'
  
  try {
    const { path } = await params
    pathString = path.join('/')
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    
    const targetUrl = `${CHATBOT_API_URL}/api/web/chat/${pathString}${searchParams ? `?${searchParams}` : ''}`
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Agregar body para POST, PUT, DELETE
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      try {
        const body = await request.json()
        options.body = JSON.stringify(body)
      } catch {
        // Si no hay body, continuar sin él
      }
    }

    console.log(`🔗 Proxy ${method} a:`, targetUrl)
    
    // Crear AbortController para timeout
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
    
    const response = await fetch(targetUrl, {
      ...options,
      signal: controller.signal,
    })
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    
    if (!response.ok) {
      console.warn(`⚠️ Respuesta no OK del servidor externo:`, response.status, response.statusText)
      // Si el servidor externo falla, devolver respuesta exitosa con datos vacíos
      // Esto evita que el widget muestre errores
      return NextResponse.json(
        { 
          success: true,
          data: null,
          message: 'Servicio temporalmente no disponible'
        },
        {
          status: 200, // Siempre devolver 200 para que no se trate como error
          headers: corsHeaders,
        }
      )
    }
    
    const data = await response.json().catch(async () => {
      // Si no es JSON, intentar como texto
      const text = await response.text().catch(() => '')
      return text ? { message: text } : { success: true, data: null }
    })
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error: any) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // No loguear como error crítico, solo como advertencia
    if (error.name === 'AbortError') {
      console.warn(`⚠️ Timeout en proxy ${method} /api/web/chat/${pathString} después de 10 segundos`)
    } else {
      console.warn(`⚠️ Error en proxy ${method} /api/web/chat/${pathString}:`, error?.message || error)
    }
    
    // Devolver una respuesta exitosa con datos vacíos
    // Esto evita que el widget muestre errores críticos
    return NextResponse.json(
      { 
        success: true,
        data: null,
        message: 'Servicio temporalmente no disponible'
      },
      {
        status: 200, // Siempre devolver 200 para que no se trate como error
        headers: corsHeaders,
      }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, 'GET', params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, 'POST', params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, 'PUT', params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, 'DELETE', params)
}

