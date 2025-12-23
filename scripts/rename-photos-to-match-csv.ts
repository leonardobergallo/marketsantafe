// Script para renombrar las fotos actuales según los nombres del CSV actualizado
import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

async function renamePhotosToMatchCSV() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const csvPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales_actualizado.csv')

    // Leer CSV actualizado
    console.log('📖 Leyendo CSV actualizado...\n')
    const csvBuffer = await fs.readFile(csvPath)
    const csvWorkbook = XLSX.read(csvBuffer, { type: 'buffer' })
    const csvSheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]]
    const csvRows: any[] = XLSX.utils.sheet_to_json(csvSheet, { raw: false })

    if (csvRows.length === 0) {
      console.error('❌ El CSV está vacío')
      return
    }

    console.log(`📊 Encontrados ${csvRows.length} productos en el CSV\n`)

    // Leer fotos disponibles
    const allFiles = await fs.readdir(uploadsDir)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext) &&
             !file.includes('listado') && 
             !file.includes('guia') // Excluir archivos CSV/Excel
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} fotos disponibles\n`)

    // Crear mapa de fotos ya renombradas (para no renombrarlas de nuevo)
    const alreadyRenamed = new Set<string>()
    imageFiles.forEach(file => {
      // Si el archivo ya tiene un nombre de producto (no es foto_X), no lo renombramos
      if (!file.match(/^foto_\d+\./i) && 
          (file.includes('_principal') || file.includes('_foto_'))) {
        alreadyRenamed.add(file.toLowerCase())
      }
    })

    console.log(`✅ ${alreadyRenamed.size} fotos ya tienen nombres de productos\n`)

    // Crear lista de fotos disponibles para renombrar (foto_X)
    const photosToRename = imageFiles.filter(file => 
      file.match(/^foto_\d+\./i) && !alreadyRenamed.has(file.toLowerCase())
    )

    console.log(`📝 Fotos disponibles para renombrar: ${photosToRename.length}\n`)

    // Crear mapeo de renombres
    const renameMap = new Map<string, { newName: string; product: string; field: string }>()
    const usedNames = new Set<string>()
    const unmatchedPhotos: string[] = []

    // Procesar cada producto del CSV
    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i]
      const titulo = (row.titulo || row.title || '').toString().trim()
      if (!titulo) continue

      const normalizedTitle = normalizeFileName(titulo)

      // Procesar foto_principal
      const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()
      if (fotoPrincipal) {
        // Verificar si la foto ya existe con ese nombre
        const exists = imageFiles.some(img => 
          img.toLowerCase() === fotoPrincipal.toLowerCase()
        )

        if (!exists) {
          // Buscar una foto disponible para renombrar
          // Priorizar fotos que aún no han sido asignadas
          let photoToRename = photosToRename.find(photo => !renameMap.has(photo))

          if (photoToRename) {
            const ext = path.extname(photoToRename) || path.extname(fotoPrincipal) || '.jpg'
            let newName = fotoPrincipal

            // Si el nombre ya está en uso, agregar sufijo
            let counter = 1
            while (usedNames.has(newName.toLowerCase()) || 
                   imageFiles.some(img => img.toLowerCase() === newName.toLowerCase())) {
              const baseName = path.basename(fotoPrincipal, path.extname(fotoPrincipal))
              newName = `${baseName}_${counter}${ext}`
              counter++
            }

            usedNames.add(newName.toLowerCase())
            renameMap.set(photoToRename, {
              newName,
              product: titulo,
              field: 'foto_principal'
            })
          } else {
            unmatchedPhotos.push(`Fila ${i + 2}: ${fotoPrincipal} (${titulo}) - foto_principal`)
          }
        }
      }

      // Procesar fotos adicionales (foto_2 hasta foto_10)
      for (let j = 2; j <= 10; j++) {
        const fotoKey = `foto_${j}`
        const foto = (row[fotoKey] || row[`foto${j}`] || '').toString().trim()
        if (!foto) continue

        // Verificar si la foto ya existe
        const exists = imageFiles.some(img => 
          img.toLowerCase() === foto.toLowerCase()
        )

        if (!exists) {
          // Buscar una foto disponible
          let photoToRename = photosToRename.find(photo => !renameMap.has(photo))

          if (photoToRename) {
            const ext = path.extname(photoToRename) || path.extname(foto) || '.jpg'
            let newName = foto

            let counter = 1
            while (usedNames.has(newName.toLowerCase()) || 
                   imageFiles.some(img => img.toLowerCase() === newName.toLowerCase())) {
              const baseName = path.basename(foto, path.extname(foto))
              newName = `${baseName}_${counter}${ext}`
              counter++
            }

            usedNames.add(newName.toLowerCase())
            renameMap.set(photoToRename, {
              newName,
              product: titulo,
              field: fotoKey
            })
          } else {
            unmatchedPhotos.push(`Fila ${i + 2}: ${foto} (${titulo}) - ${fotoKey}`)
          }
        }
      }
    }

    if (renameMap.size === 0) {
      console.log('⚠️  No se encontraron fotos para renombrar')
      if (unmatchedPhotos.length > 0) {
        console.log('\n📋 Fotos del CSV que no se pudieron asociar:')
        unmatchedPhotos.forEach(photo => console.log(`   ${photo}`))
      }
      return
    }

    console.log(`📝 Se renombrarán ${renameMap.size} fotos:\n`)
    
    // Mostrar preview
    renameMap.forEach(({ newName, product, field }, oldName) => {
      console.log(`   "${oldName}" → "${newName}"`)
      console.log(`      Producto: ${product} (${field})`)
    })

    if (unmatchedPhotos.length > 0) {
      console.log('\n⚠️  Fotos del CSV que no se pudieron asociar (no hay fotos disponibles):')
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

        // Verificar que el nuevo nombre no existe
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
    if (unmatchedPhotos.length > 0) {
      console.log(`⚠️  Fotos sin asociar: ${unmatchedPhotos.length}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

renamePhotosToMatchCSV()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })


