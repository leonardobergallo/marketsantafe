// Script para actualizar el Excel con los nuevos nombres de las fotos renombradas
// Lee el Excel, busca las fotos renombradas y actualiza las columnas de fotos

import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

async function updateExcelWithRenamedImages() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const excelPath = path.join(process.cwd(), 'public', 'uploads', 'listado_final_con_fotos_originales.xlsx')
    const outputPath = path.join(process.cwd(), 'public', 'uploads', 'listado_final_actualizado.xlsx')

    // Verificar que existe el Excel
    let excelBuffer: Buffer
    try {
      excelBuffer = await fs.readFile(excelPath)
    } catch {
      console.error(`❌ No se encontró el archivo Excel en: ${excelPath}`)
      return
    }

    // Leer Excel
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })

    if (rows.length === 0) {
      console.error('❌ El Excel está vacío')
      return
    }

    console.log(`📊 Encontrados ${rows.length} productos en el Excel\n`)

    // Leer archivos de imagen renombrados
    const allFiles = await fs.readdir(uploadsDir)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} imágenes en /public/uploads/\n`)

    // Crear mapeo de nombres antiguos a nuevos
    const renameMap = new Map<string, string>()

    // Función para normalizar nombre (igual que en el script de renombrado)
    function normalizeTitle(titulo: string): string {
      return titulo
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
    }

    // Buscar imágenes renombradas (que terminan en _principal)
    for (const file of imageFiles) {
      if (file.includes('_principal')) {
        // Extraer el nombre base (sin _principal y sin extensión)
        const baseName = file.replace(/_principal.*$/, '').replace(/\.[^.]+$/, '')
        
        // Buscar en el Excel qué producto corresponde
        for (const row of rows) {
          const titulo = (row.titulo || row.title || '').toString().trim()
          if (!titulo) continue

          const normalizedTitle = normalizeTitle(titulo)
          
          if (normalizedTitle === baseName) {
            // Encontrar la foto original mencionada en el Excel
            const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()
            if (fotoPrincipal) {
              renameMap.set(fotoPrincipal, file)
            }
            break
          }
        }
      }
    }

    console.log(`📝 Encontradas ${renameMap.size} fotos renombradas para actualizar\n`)

    // Actualizar el Excel
    let updatedCount = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      let rowUpdated = false

      // Actualizar foto_principal
      const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()
      if (fotoPrincipal && renameMap.has(fotoPrincipal)) {
        row.foto_principal = renameMap.get(fotoPrincipal) || fotoPrincipal
        rowUpdated = true
        console.log(`   ✅ Fila ${i + 2}: foto_principal actualizada`)
      }

      // Actualizar foto_2, foto_3, foto_4
      for (let j = 2; j <= 4; j++) {
        const fotoKey = `foto_${j}`
        const foto = (row[fotoKey] || '').toString().trim()
        
        if (foto && renameMap.has(foto)) {
          row[fotoKey] = renameMap.get(foto) || foto
          rowUpdated = true
          console.log(`   ✅ Fila ${i + 2}: ${fotoKey} actualizada`)
        }
      }

      if (rowUpdated) {
        updatedCount++
      }
    }

    if (updatedCount === 0) {
      console.log('⚠️  No se encontraron fotos para actualizar')
      console.log('💡 Asegúrate de que las fotos hayan sido renombradas primero')
      return
    }

    // Convertir de vuelta a worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(rows)
    
    // Crear nuevo workbook
    const newWorkbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName)

    // Guardar el Excel actualizado
    XLSX.writeFile(newWorkbook, outputPath)

    console.log(`\n📊 RESUMEN:`)
    console.log(`✅ Filas actualizadas: ${updatedCount}`)
    console.log(`📁 Archivo guardado en: ${outputPath}`)
    console.log(`\n💡 El archivo original se mantiene intacto`)
    console.log(`   Usa el nuevo archivo "listado_final_actualizado.xlsx" para importar`)

  } catch (error) {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  }
}

// Ejecutar
updateExcelWithRenamedImages()

