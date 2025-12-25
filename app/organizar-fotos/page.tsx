// Página para organizar y asociar fotos con productos
'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, FileSpreadsheet, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  titulo: string
  foto_principal?: string
  foto_2?: string
  foto_3?: string
  foto_4?: string
  rowNumber: number
}

interface ImageFile {
  name: string
  url: string
  assigned: boolean
}

export default function OrganizarFotosPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Cargar imágenes disponibles
  useEffect(() => {
    loadAvailableImages()
  }, [])

  const loadAvailableImages = async () => {
    try {
      const response = await fetch('/api/images/list')
      if (response.ok) {
        const data = await response.json()
        setImages(data.images.map((img: string) => ({
          name: img,
          url: `/uploads/${img}`,
          assigned: false,
        })))
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error)
    }
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExcelFile(file)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/organize/read-excel', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al leer el Excel')
        return
      }

      setProducts(result.products)
      toast.success(`${result.products.length} productos cargados desde el Excel`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar el Excel')
    } finally {
      setLoading(false)
    }
  }

  const assignImageToProduct = (productIndex: number, imageName: string, photoType: 'foto_principal' | 'foto_2' | 'foto_3' | 'foto_4' = 'foto_principal') => {
    const updatedProducts = [...products]
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      [photoType]: imageName,
    }
    setProducts(updatedProducts)

    // Marcar imagen como asignada
    const updatedImages = images.map(img =>
      img.name === imageName ? { ...img, assigned: true } : img
    )
    setImages(updatedImages)

    toast.success(`Imagen "${imageName}" asignada a "${updatedProducts[productIndex].titulo}"`)
  }

  const removeImageFromProduct = (productIndex: number, photoType: 'foto_principal' | 'foto_2' | 'foto_3' | 'foto_4') => {
    const updatedProducts = [...products]
    const imageName = updatedProducts[productIndex][photoType]
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      [photoType]: undefined,
    }
    setProducts(updatedProducts)

    // Marcar imagen como no asignada
    const updatedImages = images.map(img =>
      img.name === imageName ? { ...img, assigned: false } : img
    )
    setImages(updatedImages)
  }

  const saveAssignments = async () => {
    if (!excelFile) {
      toast.error('Primero sube un archivo Excel')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', excelFile)
      formData.append('products', JSON.stringify(products))

      const response = await fetch('/api/organize/update-excel', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al guardar')
        return
      }

      // Descargar Excel actualizado
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'productos_con_fotos.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Excel actualizado descargado')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Organizar Fotos de Productos
          </h1>
          <p className="text-muted-foreground">
            Asocia las fotos con cada producto de tu Excel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Subir Excel y lista de productos */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">1. Subir Excel con Productos</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="excel-file">Archivo Excel</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Sube tu Excel con los productos. Debe tener columnas: titulo, categoria, zona, descripcion, foto_principal, etc.
                  </p>
                </div>

                {products.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Productos cargados: {products.length}</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {products.map((product, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{product.titulo}</h4>
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-medium">Principal:</span>
                                  {product.foto_principal ? (
                                    <span className="text-green-600">{product.foto_principal}</span>
                                  ) : (
                                    <span className="text-muted-foreground">Sin asignar</span>
                                  )}
                                </div>
                                {[2, 3, 4].map(num => {
                                  const fotoKey = `foto_${num}` as 'foto_2' | 'foto_3' | 'foto_4'
                                  const foto = product[fotoKey]
                                  return (
                                    <div key={num} className="flex items-center gap-2 text-xs">
                                      <span className="font-medium">Foto {num}:</span>
                                      {foto ? (
                                        <span className="text-green-600">{foto}</span>
                                      ) : (
                                        <span className="text-muted-foreground">Sin asignar</span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(index)}
                            >
                              Asignar
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Panel derecho: Imágenes disponibles */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">2. Fotos Disponibles</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay imágenes en /public/uploads/
                  </p>
                ) : (
                  images.map((image) => (
                    <div
                      key={image.name}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        image.assigned
                          ? 'bg-green-50 border-green-200'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => {
                        if (selectedProduct !== null) {
                          assignImageToProduct(selectedProduct, image.name)
                          setSelectedProduct(null)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{image.name}</p>
                          {image.assigned && (
                            <p className="text-xs text-green-600">Asignada</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {products.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">3. Guardar Cambios</h2>
                <Button
                  onClick={saveAssignments}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Descargar Excel Actualizado
                    </>
                  )}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}



