// Script para verificar el Excel productos_sin_fotos.xlsx
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

async function checkExcelProductos() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  const excelPath = path.join(uploadsDir, 'productos_sin_fotos.xlsx')

  try {
    await fs.access(excelPath)
    console.log(`✅ Archivo encontrado: productos_sin_fotos.xlsx\n`)
  } catch {
    console.error(`❌ No se encontró el archivo: productos_sin_fotos.xlsx`)
    console.log(`💡 Asegúrate de que el archivo esté en: ${uploadsDir}\n`)
    return
  }

  const buffer = await fs.readFile(excelPath)
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

  console.log(`📊 Total de filas: ${rows.length}\n`)
  
  if (rows.length > 0) {
    console.log('📋 Columnas encontradas:')
    Object.keys(rows[0]).forEach(key => {
      console.log(`   - ${key}`)
    })
    console.log('\nPrimeras 3 filas:\n')
    
    rows.slice(0, 3).forEach((row, i) => {
      console.log(`Fila ${i + 1}:`)
      Object.entries(row).forEach(([key, value]) => {
        const val = value ? value.toString().substring(0, 80) : '(vacío)'
        console.log(`  ${key}: ${val}`)
      })
      console.log('')
    })

    // Verificar campos requeridos
    const requiredFields = ['titulo', 'categoria', 'zona', 'descripcion']
    const missingFields: string[] = []
    
    requiredFields.forEach(field => {
      if (!rows[0][field] && !rows[0][field.toLowerCase()]) {
        missingFields.push(field)
      }
    })

    if (missingFields.length > 0) {
      console.log(`⚠️  Campos requeridos faltantes: ${missingFields.join(', ')}\n`)
    } else {
      console.log(`✅ Todos los campos requeridos están presentes\n`)
    }
  }
}

checkExcelProductos()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })



