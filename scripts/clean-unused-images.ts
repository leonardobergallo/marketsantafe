// Script para eliminar imágenes no utilizadas
import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })

import { pool } from '../lib/db'

async function cleanUnusedImages() {
  const client = await pool.connect()

  try {
    console.log('🔍 Buscando imágenes utilizadas en la base de datos...\n')

    // Obtener todas las imágenes de listings
    const listingsResult = await client.query(`
      SELECT image_url, images
      FROM listings
      WHERE image_url IS NOT NULL OR images IS NOT NULL
    `)

    // Obtener todas las imágenes de properties
    const propertiesResult = await client.query(`
      SELECT image_url, images
      FROM properties
      WHERE image_url IS NOT NULL OR images IS NOT NULL
    `)

    // Obtener todas las imágenes de stores
    const storesResult = await client.query(`
      SELECT logo_url
      FROM stores
      WHERE logo_url IS NOT NULL
    `)

    // Conjunto de imágenes utilizadas
    const usedImages = new Set<string>()

    // Procesar listings
    for (const row of listingsResult.rows) {
      if (row.image_url) {
        let imgPath = row.image_url
          .replace(/^\/uploads\/images\//, '')
          .replace(/^\/images\//, '')
          .replace(/^\/uploads\//, '')
          .replace(/^uploads\/images\//, '')
          .replace(/^images\//, '')
          .trim()
        if (imgPath && !imgPath.startsWith('http')) {
          usedImages.add(imgPath)
          // También agregar solo el nombre del archivo
          const fileName = path.basename(imgPath)
          if (fileName) usedImages.add(fileName)
        }
      }
      if (row.images) {
        try {
          const images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
          if (Array.isArray(images)) {
            images.forEach((img: string) => {
              if (img && !img.startsWith('http')) {
                let imgPath = img
                  .replace(/^\/uploads\/images\//, '')
                  .replace(/^\/images\//, '')
                  .replace(/^\/uploads\//, '')
                  .replace(/^uploads\/images\//, '')
                  .replace(/^images\//, '')
                  .trim()
                if (imgPath) {
                  usedImages.add(imgPath)
                  // También agregar solo el nombre del archivo
                  const fileName = path.basename(imgPath)
                  if (fileName) usedImages.add(fileName)
                }
              }
            })
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }

    // Procesar properties
    for (const row of propertiesResult.rows) {
      if (row.image_url) {
        let imgPath = row.image_url
          .replace(/^\/uploads\/images\//, '')
          .replace(/^\/images\//, '')
          .replace(/^\/uploads\//, '')
          .replace(/^uploads\/images\//, '')
          .replace(/^images\//, '')
          .trim()
        if (imgPath && !imgPath.startsWith('http')) {
          usedImages.add(imgPath)
          const fileName = path.basename(imgPath)
          if (fileName) usedImages.add(fileName)
        }
      }
      if (row.images) {
        try {
          const images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images
          if (Array.isArray(images)) {
            images.forEach((img: string) => {
              if (img && !img.startsWith('http')) {
                let imgPath = img
                  .replace(/^\/uploads\/images\//, '')
                  .replace(/^\/images\//, '')
                  .replace(/^\/uploads\//, '')
                  .replace(/^uploads\/images\//, '')
                  .replace(/^images\//, '')
                  .trim()
                if (imgPath) {
                  usedImages.add(imgPath)
                  const fileName = path.basename(imgPath)
                  if (fileName) usedImages.add(fileName)
                }
              }
            })
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }

    // Procesar stores
    for (const row of storesResult.rows) {
      if (row.logo_url) {
        let imgPath = row.logo_url
          .replace(/^\/uploads\/images\//, '')
          .replace(/^\/images\//, '')
          .replace(/^\/uploads\//, '')
          .replace(/^uploads\/images\//, '')
          .replace(/^images\//, '')
          .trim()
        if (imgPath && !imgPath.startsWith('http')) {
          usedImages.add(imgPath)
          const fileName = path.basename(imgPath)
          if (fileName) usedImages.add(fileName)
        }
      }
    }

    console.log(`✅ Imágenes utilizadas encontradas: ${usedImages.size}\n`)

    // Buscar todas las imágenes en public/uploads/ (y también en public/uploads/images/ si existe)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images')
    const uploadsRootDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!fs.existsSync(uploadsRootDir)) {
      console.log('⚠️  Directorio public/uploads/ no existe')
      return
    }

    const allImages: string[] = []
    
    // Función recursiva para obtener todos los archivos
    function getAllFiles(dir: string, baseDir: string): void {
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          getAllFiles(filePath, baseDir)
        } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
          const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/')
          allImages.push(relativePath)
        }
      }
    }

    // Buscar en public/uploads/images/ si existe
    if (fs.existsSync(uploadsDir)) {
      getAllFiles(uploadsDir, uploadsDir)
    }
    
    // También buscar en public/uploads/ directamente
    if (fs.existsSync(uploadsRootDir)) {
      const rootFiles = fs.readdirSync(uploadsRootDir)
      for (const file of rootFiles) {
        const filePath = path.join(uploadsRootDir, file)
        const stat = fs.statSync(filePath)
        if (stat.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
          // Agregar como ruta relativa desde uploadsRootDir
          allImages.push(file)
        } else if (stat.isDirectory() && file !== 'images') {
          // Buscar en subdirectorios (excepto 'images' que ya se procesó)
          getAllFiles(filePath, uploadsRootDir)
        }
      }
    }

    console.log(`📁 Imágenes encontradas en el sistema de archivos: ${allImages.length}\n`)

    // Crear un conjunto normalizado de imágenes usadas (sin rutas, solo nombres)
    const usedImageNames = new Set<string>()
    usedImages.forEach(img => {
      // Normalizar: quitar rutas, solo nombre de archivo
      const normalized = img
        .replace(/^.*[\\\/]/, '') // Quitar cualquier ruta
        .toLowerCase()
        .trim()
      if (normalized) {
        usedImageNames.add(normalized)
        // También agregar la versión original para comparación exacta
        usedImageNames.add(img.toLowerCase().trim())
      }
    })

    console.log(`📝 Nombres de imágenes utilizadas (normalizados): ${usedImageNames.size}`)
    console.log('📋 Primeras 10 imágenes utilizadas:')
    Array.from(usedImageNames).slice(0, 10).forEach(img => console.log(`   - ${img}`))
    console.log()

    // Encontrar imágenes no utilizadas
    const unusedImages: string[] = []
    let totalSize = 0

    for (const image of allImages) {
      const imageName = path.basename(image).toLowerCase().trim()
      const imageRelativePath = image.toLowerCase().trim()
      
      // Verificar si la imagen se usa (comparación más precisa)
      const isUsed = usedImageNames.has(imageName) || 
                     usedImageNames.has(imageRelativePath) ||
                     Array.from(usedImageNames).some(used => {
                       // Comparación más flexible pero segura
                       const usedBase = path.basename(used).toLowerCase()
                       const imageBase = imageName
                       return usedBase === imageBase || 
                              used.includes(imageBase) || 
                              imageBase.includes(usedBase)
                     })

      if (!isUsed) {
        unusedImages.push(image)
        // Calcular el tamaño correctamente
        let fullPath: string
        if (image.startsWith('public/')) {
          fullPath = path.join(process.cwd(), image)
        } else {
          // Intentar primero en uploadsRootDir, luego en uploadsDir
          fullPath = path.join(uploadsRootDir, image)
          if (!fs.existsSync(fullPath) && fs.existsSync(uploadsDir)) {
            fullPath = path.join(uploadsDir, image)
          }
        }
        
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath)
          totalSize += stats.size
        }
      }
    }

    console.log(`🗑️  Imágenes no utilizadas encontradas: ${unusedImages.length}`)
    console.log(`💾 Tamaño total a eliminar: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`)

    if (unusedImages.length === 0) {
      console.log('✅ No hay imágenes no utilizadas para eliminar')
      return
    }

    // Mostrar las primeras 20 imágenes no utilizadas
    console.log('📋 Primeras imágenes no utilizadas:')
    unusedImages.slice(0, 20).forEach(img => {
      const fileName = path.basename(img)
      console.log(`   - ${fileName} (${img})`)
    })
    if (unusedImages.length > 20) {
      console.log(`   ... y ${unusedImages.length - 20} más\n`)
    }

    // Preguntar confirmación antes de eliminar (solo mostrar, no eliminar automáticamente)
    console.log(`\n⚠️  ADVERTENCIA: Se eliminarán ${unusedImages.length} imágenes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`)
    console.log('   Para confirmar, ejecuta el script con el flag --confirm\n')
    
    // Solo eliminar si se pasa el flag --confirm
    const shouldDelete = process.argv.includes('--confirm')
    if (!shouldDelete) {
      console.log('💡 Ejecuta: npx tsx scripts/clean-unused-images.ts --confirm')
      console.log('   para eliminar las imágenes no utilizadas\n')
      return
    }

    // Eliminar imágenes no utilizadas
    let deleted = 0
    let deletedSize = 0
    let errors = 0

    for (const image of unusedImages) {
      try {
        // Construir la ruta completa correctamente
        let fullPath: string
        if (image.startsWith('public/')) {
          fullPath = path.join(process.cwd(), image)
        } else if (path.isAbsolute(image)) {
          fullPath = image
        } else {
          // Intentar primero en uploads/images, luego en uploads/
          fullPath = path.join(uploadsDir, image)
          if (!fs.existsSync(fullPath)) {
            fullPath = path.join(uploadsRootDir, image)
          }
        }
        
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath)
          fs.unlinkSync(fullPath)
          deleted++
          deletedSize += stats.size
          
          // Mostrar progreso cada 100 imágenes
          if (deleted % 100 === 0) {
            console.log(`   Eliminadas ${deleted}/${unusedImages.length} imágenes...`)
          }
        }
      } catch (error: any) {
        console.error(`❌ Error eliminando ${image}:`, error.message)
        errors++
      }
    }

    console.log(`\n✅ Eliminadas ${deleted} imágenes (${(deletedSize / 1024 / 1024).toFixed(2)} MB)`)
    if (errors > 0) {
      console.log(`⚠️  Errores: ${errors}`)
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Ejecutar
cleanUnusedImages()
  .then(() => {
    console.log('\n✅ Limpieza completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

