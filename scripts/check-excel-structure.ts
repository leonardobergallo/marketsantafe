// Script para verificar la estructura del Excel
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

async function checkExcelStructure() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  const excelPath = path.join(uploadsDir, 'excel_renombrado_por_descripcion.xlsx')

  const excelBuffer = await fs.readFile(excelPath)
  const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

  console.log('📊 Estructura del Excel:\n')
  console.log(`Total de filas: ${rows.length}\n`)

  if (rows.length > 0) {
    console.log('Columnas encontradas:')
    Object.keys(rows[0]).forEach(key => {
      console.log(`  - ${key}`)
    })
    console.log('\nPrimeras 3 filas:\n')
    rows.slice(0, 3).forEach((row, i) => {
      console.log(`Fila ${i + 1}:`)
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      console.log('')
    })
  }
}

checkExcelStructure()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })



