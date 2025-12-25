// API route para manejar sesiones de chat del chatbot widget
// Actúa como proxy hacia el servidor externo del chatbot
// GET /api/web/chat/session - Obtener o crear sesión de chat
// POST /api/web/chat/session - Crear sesión de chat
// OPTIONS /api/web/chat/session - CORS preflight

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

// Proxy GET hacia el servidor externo
export async function GET(request: NextRequest) {
  let timeoutId: NodeJS.Timeout | null = null
  
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const targetUrl = `${CHATBOT_API_URL}/api/web/chat/session${searchParams ? `?${searchParams}` : ''}`
    
    // Crear AbortController para timeout
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (!response.ok) {
      console.warn('⚠️ Respuesta no OK del servidor externo:', response.status, response.statusText)
      // Crear sesión local si el servidor externo falla
      const sessionId = crypto.randomUUID()
      return NextResponse.json(
        {
          sessionId,
          status: 'active',
        },
        {
          status: 200,
          headers: corsHeaders,
        }
      )
    }

    const data = await response.json().catch(() => ({}))
    
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error: any) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // No loguear errores de timeout o conexión como errores críticos
    if (error.name === 'AbortError') {
      console.warn('⚠️ Timeout al conectar con el servidor del chatbot. Creando sesión local.')
    } else {
      console.warn('⚠️ Error al conectar con el servidor del chatbot. Creando sesión local:', error?.message || error)
    }
    
    // Si falla el servidor externo, crear una sesión local
    const sessionId = crypto.randomUUID()
    return NextResponse.json(
      {
        sessionId,
        status: 'active',
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  }
}

// Proxy POST hacia el servidor externo
export async function POST(request: NextRequest) {
  let timeoutId: NodeJS.Timeout | null = null
  
  try {
    const body = await request.json().catch(() => ({}))
    const targetUrl = `${CHATBOT_API_URL}/api/web/chat/session`
    
    // Crear AbortController para timeout
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    if (!response.ok) {
      console.warn('⚠️ Respuesta no OK del servidor externo:', response.status, response.statusText)
      // Crear sesión local si el servidor externo falla
      const sessionId = crypto.randomUUID()
      return NextResponse.json(
        {
          sessionId,
          status: 'active',
        },
        {
          status: 200,
          headers: corsHeaders,
        }
      )
    }

    const data = await response.json().catch(() => ({}))
    
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error: any) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // No loguear errores de timeout o conexión como errores críticos
    if (error.name === 'AbortError') {
      console.warn('⚠️ Timeout al conectar con el servidor del chatbot. Creando sesión local.')
    } else {
      console.warn('⚠️ Error al conectar con el servidor del chatbot. Creando sesión local:', error?.message || error)
    }
    
    // Si falla el servidor externo, crear una sesión local
    const sessionId = crypto.randomUUID()
    return NextResponse.json(
      {
        sessionId,
        status: 'active',
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  }
}

