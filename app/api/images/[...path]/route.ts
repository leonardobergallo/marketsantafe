// API route para servir imágenes con caracteres especiales
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params
    // Decodificar la ruta para manejar caracteres especiales codificados
    let imagePath = pathArray.map(p => decodeURIComponent(p)).join('/')
    
    // Construir la ruta completa del archivo
    // Buscar primero en uploads/images, luego en images
    let filePath = join(process.cwd(), 'public', 'uploads', 'images', imagePath)
    
    if (!existsSync(filePath)) {
      // Intentar en public/images como fallback
      filePath = join(process.cwd(), 'public', 'images', imagePath)
    }
    
    // Verificar que el archivo existe y está dentro de public
    const publicPath = join(process.cwd(), 'public')
    if (!existsSync(filePath) || !filePath.startsWith(publicPath)) {
      console.error('Image not found:', imagePath)
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
    }[ext || ''] || 'image/png'
    
    // Devolver la imagen
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Error serving image', { status: 500 })
  }
}

