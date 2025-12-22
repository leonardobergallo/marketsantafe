// API para listar imágenes disponibles en /public/uploads/
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    try {
      await fs.access(uploadsDir)
    } catch {
      // Si la carpeta no existe, crear vacía
      await fs.mkdir(uploadsDir, { recursive: true })
      return NextResponse.json({ images: [] })
    }

    const files = await fs.readdir(uploadsDir)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    return NextResponse.json({ images: imageFiles })
  } catch (error) {
    console.error('Error listando imágenes:', error)
    return NextResponse.json(
      { error: 'Error al listar imágenes' },
      { status: 500 }
    )
  }
}

