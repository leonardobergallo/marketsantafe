// API para leer Excel y extraer productos
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    const products = rows.map((row, index) => ({
      titulo: row.titulo || row.title || '',
      foto_principal: row.foto_principal || row.fotoPrincipal || '',
      foto_2: row.foto_2 || row.foto2 || '',
      foto_3: row.foto_3 || row.foto3 || '',
      foto_4: row.foto_4 || row.foto4 || '',
      rowNumber: index + 2,
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error leyendo Excel:', error)
    return NextResponse.json(
      { error: 'Error al leer el archivo Excel' },
      { status: 500 }
    )
  }
}


