// Script para verificar y corregir TODAS las rutas de imágenes para que coincidan exactamente con los archivos
import { config } from 'dotenv'
import { resolve } from 'path'
import { pool } from '../lib/db'
import * as fs from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixAllImagePathsExact() {
  const client = await pool.connect()

  try {
    console.log('🔍 Verificando y corrigiendo TODAS las rutas de imágenes...\n')

    const imagesDir = 'public/images'
    const allImages = new Set(fs.readdirSync(imagesDir).filter(f => 
      f.match(/\.(png|jpg|jpeg|gif|webp)$/i)
    ))

    console.log(`📊 Total de imágenes disponibles: ${allImages.size}`)

    // Obtener todos los listings
    const result = await client.query(`
      SELECT id, title, image_url, images
      FROM listings
    `)

    console.log(`📦 Total de productos: ${result.rows.length}\n`)

    let actualizados = 0
    let sinImagen = 0
    const sinImagenList: string[] = []

    for (const listing of result.rows) {
      let necesitaActualizar = false
      let nuevoImageUrl = listing.image_url
      let nuevasImages: string[] = []

      // Función para encontrar imagen exacta o similar
      const findImage = (searchTerm: string): string | null => {
        // Primero buscar coincidencia exacta
        const exactMatch = Array.from(allImages).find(img => 
          img === searchTerm || 
          img === searchTerm.replace('/images/', '') ||
          img.toLowerCase() === searchTerm.toLowerCase().replace('/images/', '')
        )
        if (exactMatch) return exactMatch

        // Buscar por nombre del producto (normalizar)
        const normalizedSearch = searchTerm
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20)

        const similarMatch = Array.from(allImages).find(img => {
          const normalizedImg = img
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20)
          return normalizedImg.includes(normalizedSearch) || 
                 normalizedSearch.includes(normalizedImg)
        })
        
        return similarMatch || null
      }

      // Verificar image_url
      if (listing.image_url) {
        const nombreArchivo = listing.image_url.replace('/images/', '').replace('/uploads/', '')
        const archivoExiste = allImages.has(nombreArchivo)
        
        if (!archivoExiste) {
          // Buscar imagen similar
          const imagenEncontrada = findImage(nombreArchivo) || findImage(listing.title)
          
          if (imagenEncontrada) {
            nuevoImageUrl = `/images/${imagenEncontrada}`
            necesitaActualizar = true
            console.log(`✅ ${listing.title.substring(0, 40)}`)
            console.log(`   ${nombreArchivo.substring(0, 50)} → ${imagenEncontrada.substring(0, 50)}`)
          } else {
            sinImagen++
            sinImagenList.push(`${listing.title} (${nombreArchivo})`)
          }
        } else {
          nuevoImageUrl = `/images/${nombreArchivo}`
        }
      } else {
        // No hay image_url, buscar por título
        const imagenEncontrada = findImage(listing.title)
        if (imagenEncontrada) {
          nuevoImageUrl = `/images/${imagenEncontrada}`
          necesitaActualizar = true
          console.log(`✅ ${listing.title.substring(0, 40)} → ${imagenEncontrada.substring(0, 50)}`)
        } else {
          sinImagen++
          sinImagenList.push(listing.title)
        }
      }

      // Procesar images array
      if (listing.images) {
        try {
          const images = typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images
          
          if (Array.isArray(images)) {
            nuevasImages = images.map((img: string) => {
              if (img.startsWith('http')) return img
              
              const nombreArchivo = img.replace('/images/', '').replace('/uploads/', '')
              if (allImages.has(nombreArchivo)) {
                return `/images/${nombreArchivo}`
              }
              
              // Buscar similar
              const encontrada = findImage(nombreArchivo)
              return encontrada ? `/images/${encontrada}` : img
            }).filter(Boolean)
          }
        } catch (e) {
          // Ignorar
        }
      }

      // Si no hay imágenes en el array, usar image_url
      if (nuevasImages.length === 0 && nuevoImageUrl) {
        nuevasImages = [nuevoImageUrl]
        necesitaActualizar = true
      }

      // Actualizar si es necesario
      if (necesitaActualizar || !listing.images) {
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
          console.log(`\n⏳ Actualizados: ${actualizados}/${result.rows.length}\n`)
        }
      }
    }

    console.log(`\n✅ Productos actualizados: ${actualizados}`)
    console.log(`⚠️  Productos sin imagen: ${sinImagen}`)
    
    if (sinImagenList.length > 0 && sinImagenList.length <= 20) {
      console.log('\nProductos sin imagen:')
      sinImagenList.forEach(item => console.log(`  - ${item}`))
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

fixAllImagePathsExact()
  .then(() => {
    console.log('\n🎉 Proceso completado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })


