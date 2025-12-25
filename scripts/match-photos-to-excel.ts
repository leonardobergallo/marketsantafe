// Script para asociar fotos con productos del Excel y actualizar el Excel
import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

interface PhotoMatch {
  productIndex: number
  productTitle: string
  photoField: string // 'foto_principal', 'foto_2', etc.
  matchedPhoto: string
  confidence: 'exact' | 'similar' | 'manual'
}

async function matchPhotosToExcel() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const csvPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales.csv')
    const outputPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales_actualizado.csv')

    // Leer CSV
    console.log('📖 Leyendo CSV...\n')
    const buffer = await fs.readFile(csvPath)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

    if (rows.length === 0) {
      console.error('❌ El CSV está vacío')
      return
    }

    console.log(`📊 Encontrados ${rows.length} productos en el CSV\n`)

    // Leer fotos disponibles
    const allFiles = await fs.readdir(uploadsDir)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext) &&
             !file.includes('listado') // Excluir archivos CSV/Excel
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} fotos disponibles\n`)

    // Crear mapa de fotos ya renombradas (que tienen nombres de productos)
    const renamedPhotos = new Map<string, string>() // nombre_archivo -> nombre_producto_normalizado
    imageFiles.forEach(file => {
      // Si el archivo tiene formato producto_principal o producto_foto_X
      const match = file.match(/^(.+?)_(principal|foto_\d+)/i)
      if (match) {
        const productName = match[1]
        renamedPhotos.set(file, productName.toLowerCase().replace(/[^a-z0-9]/g, ''))
      }
    })

    console.log(`✅ Encontradas ${renamedPhotos.size} fotos ya renombradas con nombres de productos\n`)

    // Función para normalizar nombre de producto
    function normalizeProductName(name: string): string {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 50)
    }

    // Asociar fotos con productos
    const matches: PhotoMatch[] = []
    const unmatchedProducts: Array<{ index: number; title: string; photoField: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const titulo = (row.titulo || row.title || '').toString().trim()
      if (!titulo) continue

      const normalizedTitle = normalizeProductName(titulo)

      // Buscar foto_principal
      const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()
      if (fotoPrincipal) {
        // Primero buscar si existe una foto ya renombrada que coincida
        let matchedPhoto: string | null = null
        let confidence: 'exact' | 'similar' | 'manual' = 'manual'

        // Buscar foto renombrada que coincida con el producto
        for (const [photoFile, productName] of renamedPhotos.entries()) {
          if (productName === normalizedTitle || 
              productName.includes(normalizedTitle.substring(0, 20)) ||
              normalizedTitle.includes(productName.substring(0, 20))) {
            matchedPhoto = photoFile
            confidence = 'exact'
            break
          }
        }

        // Si no se encontró, buscar por nombre original en las fotos disponibles
        if (!matchedPhoto) {
          const exactMatch = imageFiles.find(img => 
            img.toLowerCase() === fotoPrincipal.toLowerCase()
          )
          if (exactMatch) {
            matchedPhoto = exactMatch
            confidence = 'exact'
          }
        }

        // Si aún no se encontró, buscar por nombre base (sin extensión)
        if (!matchedPhoto) {
          const searchBase = path.basename(fotoPrincipal, path.extname(fotoPrincipal)).toLowerCase()
          const similar = imageFiles.find(img => {
            const imgBase = path.basename(img, path.extname(img)).toLowerCase()
            return imgBase === searchBase || 
                   imgBase.includes(searchBase) || 
                   searchBase.includes(imgBase)
          })
          if (similar) {
            matchedPhoto = similar
            confidence = 'similar'
          }
        }

        if (matchedPhoto) {
          matches.push({
            productIndex: i,
            productTitle: titulo,
            photoField: 'foto_principal',
            matchedPhoto,
            confidence
          })
          // Actualizar el row
          row.foto_principal = matchedPhoto
        } else {
          unmatchedProducts.push({
            index: i,
            title: titulo,
            photoField: 'foto_principal'
          })
        }
      }

      // Buscar fotos adicionales (foto_2 hasta foto_10)
      for (let j = 2; j <= 10; j++) {
        const fotoKey = `foto_${j}`
        const foto = (row[fotoKey] || row[`foto${j}`] || '').toString().trim()
        if (!foto) continue

        let matchedPhoto: string | null = null
        let confidence: 'exact' | 'similar' | 'manual' = 'manual'

        // Buscar foto exacta
        const exactMatch = imageFiles.find(img => 
          img.toLowerCase() === foto.toLowerCase()
        )
        if (exactMatch) {
          matchedPhoto = exactMatch
          confidence = 'exact'
        } else {
          // Buscar por nombre base
          const searchBase = path.basename(foto, path.extname(foto)).toLowerCase()
          const similar = imageFiles.find(img => {
            const imgBase = path.basename(img, path.extname(img)).toLowerCase()
            return imgBase === searchBase || 
                   imgBase.includes(searchBase) || 
                   searchBase.includes(imgBase)
          })
          if (similar) {
            matchedPhoto = similar
            confidence = 'similar'
          }
        }

        if (matchedPhoto) {
          matches.push({
            productIndex: i,
            productTitle: titulo,
            photoField: fotoKey,
            matchedPhoto,
            confidence
          })
          row[fotoKey] = matchedPhoto
        } else {
          unmatchedProducts.push({
            index: i,
            title: titulo,
            photoField: fotoKey
          })
        }
      }
    }

    // Mostrar resultados
    console.log('📊 RESULTADOS DE ASOCIACIÓN:\n')
    console.log(`✅ Coincidencias encontradas: ${matches.length}`)
    console.log(`   - Exactas: ${matches.filter(m => m.confidence === 'exact').length}`)
    console.log(`   - Similares: ${matches.filter(m => m.confidence === 'similar').length}`)
    console.log(`   - Manuales: ${matches.filter(m => m.confidence === 'manual').length}`)
    console.log(`\n⚠️  Sin coincidencia: ${unmatchedProducts.length}\n`)

    if (unmatchedProducts.length > 0) {
      console.log('📋 Productos sin foto encontrada:')
      unmatchedProducts.forEach(({ index, title, photoField }) => {
        console.log(`   Fila ${index + 2}: ${title} - ${photoField}`)
      })
      console.log('')
    }

    // Mostrar algunas coincidencias de ejemplo
    if (matches.length > 0) {
      console.log('✅ Primeras 10 coincidencias:')
      matches.slice(0, 10).forEach(match => {
        console.log(`   ${match.productTitle} → ${match.matchedPhoto} (${match.confidence})`)
      })
      console.log('')
    }

    // Guardar CSV actualizado
    console.log('💾 Guardando CSV actualizado...\n')
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, workbook.SheetNames[0])
    
    await fs.writeFile(outputPath, XLSX.write(newWorkbook, { type: 'buffer', bookType: 'csv' }))

    console.log(`✅ CSV actualizado guardado en: ${outputPath}\n`)
    console.log(`📊 Resumen:`)
    console.log(`   - Total de productos: ${rows.length}`)
    console.log(`   - Fotos asociadas: ${matches.length}`)
    console.log(`   - Fotos sin asociar: ${unmatchedProducts.length}`)
    console.log(`\n💡 Usa el archivo "${path.basename(outputPath)}" para importar`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

matchPhotosToExcel()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })



