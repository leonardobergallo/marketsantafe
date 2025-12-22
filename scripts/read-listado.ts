// Script para leer y mostrar el contenido del listado
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

async function readListado() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  const listadoPath = path.join(uploadsDir, 'listado_final_con_fotos_originales.xlsx')

  const buffer = await fs.readFile(listadoPath)
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

  console.log(`📊 Total de filas: ${rows.length}\n`)
  console.log('Primeras 3 filas completas:\n')
  
  rows.slice(0, 3).forEach((row, i) => {
    console.log(`Fila ${i + 1}:`)
    Object.entries(row).forEach(([key, value]) => {
      const val = value ? value.toString().substring(0, 100) : '(vacío)'
      console.log(`  ${key}: ${val}`)
    })
    console.log('')
  })
}

readListado()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })

