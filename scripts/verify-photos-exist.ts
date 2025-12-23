// Script para verificar que las fotos del listado existan
import { promises as fs } from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'

async function verifyPhotosExist() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  const listadoPath = path.join(uploadsDir, 'listado_final_con_fotos_originales.xlsx')

  // Leer listado
  const buffer = await fs.readFile(listadoPath)
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false })

  // Leer archivos en uploads
  const allFiles = await fs.readdir(uploadsDir)
  const imageFiles = allFiles.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext) &&
           !file.includes('listado') && 
           !file.includes('guia') &&
           !file.includes('excel')
  })

  console.log(`📊 Verificando ${rows.length} productos...\n`)
  console.log(`🖼️  Fotos disponibles en /public/uploads/: ${imageFiles.length}\n`)

  const missing: Array<{ row: number; titulo: string; foto: string }> = []
  const found: Array<{ row: number; titulo: string; foto: string }> = []

  rows.forEach((row, index) => {
    const titulo = (row.titulo || row.title || '').toString().trim()
    const fotoPrincipal = (row.foto_principal || row.fotoPrincipal || '').toString().trim()

    if (!fotoPrincipal) {
      missing.push({
        row: index + 2,
        titulo,
        foto: '(vacío)'
      })
      return
    }

    // Buscar foto exacta
    const exactMatch = imageFiles.find(f => f === fotoPrincipal)
    if (exactMatch) {
      found.push({
        row: index + 2,
        titulo,
        foto: fotoPrincipal
      })
      return
    }

    // Buscar case-insensitive
    const caseInsensitiveMatch = imageFiles.find(f => f.toLowerCase() === fotoPrincipal.toLowerCase())
    if (caseInsensitiveMatch) {
      found.push({
        row: index + 2,
        titulo,
        foto: `${fotoPrincipal} → ${caseInsensitiveMatch} (diferente mayúscula)`
      })
      return
    }

    // No encontrada
    missing.push({
      row: index + 2,
      titulo,
      foto: fotoPrincipal
    })
  })

  if (missing.length === 0) {
    console.log('✅ Todas las fotos existen!\n')
  } else {
    console.log(`⚠️  ${missing.length} fotos no encontradas:\n`)
    missing.forEach(({ row, titulo, foto }) => {
      console.log(`   Fila ${row}: ${titulo}`)
      console.log(`      Foto: ${foto}`)
    })
    console.log('')
  }

  console.log(`📊 Resumen:`)
  console.log(`   Fotos encontradas: ${found.length}`)
  console.log(`   Fotos faltantes: ${missing.length}`)
  console.log(`   Total productos: ${rows.length}`)
}

verifyPhotosExist()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })


