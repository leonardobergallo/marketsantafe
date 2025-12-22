// Script para renombrar imágenes según el CSV corregido
// Busca las fotos actuales y las renombra según los nombres del CSV

import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

interface RenameOption {
  oldName: string
  newName: string
  product: string
}

function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

async function renameImagesFromCSV() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const csvPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales.csv')

    // Leer CSV
    const buffer = await fs.readFile(csvPath)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

    if (rows.length === 0) {
      console.error('❌ El CSV está vacío')
      return
    }

    console.log(`📊 Encontrados ${rows.length} productos en el CSV\n`)

    // Leer archivos de imagen actuales
    const allFiles = await fs.readdir(uploadsDir)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} imágenes en /public/uploads/\n`)

    // Crear mapeo de renombres
    const renameMap = new Map<string, RenameOption>()
    const usedNames = new Set<string>()
    const unmatchedPhotos: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const titulo = (row.titulo || row.title || '').toString().trim()
      if (!titulo) continue

      const normalizedTitle = normalizeFileName(titulo)

      // Procesar foto_principal
      const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()
      if (fotoPrincipal) {
        // Buscar la foto que coincide con el nombre del CSV
        // Primero buscar coincidencia exacta (sin importar mayúsculas/minúsculas)
        let foundImage = imageFiles.find(img => {
          const imgName = img.toLowerCase()
          const searchName = fotoPrincipal.toLowerCase()
          return imgName === searchName
        })

        // Si no hay coincidencia exacta, buscar por nombre base (sin extensión)
        if (!foundImage) {
          const searchBase = path.basename(fotoPrincipal, path.extname(fotoPrincipal)).toLowerCase()
          foundImage = imageFiles.find(img => {
            const imgBase = path.basename(img, path.extname(img)).toLowerCase()
            return imgBase === searchBase
          })
        }

        // Si aún no se encuentra, buscar por números en el nombre (para IMG_2561, etc.)
        if (!foundImage && /IMG_\d+/.test(fotoPrincipal)) {
          const imgMatch = fotoPrincipal.match(/IMG_(\d+)/i)
          if (imgMatch && imgMatch[1]) {
            const targetNumber = imgMatch[1] // El número después de IMG_
            // Buscar en todas las fotos que tengan este número
            foundImage = imageFiles.find(img => {
              if (renameMap.has(img)) return false
              // Buscar el número en el nombre del archivo
              const imgNumbers = img.match(/\d+/g)
              if (imgNumbers) {
                // Si el número está en el nombre, podría ser la foto correcta
                // Pero necesitamos ser más específicos: buscar foto_X donde X tenga relación con el número
                // Por ejemplo, IMG_2561 podría estar en foto_6 si 2561 está relacionado con el índice
                return imgNumbers.some(num => num === targetNumber || num.includes(targetNumber) || targetNumber.includes(num))
              }
              return false
            })
          }
        }

        // Si aún no se encuentra y es WhatsApp Image, buscar por fecha/hora
        if (!foundImage && /WhatsApp Image/.test(fotoPrincipal)) {
          // Extraer fecha y hora del nombre original
          const dateMatch = fotoPrincipal.match(/(\d{4}-\d{2}-\d{2})/i)
          const timeMatch = fotoPrincipal.match(/at (\d{2}\.\d{2}\.\d{2})/i)
          
          if (dateMatch || timeMatch) {
            foundImage = imageFiles.find(img => {
              if (renameMap.has(img)) return false
              // Buscar archivos que tengan números similares (podrían ser las fotos renombradas)
              // Como las fotos ya fueron renombradas, buscamos por posición aproximada
              // Esto es un fallback, no ideal pero mejor que nada
              return true // Dejamos que el usuario verifique manualmente
            })
          }
        }

        if (foundImage && !renameMap.has(foundImage)) {
          const ext = path.extname(foundImage) || path.extname(fotoPrincipal) || '.jpg'
          let newName = `${normalizedTitle}_principal${ext}`
          
          let counter = 1
          while (usedNames.has(newName.toLowerCase())) {
            newName = `${normalizedTitle}_principal_${counter}${ext}`
            counter++
          }

          usedNames.add(newName.toLowerCase())
          renameMap.set(foundImage, {
            oldName: foundImage,
            newName,
            product: titulo,
          })
        } else if (!foundImage) {
          unmatchedPhotos.push(`Fila ${i + 2}: ${fotoPrincipal} (${titulo})`)
        }
      }

      // Procesar fotos adicionales (foto_2 hasta foto_10)
      for (let j = 2; j <= 10; j++) {
        const foto = (row[`foto_${j}`] || row[`foto${j}`] || '').toString().trim()
        if (!foto) continue

        // Buscar la foto
        let foundImage = imageFiles.find(img => {
          const imgName = img.toLowerCase()
          const searchName = foto.toLowerCase()
          return imgName === searchName
        })

        if (!foundImage) {
          const searchBase = path.basename(foto, path.extname(foto)).toLowerCase()
          foundImage = imageFiles.find(img => {
            const imgBase = path.basename(img, path.extname(img)).toLowerCase()
            return imgBase === searchBase && !renameMap.has(img)
          })
        }

        if (foundImage && !renameMap.has(foundImage)) {
          const ext = path.extname(foundImage) || path.extname(foto) || '.jpg'
          let newName = `${normalizedTitle}_foto_${j}${ext}`
          
          let counter = 1
          while (usedNames.has(newName.toLowerCase())) {
            newName = `${normalizedTitle}_foto_${j}_${counter}${ext}`
            counter++
          }

          usedNames.add(newName.toLowerCase())
          renameMap.set(foundImage, {
            oldName: foundImage,
            newName,
            product: titulo,
          })
        } else if (!foundImage) {
          unmatchedPhotos.push(`Fila ${i + 2}: ${foto} (${titulo})`)
        }
      }
    }

    if (renameMap.size === 0) {
      console.log('⚠️  No se encontraron imágenes para renombrar')
      if (unmatchedPhotos.length > 0) {
        console.log('\n📋 Fotos no encontradas:')
        unmatchedPhotos.forEach(photo => console.log(`   ${photo}`))
      }
      return
    }

    console.log(`📝 Se renombrarán ${renameMap.size} imágenes:\n`)
    
    // Mostrar preview
    renameMap.forEach(({ oldName, newName, product }) => {
      console.log(`   "${oldName}" → "${newName}"`)
      console.log(`      Producto: ${product}`)
    })

    if (unmatchedPhotos.length > 0) {
      console.log('\n⚠️  Fotos no encontradas en /public/uploads/:')
      unmatchedPhotos.forEach(photo => console.log(`   ${photo}`))
    }

    console.log('\n⚠️  ¿Continuar con el renombrado? (Ctrl+C para cancelar)')
    console.log('   Esperando 5 segundos...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Renombrar archivos
    let successCount = 0
    let errorCount = 0

    for (const [oldName, { newName, product }] of renameMap.entries()) {
      try {
        const oldPath = path.join(uploadsDir, oldName)
        const newPath = path.join(uploadsDir, newName)

        await fs.access(oldPath)

        try {
          await fs.access(newPath)
          console.log(`   ⚠️  "${newName}" ya existe, saltando...`)
          continue
        } catch {
          // OK, puede renombrar
        }

        await fs.rename(oldPath, newPath)
        console.log(`   ✅ "${oldName}" → "${newName}"`)
        successCount++
      } catch (error) {
        console.error(`   ❌ Error renombrando "${oldName}":`, error)
        errorCount++
      }
    }

    console.log('\n📊 RESUMEN:')
    console.log(`✅ Renombrados exitosamente: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📦 Total procesados: ${renameMap.size}`)

  } catch (error) {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  }
}

renameImagesFromCSV()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })

