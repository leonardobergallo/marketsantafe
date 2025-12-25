// Script para actualizar el Excel con los nombres de fotos de la guía
import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

async function updateExcelFromGuide() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const guidePath = path.join(uploadsDir, 'guia_masivo_productos_fotos.xlsx')
    const csvPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales.csv')
    const outputPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales_actualizado.csv')

    // Leer la guía
    console.log('📖 Leyendo guía de productos y fotos...\n')
    const guideBuffer = await fs.readFile(guidePath)
    const guideWorkbook = XLSX.read(guideBuffer, { type: 'buffer' })
    const guideSheet = guideWorkbook.Sheets[guideWorkbook.SheetNames[0]]
    const guideRows: any[] = XLSX.utils.sheet_to_json(guideSheet, { raw: false })

    if (guideRows.length === 0) {
      console.error('❌ La guía está vacía')
      return
    }

    console.log(`📊 Encontrados ${guideRows.length} productos en la guía\n`)

    // Mostrar estructura de la primera fila para entender el formato
    if (guideRows.length > 0) {
      console.log('📋 Estructura de la guía (primera fila):')
      const firstRow = guideRows[0]
      Object.keys(firstRow).forEach(key => {
        console.log(`   - ${key}: ${firstRow[key]}`)
      })
      console.log('')
    }

    // Leer el CSV actual
    console.log('📖 Leyendo CSV actual...\n')
    const csvBuffer = await fs.readFile(csvPath)
    const csvWorkbook = XLSX.read(csvBuffer, { type: 'buffer' })
    const csvSheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]]
    const csvRows: any[] = XLSX.utils.sheet_to_json(csvSheet, { raw: false })

    if (csvRows.length === 0) {
      console.error('❌ El CSV está vacío')
      return
    }

    console.log(`📊 Encontrados ${csvRows.length} productos en el CSV\n`)

    // Crear un mapa de la guía: título -> fotos
    const guideMap = new Map<string, any>()
    guideRows.forEach((row, index) => {
      const titulo = (row.titulo || row.title || row.producto || row.nombre || '').toString().trim()
      if (titulo) {
        guideMap.set(titulo.toLowerCase(), {
          titulo,
          foto_principal: (row.foto_principal || row.fotoPrincipal || row.foto_1 || row.foto1 || '').toString().trim(),
          foto_2: (row.foto_2 || row.foto2 || '').toString().trim(),
          foto_3: (row.foto_3 || row.foto3 || '').toString().trim(),
          foto_4: (row.foto_4 || row.foto4 || '').toString().trim(),
          foto_5: (row.foto_5 || row.foto5 || '').toString().trim(),
          foto_6: (row.foto_6 || row.foto6 || '').toString().trim(),
          foto_7: (row.foto_7 || row.foto7 || '').toString().trim(),
          foto_8: (row.foto_8 || row.foto8 || '').toString().trim(),
          foto_9: (row.foto_9 || row.foto9 || '').toString().trim(),
          foto_10: (row.foto_10 || row.foto10 || '').toString().trim(),
          rowIndex: index + 2
        })
      }
    })

    console.log(`✅ Mapa creado con ${guideMap.size} productos de la guía\n`)

    // Actualizar el CSV con las fotos de la guía
    let updatedCount = 0
    let notFoundCount = 0

    for (let i = 0; i < csvRows.length; i++) {
      const csvRow = csvRows[i]
      const csvTitulo = (csvRow.titulo || csvRow.title || '').toString().trim()
      
      if (!csvTitulo) continue

      // Buscar en la guía (coincidencia exacta o parcial)
      let guideEntry = guideMap.get(csvTitulo.toLowerCase())
      
      // Si no hay coincidencia exacta, buscar parcial
      if (!guideEntry) {
        for (const [guideTitle, entry] of guideMap.entries()) {
          if (csvTitulo.toLowerCase().includes(guideTitle) || 
              guideTitle.includes(csvTitulo.toLowerCase()) ||
              csvTitulo.toLowerCase().replace(/[^a-z0-9]/g, '') === guideTitle.replace(/[^a-z0-9]/g, '')) {
            guideEntry = entry
            break
          }
        }
      }

      if (guideEntry) {
        // Actualizar las fotos
        let rowUpdated = false

        if (guideEntry.foto_principal) {
          csvRow.foto_principal = guideEntry.foto_principal
          rowUpdated = true
        }

        for (let j = 2; j <= 10; j++) {
          const fotoKey = `foto_${j}`
          if (guideEntry[fotoKey]) {
            csvRow[fotoKey] = guideEntry[fotoKey]
            rowUpdated = true
          }
        }

        if (rowUpdated) {
          updatedCount++
          console.log(`   ✅ Fila ${i + 2}: ${csvTitulo}`)
          console.log(`      → foto_principal: ${guideEntry.foto_principal || 'N/A'}`)
        }
      } else {
        notFoundCount++
        console.log(`   ⚠️  Fila ${i + 2}: "${csvTitulo}" no encontrado en la guía`)
      }
    }

    console.log('\n📊 RESUMEN:')
    console.log(`✅ Productos actualizados: ${updatedCount}`)
    console.log(`⚠️  Productos no encontrados en la guía: ${notFoundCount}`)
    console.log(`📦 Total procesados: ${csvRows.length}\n`)

    // Guardar CSV actualizado
    console.log('💾 Guardando CSV actualizado...\n')
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(csvRows)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, csvWorkbook.SheetNames[0])
    
    await fs.writeFile(outputPath, XLSX.write(newWorkbook, { type: 'buffer', bookType: 'csv' }))

    console.log(`✅ CSV actualizado guardado en: ${path.basename(outputPath)}\n`)
    console.log(`💡 Usa el archivo "${path.basename(outputPath)}" para importar`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

updateExcelFromGuide()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })



