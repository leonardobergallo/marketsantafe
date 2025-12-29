// Script para relacionar imágenes con productos basándose en el título
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

// Función para normalizar texto (quitar acentos, espacios, etc.)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, '') // Solo letras y números
}

// Función para encontrar la imagen que mejor coincida con el título
function findMatchingImage(title: string, imagesDir: string): string | null {
  const normalizedTitle = normalizeText(title)
  const files = fs.readdirSync(imagesDir)
  
  let bestMatch: { file: string; score: number } | null = null
  
  for (const file of files) {
    if (!file.match(/\.(png|jpg|jpeg|gif|webp)$/i)) continue
    
    const normalizedFile = normalizeText(file.replace(/\.[^.]*$/, '')) // Quitar extensión
    
    // Calcular score de coincidencia
    let score = 0
    const titleWords = normalizedTitle.split(/(?=[a-z])/).filter(w => w.length > 2)
    
    for (const word of titleWords) {
      if (normalizedFile.includes(word)) {
        score += word.length
      }
    }
    
    // Bonus si el archivo contiene palabras clave del título
    if (normalizedFile.includes(normalizedTitle.substring(0, 10))) {
      score += 50
    }
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { file, score }
    }
  }
  
  return bestMatch && bestMatch.score > 10 ? bestMatch.file : null
}

async function matchImagesByTitle() {
  const client = await pool.connect()

  try {
    console.log('🔍 Relacionando imágenes con productos por título...\n')

    const imagesDir = 'public/images'
    
    // Obtener todos los listings
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
    `)

    console.log(`📊 Total de productos: ${result.rows.length}`)

    let actualizados = 0
    let sinImagen = 0

    for (const listing of result.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Verificar si la imagen actual existe
      let imagenExiste = false
      if (listing.image_url && listing.image_url.startsWith('/images/')) {
        const nombreArchivo = listing.image_url.replace('/images/', '')
        imagenExiste = fs.existsSync(`${imagesDir}/${nombreArchivo}`)
      }

      // Si no existe, buscar por título
      if (!imagenExiste) {
        const imagenEncontrada = findMatchingImage(listing.title, imagesDir)
        
        if (imagenEncontrada) {
          nuevoImageUrl = `/images/${imagenEncontrada}`
          nuevasImages = [nuevoImageUrl]
          necesitaActualizar = true
          console.log(`✅ ${listing.title.substring(0, 40)} → ${imagenEncontrada.substring(0, 40)}`)
        } else {
          sinImagen++
          console.log(`⚠️  ${listing.title.substring(0, 40)}: No se encontró imagen`)
        }
      } else {
        // La imagen existe, verificar el array
        if (listing.images) {
          try {
            const images = typeof listing.images === 'string' 
              ? JSON.parse(listing.images) 
              : listing.images
            
            if (Array.isArray(images) && images.length > 0) {
              nuevasImages = images
            } else {
              nuevasImages = [nuevoImageUrl]
              necesitaActualizar = true
            }
          } catch (e) {
            nuevasImages = [nuevoImageUrl]
            necesitaActualizar = true
          }
        } else {
          nuevasImages = [nuevoImageUrl]
          necesitaActualizar = true
        }
      }

      // Actualizar si es necesario
      if (necesitaActualizar) {
        await client.query(
          `UPDATE listings 
           SET image_url = $1, images = $2
           WHERE id = $3`,
          [
            nuevoImageUrl,
            nuevasImages.length > 0 ? JSON.stringify(nuevasImages) : null,
            listing.id
          ]
        )
        actualizados++
        
        if (actualizados % 50 === 0) {
          console.log(`⏳ Actualizados: ${actualizados}/${result.rows.length}`)
        }
      }
    }

    console.log(`\n✅ Productos actualizados: ${actualizados}`)
    console.log(`⚠️  Productos sin imagen: ${sinImagen}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

matchImagesByTitle()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


