// Página para importar productos desde Excel con vista previa
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertCircle, Eye, Table } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

interface ImportResult {
  message: string
  success: number
  errors: Array<{ row: number; error: string }>
  listings: Array<{ id: number; title: string }>
}

interface PreviewRow {
  titulo: string
  categoria: string
  zona: string
  descripcion: string
  precio?: string
  moneda?: string
  condicion?: string
  foto_principal?: string
  foto_2?: string
  foto_3?: string
  foto_4?: string
  whatsapp?: string
  telefono?: string
  email?: string
  instagram?: string
  [key: string]: any
}

export default function PublicarMasivoPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        toast.error('El archivo debe ser un Excel (.xlsx o .xls)')
        return
      }
      setFile(selectedFile)
      setResult(null)
      setShowPreview(false)

      // Leer el Excel en el cliente para mostrar vista previa
      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet) as PreviewRow[]

        if (data.length === 0) {
          toast.error('El Excel está vacío')
          return
        }

        // Validar columnas requeridas
        const requiredColumns = ['titulo', 'categoria', 'zona', 'descripcion']
        const firstRow = data[0]
        const missingColumns = requiredColumns.filter(col => !(col in firstRow))

        if (missingColumns.length > 0) {
          toast.error(`Faltan columnas requeridas: ${missingColumns.join(', ')}`)
          return
        }

        setPreviewData(data)
        setShowPreview(true)
        toast.success(`Excel cargado: ${data.length} productos encontrados`)
      } catch (error: any) {
        console.error('Error leyendo Excel:', error)
        toast.error('Error al leer el archivo Excel')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Selecciona un archivo Excel')
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/publish/listing/import-excel', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al importar el archivo')
        if (data.details) {
          console.error('Detalles del error:', data.details)
        }
        setIsUploading(false)
        return
      }

      setResult(data)
      setShowPreview(false)
      toast.success(`¡Importación completada! ${data.success} productos creados`)
      
      if (data.errors && data.errors.length > 0) {
        toast.warning(`${data.errors.length} productos tuvieron errores`)
      }
    } catch (error: any) {
      console.error('Error al importar:', error)
      toast.error('Error al importar el archivo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/publicar" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a publicar
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Importar productos desde Excel
          </h1>
          <p className="text-muted-foreground">
            Sube un archivo Excel con tus productos y revisa la vista previa antes de importar
          </p>
        </div>

        {/* Instrucciones */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Formato del Excel
          </h2>
          <div className="space-y-3 text-sm">
            <p><strong>Columnas requeridas:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">titulo</code> - Título del producto</li>
              <li><code className="bg-muted px-1 rounded">categoria</code> - Nombre o ID de la categoría</li>
              <li><code className="bg-muted px-1 rounded">zona</code> - Nombre o ID de la zona</li>
              <li><code className="bg-muted px-1 rounded">descripcion</code> - Descripción del producto</li>
            </ul>
            <p className="mt-4"><strong>Columnas opcionales:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">precio</code> - Precio del producto</li>
              <li><code className="bg-muted px-1 rounded">moneda</code> - ARS o USD (default: ARS)</li>
              <li><code className="bg-muted px-1 rounded">condicion</code> - nuevo, usado, reacondicionado</li>
              <li><code className="bg-muted px-1 rounded">foto_principal</code> - Nombre del archivo en /uploads/</li>
              <li><code className="bg-muted px-1 rounded">foto_2</code> - Segunda foto (opcional)</li>
              <li><code className="bg-muted px-1 rounded">foto_3</code> - Tercera foto (opcional)</li>
              <li><code className="bg-muted px-1 rounded">foto_4</code> - Cuarta foto (opcional)</li>
              <li><code className="bg-muted px-1 rounded">whatsapp</code> - Número de WhatsApp</li>
              <li><code className="bg-muted px-1 rounded">telefono</code> - Número de teléfono</li>
              <li><code className="bg-muted px-1 rounded">email</code> - Email de contacto</li>
              <li><code className="bg-muted px-1 rounded">instagram</code> - Usuario de Instagram</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm">
                <strong>💡 Tip sobre fotos:</strong> Escribe solo el nombre del archivo (ej: <code>IMG_2561.JPG</code>). 
                Las fotos deben estar en <code>public/uploads/</code> o puedes usar URLs completas.
              </p>
            </div>
            <div className="mt-2">
              <Link href="/docs/GUIA-IMPORTAR-FOTOS" className="text-sm text-primary hover:underline">
                Ver guía completa de importación de fotos →
              </Link>
            </div>
          </div>
        </Card>

        {/* Formulario de subida */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                Selecciona el archivo Excel
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    cursor-pointer"
                  disabled={isUploading}
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Archivo seleccionado: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Formatos aceptados: .xlsx, .xls
              </p>
            </div>

            {showPreview && previewData.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Vista previa ({previewData.length} productos)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    Ocultar
                  </Button>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold border-b">#</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Título</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Categoría</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Zona</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Precio</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium max-w-xs truncate" title={row.titulo}>
                            {row.titulo || '-'}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{row.categoria || '-'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{row.zona || '-'}</td>
                          <td className="px-3 py-2">
                            {row.precio ? (
                              <span>
                                {row.moneda || 'ARS'} ${row.precio}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {row.foto_principal ? (
                              <span className="text-xs text-green-600">✓</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 50 && (
                    <div className="p-3 bg-muted text-center text-sm text-muted-foreground">
                      Mostrando primeros 50 de {previewData.length} productos. El resto se importará normalmente.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={!file || isUploading || !showPreview}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar {previewData.length > 0 ? `${previewData.length} productos` : 'productos'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

        {/* Resultados */}
        {result && (
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {result.success > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Resultados de la importación
            </h2>

            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                  <div className="text-sm text-muted-foreground">Productos creados</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.listings.length}</div>
                  <div className="text-sm text-muted-foreground">Total procesados</div>
                </div>
              </div>

              {/* Errores */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Errores encontrados:
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {result.errors.map((error, idx) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
                        <strong>Fila {error.row}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Productos creados */}
              {result.listings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Productos creados exitosamente:</h3>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {result.listings.map((listing) => (
                      <div key={listing.id} className="text-sm p-2 bg-green-50 dark:bg-green-950 rounded">
                        <strong>#{listing.id}:</strong> {listing.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón para ver productos */}
              {result.success > 0 && (
                <div className="pt-4 border-t">
                  <Button asChild>
                    <Link href="/mercado">
                      Ver productos en el mercado
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
