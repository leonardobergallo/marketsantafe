// API route para mejorar imágenes usando IA (eliminar personas/objetos)
// POST /api/images/enhance

import { NextRequest, NextResponse } from 'next/server'

// Opción 1: Remove.bg API (50 imágenes/mes gratis) - https://www.remove.bg/api
const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY || ''

// Opción 2: Clipdrop API (100 requests/mes gratis) - https://clipdrop.co/api
const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, mode = 'remove-object' } = body

    if (!image) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      )
    }

    // Determinar qué servicio usar (prioridad: Remove.bg > Clipdrop)
    let service = 'none'
    if (REMOVEBG_API_KEY) {
      service = 'removebg'
    } else if (CLIPDROP_API_KEY) {
      service = 'clipdrop'
    }

    if (service === 'none') {
      return NextResponse.json(
        { 
          error: 'Servicio de mejora de imágenes no configurado.',
          note: 'Configura una API key gratuita. Opciones:\n' +
                '1. Remove.bg: 50 imágenes/mes gratis - https://www.remove.bg/api\n' +
                '2. Clipdrop: 100 requests/mes gratis - https://clipdrop.co/api\n' +
                '\nAgrega REMOVEBG_API_KEY o CLIPDROP_API_KEY a tu .env'
        },
        { status: 503 }
      )
    }

    // Convertir base64 a buffer
    let imageBuffer: Buffer
    if (image.startsWith('data:image')) {
      // Es base64 con prefijo
      const base64Data = image.split(',')[1]
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // Es base64 puro
      imageBuffer = Buffer.from(image, 'base64')
    }

    let enhancedImageBuffer: ArrayBuffer
    let mimeType = 'image/png'

    // Usar Remove.bg (mejor opción gratuita - 50 imágenes/mes)
    if (service === 'removebg') {
      try {
        const FormData = (await import('form-data')).default
        const formData = new FormData()
        formData.append('image_file', imageBuffer, {
          filename: 'image.jpg',
          contentType: 'image/jpeg',
        })
        formData.append('size', 'regular')

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVEBG_API_KEY,
            ...formData.getHeaders(),
          },
          body: formData as any,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error de Remove.bg API:', errorText)
          // Si Remove.bg falla y tenemos Clipdrop, intentar con Clipdrop
          if (CLIPDROP_API_KEY) {
            service = 'clipdrop'
          } else {
            return NextResponse.json(
              { error: 'Error al procesar la imagen con Remove.bg. Verifica tu API key.' },
              { status: response.status }
            )
          }
        } else {
          enhancedImageBuffer = await response.arrayBuffer()
          mimeType = 'image/png'
        }
      } catch (error) {
        console.error('Error con Remove.bg:', error)
        // Si Remove.bg falla y tenemos Clipdrop, intentar con Clipdrop
        if (CLIPDROP_API_KEY) {
          service = 'clipdrop'
        } else {
          throw error
        }
      }
    }

    // Usar Clipdrop (100 requests/mes gratis)
    if (service === 'clipdrop') {
      let endpoint = 'https://clipdrop-api.co/remove-object/v1'
      
      if (mode === 'cleanup') {
        endpoint = 'https://clipdrop-api.co/cleanup/v1'
      }

      const FormData = (await import('form-data')).default
      const formData = new FormData()
      formData.append('image_file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': CLIPDROP_API_KEY,
          ...formData.getHeaders(),
        },
        body: formData as any,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error de Clipdrop API:', errorText)
        return NextResponse.json(
          { error: 'Error al procesar la imagen. Intenta nuevamente.' },
          { status: response.status }
        )
      }

      enhancedImageBuffer = await response.arrayBuffer()
      mimeType = response.headers.get('content-type') || 'image/jpeg'
    }

    // Convertir la respuesta a base64
    const enhancedImageBase64 = Buffer.from(enhancedImageBuffer).toString('base64')
    const dataUrl = `data:${mimeType};base64,${enhancedImageBase64}`

    return NextResponse.json({
      success: true,
      image: dataUrl,
    })
  } catch (error) {
    console.error('Error al mejorar imagen:', error)
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    )
  }
}
