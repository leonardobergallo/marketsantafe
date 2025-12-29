// API route para servir imágenes con caracteres especiales
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, normalize } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params
    
    // Decodificar y limpiar la ruta para manejar caracteres especiales
    let imagePath = pathArray
      .map(p => decodeURIComponent(p))
      .join('/')
      .replace(/^\/+|\/+$/g, '') // Remover slashes al inicio y final
    
    // Limpiar la ruta de posibles intentos de path traversal
    imagePath = normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '')
    
    if (!imagePath) {
      console.error('Empty image path')
      return new NextResponse('Invalid image path', { status: 400 })
    }
    
    // Construir rutas posibles (en orden de prioridad)
    const publicPath = join(process.cwd(), 'public')
    const possiblePaths = [
      join(publicPath, 'uploads', 'images', imagePath),
      join(publicPath, 'uploads', imagePath),
      join(publicPath, 'images', imagePath),
      join(publicPath, imagePath),
    ]
    
    let filePath: string | null = null
    
    // Buscar el archivo en las rutas posibles
    for (const path of possiblePaths) {
      const normalizedPath = normalize(path)
      // Verificar que está dentro de public y existe
      if (normalizedPath.startsWith(publicPath) && existsSync(normalizedPath)) {
        filePath = normalizedPath
        break
      }
    }
    
    if (!filePath) {
      // Log detallado para debug en producción
      console.error('Image not found:', {
        imagePath,
        searchedPaths: possiblePaths,
        cwd: process.cwd(),
        publicPath,
      })
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // Leer el archivo
    const fileBuffer = await readFile(filePath)
    
    // Determinar el tipo de contenido
    const ext = imagePath.split('.').pop()?.toLowerCase()
    const contentType = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    }[ext || ''] || 'image/png'
    
    // Devolver la imagen con headers optimizados
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error: any) {
    console.error('Error serving image:', {
      error: error.message,
      stack: error.stack,
    })
    return new NextResponse('Error serving image', { status: 500 })
  }
}

