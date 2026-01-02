// Script para copiar las fotos del Excel desde public/images/ a public/uploads/
import { config } from 'dotenv'
import { resolve } from 'path'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

async function copyImagesForImport() {
  try {
    console.log('📸 Copiando fotos para la importación...')

    // Leer el Excel
    const excelPath = 'productos-exportados-2025-12-28T13-23-45.xlsx'
    if (!fs.existsSync(excelPath)) {
      console.error('❌ No se encontró el archivo Excel:', excelPath)
      process.exit(1)
    }

    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Recopilar todas las fotos únicas
    const fotos = new Set<string>()
    data.forEach((row: any) => {
      if (row.foto_principal && row.foto_principal.trim()) {
        fotos.add(row.foto_principal.trim())
      }
      if (row.foto_2 && row.foto_2.trim()) {
        fotos.add(row.foto_2.trim())
      }
      if (row.foto_3 && row.foto_3.trim()) {
        fotos.add(row.foto_3.trim())
      }
      if (row.foto_4 && row.foto_4.trim()) {
        fotos.add(row.foto_4.trim())
      }
    })

    console.log(`📊 Total de fotos únicas a copiar: ${fotos.size}`)

    // Directorios
    const imagesDir = 'public/images'
    const uploadsDir = 'public/uploads'

    // Asegurar que uploads existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Copiar fotos
    let copiadas = 0
    let faltantes = 0
    const faltantesList: string[] = []

    for (const foto of fotos) {
      const origen = path.join(imagesDir, foto)
      const destino = path.join(uploadsDir, foto)

      if (fs.existsSync(origen)) {
        // Verificar si ya existe en destino
        if (!fs.existsSync(destino)) {
          fs.copyFileSync(origen, destino)
          copiadas++
        }
      } else {
        faltantes++
        faltantesList.push(foto)
      }
    }

    console.log(`✅ Fotos copiadas: ${copiadas}`)
    if (faltantes > 0) {
      console.log(`⚠️  Fotos faltantes: ${faltantes}`)
      if (faltantesList.length <= 10) {
        console.log('Fotos que no se encontraron:')
        faltantesList.forEach(f => console.log(`  - ${f}`))
      } else {
        console.log('Primeras 10 fotos que no se encontraron:')
        faltantesList.slice(0, 10).forEach(f => console.log(`  - ${f}`))
      }
    }

    console.log('🎉 Proceso completado!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

copyImagesForImport()





