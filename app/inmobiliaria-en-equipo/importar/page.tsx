// Página para importar propiedades inmobiliarias en lote desde Excel
// URL: /inmobiliaria-en-equipo/importar

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Upload, FileSpreadsheet, Building2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ImportarInmobiliariaPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/login?redirect=/inmobiliaria-en-equipo/importar')
        }
      } catch (error) {
        router.push('/login?redirect=/inmobiliaria-en-equipo/importar')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  // Manejar preview de importación desde Excel
  const handleExcelPreview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsImporting(true)

    const file = selectedFile || (fileInputRef.current?.files?.[0] || null)
    
    if (!file) {
      toast.error('Por favor selecciona un archivo Excel')
      setIsImporting(false)
      return
    }

    const previewFormData = new FormData()
    previewFormData.append('file', file)
    previewFormData.append('previewOnly', 'true')
    previewFormData.append('propertyType', 'inmobiliaria') // Indicar que es para inmobiliaria

    try {
      const response = await fetch('/api/publish/listing/import-excel-v2', {
        method: 'POST',
        body: previewFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al procesar el archivo Excel')
        setIsImporting(false)
        return
      }

      // Filtrar solo propiedades inmobiliarias (categorías 1 y 2)
      const inmobiliariaListings = (result.previewListings || result.listings || []).filter(
        (l: any) => {
          const catId = l.categoryId || l.category_id
          return catId === '1' || catId === '2' || catId === 1 || catId === 2
        }
      )

      const adaptedPreview = {
        valid: inmobiliariaListings.length,
        validRows: inmobiliariaListings.length,
        errors: (result.totalRows || result.total || 0) - inmobiliariaListings.length,
        errorRows: (result.totalRows || result.total || 0) - inmobiliariaListings.length,
        total: result.totalRows || result.total || 0,
        totalRows: result.totalRows || result.total || 0,
        listings: inmobiliariaListings,
        previewListings: inmobiliariaListings,
        errorsDetails: result.errorsDetails || [],
      }

      setPreviewData(adaptedPreview)
      setShowPreview(true)
      setIsImporting(false)
      toast.success(`${inmobiliariaListings.length} propiedades encontradas`)
    } catch (error) {
      console.error('Error al procesar:', error)
      toast.error('Error al procesar el archivo Excel')
      setIsImporting(false)
    }
  }

  // Confirmar e importar
  const handleConfirmImport = async () => {
    if (!previewData || !previewData.listings || previewData.listings.length === 0) {
      toast.error('No hay propiedades para importar')
      return
    }

    setIsImporting(true)

    try {
      const requestBody = {
        listings: previewData.listings.map((listing: any) => ({
          title: listing.title,
          categoryId: listing.categoryId || listing.category_id || (listing.tipo === 'alquiler' ? '1' : '2'),
          zoneId: listing.zoneId || listing.zone_id,
          price: listing.price ? parseFloat(String(listing.price).replace(/[^\d.-]/g, '')) : 0,
          currency: listing.currency || 'ARS',
          condition: 'nuevo',
          description: listing.description || listing.title,
          whatsapp: listing.whatsapp || undefined,
          phone: listing.phone || undefined,
          email: listing.email || undefined,
          instagram: listing.instagram || undefined,
          images: listing.images || [],
          imageUrl: listing.images?.[0] || listing.imageUrl || null,
        })),
      }

      const response = await fetch('/api/publish/listing/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al importar las propiedades')
        setIsImporting(false)
        return
      }

      toast.success(`¡${previewData.listings.length} propiedades importadas exitosamente!`)
      router.push('/inmobiliaria-en-equipo/mis-propiedades')
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al importar las propiedades')
      setIsImporting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/inmobiliaria-en-equipo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Inmobiliaria
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Importar Propiedades en Lote</h1>
              <p className="text-muted-foreground">Subí un archivo Excel con múltiples propiedades</p>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <Card className="p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Formato del Excel</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Tu archivo Excel debe tener las siguientes columnas:
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Columna obligatoria:</strong></div>
                    <div></div>
                    <div>• título</div>
                    <div>• descripción</div>
                    <div>• zona (nombre de la zona)</div>
                    <div>• tipo (alquiler, venta o terreno)</div>
                    <div className="col-span-2 mt-2"><strong>Opcionales:</strong></div>
                    <div>• precio</div>
                    <div>• whatsapp</div>
                    <div>• phone</div>
                    <div>• email</div>
                    <div>• instagram</div>
                    <div>• foto_principal</div>
                    <div>• foto_1, foto_2, etc.</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleExcelPreview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seleccionar archivo Excel
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Seleccionar archivo
                    </Button>
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={!selectedFile || isImporting} className="w-full">
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Generar Vista Previa
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Resumen */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Vista Previa</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewData(null)
                    setSelectedFile(null)
                  }}
                >
                  Cambiar archivo
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{previewData.valid}</p>
                  <p className="text-sm text-muted-foreground">Válidas</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{previewData.errors}</p>
                  <p className="text-sm text-muted-foreground">Con errores</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{previewData.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </Card>

            {/* Lista de propiedades */}
            {previewData.listings && previewData.listings.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Propiedades a importar ({previewData.listings.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {previewData.listings.map((listing: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{listing.title || `Propiedad ${index + 1}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {listing.tipo || (listing.categoryId === '1' ? 'Alquiler' : 'Venta')} • 
                            {listing.price ? ` $${listing.price.toLocaleString('es-AR')}` : ' Consultar precio'}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false)
                  setPreviewData(null)
                }}
                disabled={isImporting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={isImporting || !previewData || previewData.valid === 0}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar {previewData?.valid || 0} Propiedades
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

