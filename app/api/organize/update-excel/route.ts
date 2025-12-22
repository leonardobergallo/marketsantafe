// API para actualizar Excel con asignaciones de fotos
import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productsJson = formData.get('products') as string

    if (!file || !productsJson) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    const products = JSON.parse(productsJson) as Array<{
      titulo: string
      foto_principal?: string
      foto_2?: string
      foto_3?: string
      foto_4?: string
      rowNumber: number
    }>

    // Actualizar filas con las fotos asignadas
    products.forEach((product) => {
      const rowIndex = product.rowNumber - 2
      if (rows[rowIndex]) {
        if (product.foto_principal) {
          rows[rowIndex].foto_principal = product.foto_principal
        }
        if (product.foto_2) {
          rows[rowIndex].foto_2 = product.foto_2
        }
        if (product.foto_3) {
          rows[rowIndex].foto_3 = product.foto_3
        }
        if (product.foto_4) {
          rows[rowIndex].foto_4 = product.foto_4
        }
      }
    })

    // Crear nuevo workbook
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Productos')

    // Generar buffer del Excel
    const excelBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="productos_con_fotos.xlsx"',
      },
    })
  } catch (error) {
    console.error('Error actualizando Excel:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el archivo Excel' },
      { status: 500 }
    )
  }
}

