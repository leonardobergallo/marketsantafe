// Script para renombrar fotos según Excel con nombre_actual y nombre_nuevo
import { config } from 'dotenv'
import { resolve } from 'path'
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

interface RenameOperation {
  nombreActual: string
  nombreNuevo: string
  status: 'pending' | 'ok' | 'error' | 'warning'
  message: string
}

async function renameFromExcelDescription(dryRun: boolean = true) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const excelPath = path.join(uploadsDir, 'excel_renombrado_por_descripcion.xlsx')

    // Verificar que existe el Excel
    try {
      await fs.access(excelPath)
    } catch {
      console.error(`❌ No se encontró el archivo Excel en: ${excelPath}`)
      console.log('💡 Asegúrate de que el Excel esté en /public/uploads/')
      return
    }

    console.log(`📖 Leyendo Excel: ${path.basename(excelPath)}\n`)

    // Leer Excel
    const excelBuffer = await fs.readFile(excelPath)
    const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    if (rows.length === 0) {
      console.error('❌ El Excel está vacío')
      return
    }

    console.log(`📊 Encontradas ${rows.length} filas en el Excel\n`)

    // Verificar estructura del Excel
    const firstRow = rows[0]
    const hasNombreActual = firstRow.nombre_actual || firstRow.nombreActual || firstRow['nombre actual']
    const hasNombreNuevo = firstRow.nombre_nuevo || firstRow.nombreNuevo || firstRow['nombre nuevo']
    
    if (!hasNombreNuevo) {
      console.error('❌ El Excel no tiene la columna "nombre_nuevo"')
      console.log('💡 Columnas encontradas:', Object.keys(firstRow).join(', '))
      return
    }

    if (!hasNombreActual) {
      console.log('⚠️  El Excel no tiene la columna "nombre_actual"')
      console.log('💡 Se buscarán los archivos basándose en el título del producto o archivos disponibles\n')
    }

    // Leer archivos existentes en uploads
    const allFiles = await fs.readdir(uploadsDir)
    const existingFiles = new Set(allFiles.map(f => f.toLowerCase()))

    console.log(`🖼️  Encontrados ${allFiles.length} archivos en /public/uploads/\n`)

    // Preparar operaciones de renombrado
    const operations: RenameOperation[] = []

    // Crear lista de archivos disponibles para asignar (excluyendo ya renombrados)
    const availableFiles = allFiles.filter(f => {
      const ext = path.extname(f).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext) &&
             !f.includes('listado') && 
             !f.includes('guia') &&
             !f.includes('excel')
    })
    const assignedFiles = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // Buscar columnas con diferentes nombres posibles
      let nombreActual = (row.nombre_actual || row.nombreActual || row['nombre actual'] || '').toString().trim()
      const nombreNuevo = (row.nombre_nuevo || row.nombreNuevo || row['nombre nuevo'] || '').toString().trim()
      const tituloProducto = (row.titulo_producto || row.tituloProducto || row.titulo || row.title || '').toString().trim()

      if (!nombreNuevo) {
        operations.push({
          nombreActual: '',
          nombreNuevo: '',
          status: 'error',
          message: `Fila ${i + 2}: nombre_nuevo está vacío`
        })
        continue
      }

      // Si no hay nombre_actual, buscar el archivo
      if (!nombreActual) {
        // Buscar archivo que coincida con el título del producto
        const normalizedTitle = tituloProducto
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .substring(0, 50)

        // Buscar archivo que no haya sido asignado aún
        let foundFile = availableFiles.find(f => {
          if (assignedFiles.has(f.toLowerCase())) return false
          const fileBase = path.basename(f, path.extname(f)).toLowerCase()
          return fileBase.includes(normalizedTitle.substring(0, 20)) ||
                 normalizedTitle.includes(fileBase.substring(0, 20))
        })

        // Si no se encuentra por título, usar el primer archivo disponible
        if (!foundFile) {
          foundFile = availableFiles.find(f => !assignedFiles.has(f.toLowerCase()))
        }

        if (foundFile) {
          nombreActual = foundFile
          assignedFiles.add(foundFile.toLowerCase())
        } else {
          operations.push({
            nombreActual: '',
            nombreNuevo,
            status: 'error',
            message: `Fila ${i + 2}: No se encontró archivo para "${tituloProducto}"`
          })
          continue
        }
      }

      if (!nombreNuevo) {
        operations.push({
          nombreActual,
          nombreNuevo: '',
          status: 'error',
          message: `Fila ${i + 2}: nombre_nuevo está vacío`
        })
        continue
      }

      // Verificar si el archivo actual existe
      const actualPath = path.join(uploadsDir, nombreActual)
      let fileExists = false
      try {
        await fs.access(actualPath)
        fileExists = true
      } catch {
        // El archivo no existe
      }

      if (!fileExists) {
        // Buscar con case-insensitive
        const foundFile = allFiles.find(f => f.toLowerCase() === nombreActual.toLowerCase())
        if (foundFile) {
          operations.push({
            nombreActual: foundFile, // Usar el nombre real del archivo
            nombreNuevo,
            status: 'pending',
            message: `Fila ${i + 2}: Archivo encontrado con diferente mayúscula/minúscula`
          })
        } else {
          operations.push({
            nombreActual,
            nombreNuevo,
            status: 'error',
            message: `Fila ${i + 2}: Archivo "${nombreActual}" no existe en /public/uploads/`
          })
        }
        continue
      }

      // Si el nombre actual y nuevo son iguales, saltar
      if (nombreActual === nombreNuevo) {
        operations.push({
          nombreActual,
          nombreNuevo,
          status: 'ok',
          message: `Fila ${i + 2}: El archivo ya tiene el nombre correcto`
        })
        continue
      }

      // Verificar si el destino ya existe
      const newPath = path.join(uploadsDir, nombreNuevo)
      let destinationExists = false
      try {
        await fs.access(newPath)
        destinationExists = true
      } catch {
        // El destino no existe
      }

      if (destinationExists && nombreActual.toLowerCase() !== nombreNuevo.toLowerCase()) {
        operations.push({
          nombreActual,
          nombreNuevo,
          status: 'warning',
          message: `Fila ${i + 2}: El archivo "${nombreNuevo}" ya existe, no se sobrescribirá`
        })
        continue
      }

      // Todo OK, preparar para renombrar
      operations.push({
        nombreActual,
        nombreNuevo,
        status: 'pending',
        message: `Fila ${i + 2}: Listo para renombrar`
      })
    }

    // Filtrar solo operaciones válidas
    const validOperations = operations.filter(op => op.status === 'pending')
    const errorOperations = operations.filter(op => op.status === 'error')
    const warningOperations = operations.filter(op => op.status === 'warning')
    const alreadyOk = operations.filter(op => op.status === 'ok')

    // Mostrar resumen
    console.log('📊 RESUMEN DE OPERACIONES:\n')
    console.log(`✅ Listos para renombrar: ${validOperations.length}`)
    console.log(`⚠️  Advertencias (destino existe): ${warningOperations.length}`)
    console.log(`❌ Errores (archivo no existe): ${errorOperations.length}`)
    console.log(`ℹ️  Ya correctos (sin cambios): ${alreadyOk.length}\n`)

    // Mostrar detalles
    if (validOperations.length > 0) {
      console.log('📝 OPERACIONES A REALIZAR:\n')
      validOperations.forEach(op => {
        console.log(`   ✅ "${op.nombreActual}" → "${op.nombreNuevo}"`)
      })
      console.log('')
    }

    if (warningOperations.length > 0) {
      console.log('⚠️  ADVERTENCIAS:\n')
      warningOperations.forEach(op => {
        console.log(`   ⚠️  ${op.message}`)
        console.log(`      "${op.nombreActual}" → "${op.nombreNuevo}"`)
      })
      console.log('')
    }

    if (errorOperations.length > 0) {
      console.log('❌ ERRORES:\n')
      errorOperations.forEach(op => {
        console.log(`   ❌ ${op.message}`)
      })
      console.log('')
    }

    if (alreadyOk.length > 0) {
      console.log('ℹ️  SIN CAMBIOS:\n')
      alreadyOk.forEach(op => {
        console.log(`   ℹ️  ${op.message}`)
      })
      console.log('')
    }

    // Si es dry-run, terminar aquí
    if (dryRun) {
      console.log('🔍 MODO DRY-RUN: No se realizaron cambios en los archivos\n')
      console.log('💡 Para ejecutar el renombrado real, ejecuta:')
      console.log('   npm run rename-from-excel-description:execute\n')
      return { operations, validOperations, errorOperations, warningOperations }
    }

    // Ejecutar renombrado real
    if (validOperations.length === 0) {
      console.log('⚠️  No hay operaciones válidas para realizar\n')
      return { operations, validOperations, errorOperations, warningOperations }
    }

    console.log('⚠️  ¿Continuar con el renombrado REAL? (Ctrl+C para cancelar)')
    console.log('   Esperando 5 segundos...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('🔄 Ejecutando renombrado...\n')

    let successCount = 0
    let errorCount = 0

    for (const op of validOperations) {
      try {
        const oldPath = path.join(uploadsDir, op.nombreActual)
        const newPath = path.join(uploadsDir, op.nombreNuevo)

        // Verificar nuevamente que el archivo existe
        try {
          await fs.access(oldPath)
        } catch {
          console.log(`   ❌ ERROR: "${op.nombreActual}" no existe`)
          errorCount++
          continue
        }

        // Verificar nuevamente que el destino no existe
        try {
          await fs.access(newPath)
          console.log(`   ⚠️  WARNING: "${op.nombreNuevo}" ya existe, saltando`)
          errorCount++
          continue
        } catch {
          // OK, puede renombrar
        }

        // Renombrar
        await fs.rename(oldPath, newPath)
        console.log(`   ✅ OK: "${op.nombreActual}" → "${op.nombreNuevo}"`)
        successCount++
      } catch (error) {
        console.error(`   ❌ ERROR renombrando "${op.nombreActual}":`, error)
        errorCount++
      }
    }

    console.log('\n📊 RESUMEN FINAL:')
    console.log(`✅ Renombrados exitosamente: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📦 Total procesados: ${validOperations.length}\n`)

    return { operations, validOperations, errorOperations, warningOperations }

  } catch (error) {
    console.error('❌ Error en el script:', error)
    process.exit(1)
  }
}

// Ejecutar
const mode = process.argv[2] || 'dry-run'

if (mode === 'execute' || mode === '--execute') {
  console.log('🚀 MODO EJECUCIÓN: Se renombrarán los archivos\n')
  renameFromExcelDescription(false)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err)
      process.exit(1)
    })
} else {
  console.log('🔍 MODO DRY-RUN: Solo se mostrará qué se haría\n')
  renameFromExcelDescription(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error:', err)
      process.exit(1)
    })
}

