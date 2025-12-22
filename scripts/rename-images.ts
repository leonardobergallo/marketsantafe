// Script para renombrar imágenes en /public/uploads/
// Basado en un Excel con productos o con un patrón simple

import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

interface RenameOption {
  oldName: string
  newName: string
  product?: string
}

async function renameImagesFromExcel() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Buscar el archivo CSV o Excel
    const possibleFiles = [
      'listado_final_corregido_fotos_originales.csv',
      'listado_final_corregido_fotos_originales.xlsx',
      'listado_final_con_fotos_originales.xlsx',
      'listado_final_con_fotos_originales.csv',
    ]
    
    let excelPath: string | null = null
    for (const fileName of possibleFiles) {
      const filePath = path.join(uploadsDir, fileName)
      try {
        await fs.access(filePath)
        excelPath = filePath
        console.log(`📄 Usando archivo: ${fileName}\n`)
        break
      } catch {
        // Continuar buscando
      }
    }

    if (!excelPath) {
      console.error(`❌ No se encontró ningún archivo Excel/CSV en: ${uploadsDir}`)
      console.log('💡 Archivos buscados:', possibleFiles.join(', '))
      return
    }

    // Verificar que existe el archivo
    let excelBuffer: Buffer
    try {
      excelBuffer = await fs.readFile(excelPath)
    } catch {
      console.error(`❌ Error al leer el archivo: ${excelPath}`)
      return
    }

    // Leer Excel
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    if (rows.length === 0) {
      console.error('❌ El Excel está vacío')
      return
    }

    console.log(`📊 Encontrados ${rows.length} productos en el Excel\n`)

    // Leer archivos de imagen en uploads
    const allFiles = await fs.readdir(uploadsDir)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} imágenes en /public/uploads/\n`)

    // Crear mapeo de renombres basado en el Excel
    const renameMap = new Map<string, RenameOption>()
    const usedNames = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const titulo = (row.titulo || row.title || '').toString().trim()
      const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()
      
      if (!titulo || !fotoPrincipal) continue

      // Normalizar nombre del producto para el nuevo nombre de archivo
      const normalizedTitle = titulo
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)

      // Buscar la imagen original (coincidencia exacta primero, luego parcial)
      let originalImage = imageFiles.find(img => {
        const imgName = img.toLowerCase().trim()
        const searchName = fotoPrincipal.toLowerCase().trim()
        return imgName === searchName
      })
      
      // Si no hay coincidencia exacta, buscar parcial
      if (!originalImage) {
        originalImage = imageFiles.find(img => {
          const imgName = img.toLowerCase()
          const searchName = fotoPrincipal.toLowerCase()
          // Buscar por nombre base (sin extensión)
          const imgBase = path.basename(imgName, path.extname(imgName))
          const searchBase = path.basename(searchName, path.extname(searchName))
          return imgBase === searchBase || 
                 imgName.includes(searchBase) || 
                 searchBase.includes(imgBase)
        })
      }

      if (originalImage) {
        const ext = path.extname(originalImage)
        let newName = `${normalizedTitle}_principal${ext}`
        
        // Si el nombre ya existe, agregar número
        let counter = 1
        while (usedNames.has(newName.toLowerCase())) {
          newName = `${normalizedTitle}_principal_${counter}${ext}`
          counter++
        }

        usedNames.add(newName.toLowerCase())
        renameMap.set(originalImage, {
          oldName: originalImage,
          newName,
          product: titulo,
        })
      }

      // Procesar fotos adicionales (foto_2 hasta foto_10)
      for (let j = 2; j <= 10; j++) {
        const fotoKey = `foto_${j}` || `foto${j}`
        const foto = (row[`foto_${j}`] || row[`foto${j}`] || '').toString().trim()
        
        if (!foto) continue

        // Buscar la imagen (coincidencia exacta primero, luego parcial)
        let originalImage = imageFiles.find(img => {
          const imgName = img.toLowerCase().trim()
          const searchName = foto.toLowerCase().trim()
          return imgName === searchName
        })
        
        // Si no hay coincidencia exacta, buscar parcial
        if (!originalImage) {
          originalImage = imageFiles.find(img => {
            const imgName = img.toLowerCase()
            const searchName = foto.toLowerCase()
            const imgBase = path.basename(imgName, path.extname(imgName))
            const searchBase = path.basename(searchName, path.extname(searchName))
            return imgBase === searchBase || 
                   imgName.includes(searchBase) || 
                   searchBase.includes(imgBase)
          })
        }

        if (originalImage && !renameMap.has(originalImage)) {
          const ext = path.extname(originalImage)
          let newName = `${normalizedTitle}_${j}${ext}`
          
          let counter = 1
          while (usedNames.has(newName.toLowerCase())) {
            newName = `${normalizedTitle}_${j}_${counter}${ext}`
            counter++
          }

          usedNames.add(newName.toLowerCase())
          renameMap.set(originalImage, {
            oldName: originalImage,
            newName,
            product: titulo,
          })
        }
      }
    }

    if (renameMap.size === 0) {
      console.log('⚠️  No se encontraron imágenes para renombrar basadas en el Excel')
      console.log('💡 Verifica que los nombres en el Excel coincidan con los archivos')
      return
    }

    console.log(`📝 Se renombrarán ${renameMap.size} imágenes:\n`)
    
    // Mostrar preview
    renameMap.forEach(({ oldName, newName, product }) => {
      console.log(`   "${oldName}" → "${newName}"`)
      if (product) console.log(`      Producto: ${product}`)
    })

    console.log('\n⚠️  ¿Continuar con el renombrado? (Ctrl+C para cancelar)')
    console.log('   Esperando 5 segundos...\n')
    
    // Esperar 5 segundos antes de renombrar
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Renombrar archivos
    let successCount = 0
    let errorCount = 0

    for (const [oldName, { newName, product }] of renameMap.entries()) {
      try {
        const oldPath = path.join(uploadsDir, oldName)
        const newPath = path.join(uploadsDir, newName)

        // Verificar que el archivo original existe
        await fs.access(oldPath)

        // Verificar que el nuevo nombre no existe
        try {
          await fs.access(newPath)
          console.log(`   ⚠️  "${newName}" ya existe, saltando...`)
          continue
        } catch {
          // El archivo no existe, podemos renombrar
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

async function renameImagesSimple() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    // Leer archivos de imagen
    const allFiles = await fs.readdir(uploadsDir)
    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)
    })

    console.log(`🖼️  Encontradas ${imageFiles.length} imágenes\n`)

    // Renombrar con patrón simple: foto_1.jpg, foto_2.jpg, etc.
    let counter = 1
    const renameMap = new Map<string, string>()

    for (const file of imageFiles) {
      const ext = path.extname(file)
      const newName = `foto_${counter}${ext}`
      
      if (file !== newName) {
        renameMap.set(file, newName)
      }
      counter++
    }

    if (renameMap.size === 0) {
      console.log('✅ Todas las imágenes ya tienen nombres simples')
      return
    }

    console.log(`📝 Se renombrarán ${renameMap.size} imágenes:\n`)
    renameMap.forEach((newName, oldName) => {
      console.log(`   "${oldName}" → "${newName}"`)
    })

    console.log('\n⚠️  ¿Continuar con el renombrado? (Ctrl+C para cancelar)')
    console.log('   Esperando 5 segundos...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Renombrar
    let successCount = 0
    let errorCount = 0

    for (const [oldName, newName] of renameMap.entries()) {
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

  } catch (error) {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  }
}

// Ejecutar
const mode = process.argv[2] || 'excel'

if (mode === 'simple') {
  console.log('🔄 Modo simple: Renombrando con patrón foto_1.jpg, foto_2.jpg, etc.\n')
  renameImagesSimple()
} else {
  console.log('🔄 Modo Excel: Renombrando basado en el Excel\n')
  renameImagesFromExcel()
}

