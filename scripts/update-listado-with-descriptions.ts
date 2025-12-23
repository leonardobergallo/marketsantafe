// Script para actualizar listado_final_con_fotos_originales con descripciones y datos completos
import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

async function updateListadoWithDescriptions() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Buscar el archivo listado_final_con_fotos_originales
    const possibleFiles = [
      'listado_final_con_fotos_originales.xlsx',
      'listado_final_con_fotos_originales.csv',
    ]
    
    let listadoPath: string | null = null
    for (const fileName of possibleFiles) {
      const filePath = path.join(uploadsDir, fileName)
      try {
        await fs.access(filePath)
        listadoPath = filePath
        console.log(`📄 Usando archivo: ${fileName}\n`)
        break
      } catch {
        // Continuar buscando
      }
    }

    if (!listadoPath) {
      console.error('❌ No se encontró el archivo listado_final_con_fotos_originales')
      console.log('💡 Archivos buscados:', possibleFiles.join(', '))
      return
    }

    // Leer el listado
    console.log('📖 Leyendo listado...\n')
    const listadoBuffer = await fs.readFile(listadoPath)
    const listadoWorkbook = XLSX.read(listadoBuffer, { type: 'buffer' })
    const listadoSheet = listadoWorkbook.Sheets[listadoWorkbook.SheetNames[0]]
    const listadoRows: any[] = XLSX.utils.sheet_to_json(listadoSheet, { raw: false })

    if (listadoRows.length === 0) {
      console.error('❌ El listado está vacío')
      return
    }

    console.log(`📊 Encontrados ${listadoRows.length} productos en el listado\n`)

    // Mostrar estructura actual
    if (listadoRows.length > 0) {
      console.log('📋 Columnas actuales:')
      Object.keys(listadoRows[0]).forEach(key => {
        console.log(`   - ${key}`)
      })
      console.log('')
    }

    // Buscar archivos con descripciones (guía o CSV actualizado)
    const guidePath = path.join(uploadsDir, 'guia_masivo_productos_fotos.xlsx')
    const csvPath = path.join(uploadsDir, 'listado_final_corregido_fotos_originales_actualizado.csv')
    
    let descriptionsMap = new Map<string, any>()

    // Intentar leer la guía
    try {
      const guideBuffer = await fs.readFile(guidePath)
      const guideWorkbook = XLSX.read(guideBuffer, { type: 'buffer' })
      const guideSheet = guideWorkbook.Sheets[guideWorkbook.SheetNames[0]]
      const guideRows: any[] = XLSX.utils.sheet_to_json(guideSheet, { raw: false })
      
      guideRows.forEach(row => {
        const titulo = (row.titulo || row.title || '').toString().trim()
        if (titulo) {
          descriptionsMap.set(titulo.toLowerCase(), {
            titulo,
            descripcion: (row.descripcion || row.description || '').toString().trim(),
            categoria: (row.categoria || row.category || '').toString().trim(),
            zona: (row.zona || row.zone || '').toString().trim(),
            precio: row.precio || row.price || '',
            moneda: (row.moneda || row.currency || 'ARS').toString().trim(),
            condicion: (row.condicion || row.condition || '').toString().trim(),
            whatsapp: (row.whatsapp || '').toString().trim(),
          })
        }
      })
      console.log(`✅ Cargadas ${descriptionsMap.size} descripciones de la guía\n`)
    } catch {
      console.log('⚠️  No se encontró la guía, intentando con CSV...\n')
    }

    // Si no hay guía, intentar con CSV
    if (descriptionsMap.size === 0) {
      try {
        const csvBuffer = await fs.readFile(csvPath)
        const csvWorkbook = XLSX.read(csvBuffer, { type: 'buffer' })
        const csvSheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]]
        const csvRows: any[] = XLSX.utils.sheet_to_json(csvSheet, { raw: false })
        
        csvRows.forEach(row => {
          const titulo = (row.titulo || row.title || '').toString().trim()
          if (titulo) {
            descriptionsMap.set(titulo.toLowerCase(), {
              titulo,
              descripcion: (row.descripcion || row.description || '').toString().trim(),
              categoria: (row.categoria || row.category || '').toString().trim(),
              zona: (row.zona || row.zone || '').toString().trim(),
              precio: row.precio || row.price || '',
              moneda: (row.moneda || row.currency || 'ARS').toString().trim(),
              condicion: (row.condicion || row.condition || '').toString().trim(),
              whatsapp: (row.whatsapp || '').toString().trim(),
            })
          }
        })
        console.log(`✅ Cargadas ${descriptionsMap.size} descripciones del CSV\n`)
      } catch {
        console.log('⚠️  No se encontró el CSV con descripciones\n')
      }
    }

    // Actualizar cada fila del listado
    let updatedCount = 0

    for (let i = 0; i < listadoRows.length; i++) {
      const row = listadoRows[i]
      const titulo = (row.titulo || row.title || '').toString().trim()
      
      if (!titulo) continue

      // Buscar descripción en el mapa
      let descriptionData = descriptionsMap.get(titulo.toLowerCase())
      
      // Si no hay coincidencia exacta, buscar parcial
      if (!descriptionData) {
        for (const [key, value] of descriptionsMap.entries()) {
          if (titulo.toLowerCase().includes(key) || 
              key.includes(titulo.toLowerCase()) ||
              titulo.toLowerCase().replace(/[^a-z0-9]/g, '') === key.replace(/[^a-z0-9]/g, '')) {
            descriptionData = value
            break
          }
        }
      }

      if (descriptionData) {
        let rowUpdated = false

        // Actualizar descripción si no existe o está vacía
        if (!row.descripcion || row.descripcion.toString().trim() === '') {
          if (descriptionData.descripcion) {
            row.descripcion = descriptionData.descripcion
            rowUpdated = true
          }
        }

        // Actualizar categoría si no existe
        if (!row.categoria || row.categoria.toString().trim() === '') {
          if (descriptionData.categoria) {
            row.categoria = descriptionData.categoria
            rowUpdated = true
          }
        }

        // Actualizar zona si no existe
        if (!row.zona || row.zona.toString().trim() === '') {
          if (descriptionData.zona) {
            row.zona = descriptionData.zona
            rowUpdated = true
          }
        }

        // Actualizar precio si no existe
        if (!row.precio || row.precio.toString().trim() === '') {
          if (descriptionData.precio) {
            row.precio = descriptionData.precio
            rowUpdated = true
          }
        }

        // Actualizar moneda si no existe
        if (!row.moneda || row.moneda.toString().trim() === '') {
          if (descriptionData.moneda) {
            row.moneda = descriptionData.moneda
            rowUpdated = true
          }
        }

        // Actualizar condición si no existe
        if (!row.condicion || row.condicion.toString().trim() === '') {
          if (descriptionData.condicion) {
            row.condicion = descriptionData.condicion
            rowUpdated = true
          }
        }

        // Actualizar WhatsApp si no existe
        if (!row.whatsapp || row.whatsapp.toString().trim() === '') {
          if (descriptionData.whatsapp) {
            row.whatsapp = descriptionData.whatsapp
            rowUpdated = true
          }
        }

        if (rowUpdated) {
          updatedCount++
          console.log(`   ✅ Fila ${i + 2}: ${titulo}`)
        }
      } else {
        console.log(`   ⚠️  Fila ${i + 2}: "${titulo}" no encontrado en las descripciones`)
      }
    }

    console.log('\n📊 RESUMEN:')
    console.log(`✅ Filas actualizadas: ${updatedCount}`)
    console.log(`📦 Total procesadas: ${listadoRows.length}\n`)

    // Guardar archivo actualizado
    const outputPath = path.join(uploadsDir, 'listado_final_con_fotos_originales_actualizado.xlsx')
    console.log('💾 Guardando archivo actualizado...\n')
    
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(listadoRows)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, listadoWorkbook.SheetNames[0])
    
    await fs.writeFile(outputPath, XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' }))

    console.log(`✅ Archivo actualizado guardado en: ${path.basename(outputPath)}\n`)
    console.log(`💡 Usa este archivo para subir las fotos manualmente`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

updateListadoWithDescriptions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })


