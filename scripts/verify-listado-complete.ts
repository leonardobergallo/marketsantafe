// Script para verificar que el listado esté completo
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

async function verifyListadoComplete() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  const listadoPath = path.join(uploadsDir, 'listado_final_con_fotos_originales.xlsx')

  const buffer = await fs.readFile(listadoPath)
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

  console.log(`📊 Verificando ${rows.length} productos...\n`)

  const requiredFields = ['titulo', 'categoria', 'zona', 'descripcion', 'precio', 'moneda', 'condicion', 'whatsapp', 'foto_principal']
  const incomplete: Array<{ row: number; titulo: string; missing: string[] }> = []

  rows.forEach((row, index) => {
    const missing: string[] = []
    const titulo = (row.titulo || row.title || '').toString().trim()

    requiredFields.forEach(field => {
      const value = (row[field] || '').toString().trim()
      if (!value || value === '') {
        missing.push(field)
      }
    })

    if (missing.length > 0) {
      incomplete.push({
        row: index + 2, // +2 porque index es 0-based y la fila 1 es el header
        titulo: titulo || `Fila ${index + 2}`,
        missing
      })
    }
  })

  if (incomplete.length === 0) {
    console.log('✅ Todos los productos están completos!\n')
    console.log('📋 Campos verificados:')
    requiredFields.forEach(field => {
      console.log(`   ✅ ${field}`)
    })
  } else {
    console.log(`⚠️  ${incomplete.length} productos incompletos:\n`)
    incomplete.forEach(({ row, titulo, missing }) => {
      console.log(`   Fila ${row}: ${titulo}`)
      console.log(`      Faltan: ${missing.join(', ')}`)
    })
  }

  console.log(`\n📊 Resumen:`)
  console.log(`   Total productos: ${rows.length}`)
  console.log(`   Completos: ${rows.length - incomplete.length}`)
  console.log(`   Incompletos: ${incomplete.length}`)
}

verifyListadoComplete()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })

