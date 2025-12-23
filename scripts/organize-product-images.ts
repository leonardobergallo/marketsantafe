// Script para organizar y renombrar fotos de productos según el Excel
// Este script lee un Excel y renombra las fotos para que coincidan con los productos

import { config } from 'dotenv'
import { resolve } from 'path'
import * as XLSX from 'xlsx'
import { promises as fs } from 'fs'
import path from 'path'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

interface ProductRow {
  titulo: string
  foto_principal?: string
  foto_2?: string
  foto_3?: string
  foto_4?: string
  rowNumber: number
}

// Función para normalizar nombres de archivo (quitar caracteres especiales)
function normalizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .replace(/^-|-$/g, '') // Quitar guiones al inicio y final
    .substring(0, 50) // Limitar longitud
}

// Función para encontrar archivos de imagen similares
async function findSimilarImage(
  searchName: string,
  uploadsDir: string
): Promise<string | null> {
  try {
    const files = await fs.readdir(uploadsDir)
    const normalizedSearch = normalizeFileName(searchName)
    
    // Buscar coincidencia exacta primero
    for (const file of files) {
      if (file.toLowerCase() === searchName.toLowerCase()) {
        return file
      }
    }
    
    // Buscar por palabras clave del título
    const searchWords = normalizedSearch.split('-').filter(w => w.length > 2)
    
    for (const file of files) {
      const normalizedFile = normalizeFileName(file)
      const fileWords = normalizedFile.split('-').filter(w => w.length > 2)
      
      // Si al menos 2 palabras coinciden, considerarlo similar
      const matches = searchWords.filter(word => fileWords.includes(word))
      if (matches.length >= Math.min(2, searchWords.length)) {
        return file
      }
    }
    
    // Buscar por número de fila (si el archivo tiene un número)
    const rowNumber = parseInt(searchName)
    if (!isNaN(rowNumber)) {
      for (const file of files) {
        const fileNumber = parseInt(file.replace(/[^0-9]/g, ''))
        if (fileNumber === rowNumber) {
          return file
        }
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error buscando imagen similar para "${searchName}":`, error)
    return null
  }
}

async function organizeImages() {
  try {
    console.log('📁 Organizando fotos de productos...\n')

    // Rutas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const excelPath = path.join(process.cwd(), 'productos.xlsx') // Excel con productos

    // Verificar que existe la carpeta de uploads
    try {
      await fs.access(uploadsDir)
    } catch {
      console.log('📁 Creando carpeta /public/uploads/...')
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    // Verificar que existe el Excel
    let excelBuffer: Buffer
    try {
      excelBuffer = await fs.readFile(excelPath)
    } catch {
      console.error(`❌ No se encontró el archivo "${excelPath}"`)
      console.log('💡 Coloca tu archivo Excel con el nombre "productos.xlsx" en la raíz del proyecto')
      process.exit(1)
    }

    // Leer Excel
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    if (rows.length === 0) {
      console.error('❌ El Excel está vacío')
      process.exit(1)
    }

    console.log(`📊 Encontrados ${rows.length} productos en el Excel\n`)

    // Leer archivos en uploads
    const imageFiles = (await fs.readdir(uploadsDir)).filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} imágenes en /public/uploads/\n`)

    // Crear mapeo de productos
    const productMap = new Map<number, ProductRow>()
    rows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 porque index es 0-based y la fila 1 es el header
      productMap.set(rowNumber, {
        titulo: row.titulo || row.title || '',
        foto_principal: row.foto_principal || row.fotoPrincipal || '',
        foto_2: row.foto_2 || row.foto2 || '',
        foto_3: row.foto_3 || row.foto3 || '',
        foto_4: row.foto_4 || row.foto4 || '',
        rowNumber,
      })
    })

    // Procesar cada producto
    const renamedFiles: Array<{ old: string; new: string; product: string }> = []
    const unmatchedImages: string[] = [...imageFiles]

    for (const [rowNumber, product] of productMap.entries()) {
      if (!product.titulo) continue

      const baseName = normalizeFileName(product.titulo)
      const photos = [
        product.foto_principal,
        product.foto_2,
        product.foto_3,
        product.foto_4,
      ].filter(Boolean) as string[]

      // Si el producto ya tiene fotos asignadas en el Excel, verificar que existan
      if (photos.length > 0) {
        console.log(`✅ Producto "${product.titulo}" (Fila ${rowNumber})`)
        console.log(`   Fotos asignadas en Excel: ${photos.join(', ')}`)
        
        for (let i = 0; i < photos.length; i++) {
          const photoName = photos[i]
          const photoPath = path.join(uploadsDir, photoName)
          
          try {
            await fs.access(photoPath)
            console.log(`   ✓ "${photoName}" existe`)
          } catch {
            console.log(`   ⚠️  "${photoName}" NO existe`)
            // Intentar encontrar una imagen similar
            const similar = await findSimilarImage(photoName, uploadsDir)
            if (similar) {
              console.log(`   💡 Sugerencia: usar "${similar}"`)
            }
          }
        }
        console.log('')
        continue
      }

      // Si no tiene fotos asignadas, buscar imágenes similares
      console.log(`🔍 Producto "${product.titulo}" (Fila ${rowNumber}) - Sin fotos asignadas`)
      
      const similarImage = await findSimilarImage(product.titulo, uploadsDir)
      if (similarImage && unmatchedImages.includes(similarImage)) {
        const ext = path.extname(similarImage)
        const newName = `${baseName}_principal${ext}`
        const oldPath = path.join(uploadsDir, similarImage)
        const newPath = path.join(uploadsDir, newName)

        // Verificar que el nuevo nombre no exista
        let finalNewName = newName
        let counter = 1
        while (await fs.access(path.join(uploadsDir, finalNewName)).then(() => true).catch(() => false)) {
          finalNewName = `${baseName}_principal_${counter}${ext}`
          counter++
        }

        try {
          await fs.rename(oldPath, path.join(uploadsDir, finalNewName))
          renamedFiles.push({
            old: similarImage,
            new: finalNewName,
            product: product.titulo,
          })
          unmatchedImages.splice(unmatchedImages.indexOf(similarImage), 1)
          console.log(`   ✓ Renombrado: "${similarImage}" → "${finalNewName}"`)
        } catch (error) {
          console.error(`   ❌ Error renombrando "${similarImage}":`, error)
        }
      } else {
        console.log(`   ⚠️  No se encontró imagen similar`)
      }
      console.log('')
    }

    // Resumen
    console.log('\n📊 RESUMEN:')
    console.log(`✅ Productos procesados: ${productMap.size}`)
    console.log(`🔄 Archivos renombrados: ${renamedFiles.length}`)
    console.log(`📦 Imágenes sin asignar: ${unmatchedImages.length}`)

    if (renamedFiles.length > 0) {
      console.log('\n📝 Archivos renombrados:')
      renamedFiles.forEach(({ old, new: newName, product }) => {
        console.log(`   "${old}" → "${newName}" (${product})`)
      })
    }

    if (unmatchedImages.length > 0) {
      console.log('\n⚠️  Imágenes sin asignar:')
      unmatchedImages.forEach(file => {
        console.log(`   - ${file}`)
      })
    }

    // Generar Excel actualizado con nombres de fotos
    if (renamedFiles.length > 0) {
      console.log('\n💾 Actualizando Excel con nuevos nombres de fotos...')
      
      // Actualizar las filas del Excel con los nuevos nombres
      for (const { old, new: newName, product } of renamedFiles) {
        const productRow = Array.from(productMap.values()).find(p => p.titulo === product)
        if (productRow) {
          const rowIndex = productRow.rowNumber - 2 // Convertir a índice del array
          if (rows[rowIndex]) {
            if (!rows[rowIndex].foto_principal) {
              rows[rowIndex].foto_principal = newName
            }
          }
        }
      }

      // Crear nuevo workbook
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Productos')

      // Guardar Excel actualizado
      const updatedExcelPath = path.join(process.cwd(), 'productos_actualizado.xlsx')
      XLSX.writeFile(newWorkbook, updatedExcelPath)
      console.log(`✅ Excel actualizado guardado en: ${updatedExcelPath}`)
    }

    console.log('\n✅ Proceso completado!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

organizeImages()


