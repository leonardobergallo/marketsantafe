// Página para carga masiva de productos - Manual y desde Excel
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { ImageUpload } from '@/components/ui/image-upload'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { toast } from 'sonner'
import { ArrowLeft, Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertCircle, Eye, Plus, Trash2, ShoppingBag, Home, Building2, User } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'

type UploadMode = 'manual' | 'excel'
type ContentType = 'productos' | 'propiedades'
type PropertyType = 'particular' | 'inmobiliaria' | null

interface ImportResult {
  message: string
  success: number
  errors: Array<{ row: number; error: string }>
  listings: Array<{ id: number; title: string }>
}

interface BatchResult {
  message: string
  success: number
  errors: Array<{ index: number; title: string; error: string }>
  listings?: Array<{ id: number; title: string }>
  properties?: Array<{ id: number; title: string }>
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

interface ProductFormData {
  title: string
  categoryId: string
  zoneId: string
  description: string
  price: string
  currency: 'ARS' | 'USD'
  condition: '' | 'nuevo' | 'usado' | 'reacondicionado'
  images: string[]
  whatsapp?: string
  phone?: string
  email?: string
  instagram?: string
}

interface GlobalContact {
  whatsapp: string
  phone: string
  email: string
  instagram: string
}

interface PropertyFormData {
  type: 'alquiler' | 'venta' | 'alquiler-temporal'
  title: string
  zoneId: string
  description: string
  price: string
  currency: 'ARS' | 'USD'
  rooms: string
  bathrooms: string
  area_m2: string
  address: string
  images: string[]
  whatsapp?: string
  phone?: string
  email?: string
  instagram?: string
  professional_service: boolean
}

export default function PublicarMasivoPage() {
  const router = useRouter()
  const [contentType, setContentType] = useState<ContentType>('productos')
  const [propertyType, setPropertyType] = useState<PropertyType>(null)
  const [mode, setMode] = useState<UploadMode>('manual')
  
  // Estados para Excel
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [isUploadingExcel, setIsUploadingExcel] = useState(false)
  const [excelResult, setExcelResult] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Estados para Carga Manual - Productos
  const [globalContact, setGlobalContact] = useState<GlobalContact>({
    whatsapp: '',
    phone: '',
    email: '',
    instagram: '',
  })
  const [products, setProducts] = useState<ProductFormData[]>([
    {
      title: '',
      categoryId: 'all',
      zoneId: 'all',
      description: '',
      price: '',
      currency: 'ARS',
      condition: '',
      images: [],
    },
  ])
  const [isUploadingManual, setIsUploadingManual] = useState(false)
  const [manualResult, setManualResult] = useState<BatchResult | null>(null)

  // Estados para Carga Manual - Propiedades
  const [properties, setProperties] = useState<PropertyFormData[]>([
    {
      type: 'alquiler',
      title: '',
      zoneId: 'all',
      description: '',
      price: '',
      currency: 'ARS',
      rooms: '',
      bathrooms: '',
      area_m2: '',
      address: '',
      images: [],
      professional_service: false,
    },
  ])

  // Manejar cambio de archivo Excel
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
        toast.error('El archivo debe ser un Excel (.xlsx, .xls) o CSV')
        return
      }
      setFile(selectedFile)
      setExcelResult(null)
      setShowPreview(false)

      // Leer el Excel en el cliente para mostrar vista previa
      try {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet) as PreviewRow[]

        if (data.length === 0) {
          toast.error('El archivo está vacío')
          return
        }

        if (data.length > 50) {
          toast.warning(`El archivo tiene ${data.length} ${contentType === 'productos' ? 'productos' : 'propiedades'}. Solo se procesarán los primeros 50.`)
        }

        // Validar columnas requeridas según el tipo de contenido
        const requiredColumns = contentType === 'productos' 
          ? ['titulo', 'categoria', 'zona', 'descripcion']
          : ['titulo', 'tipo', 'zona', 'descripcion', 'precio']
        const firstRow = data[0]
        const missingColumns = requiredColumns.filter(col => !(col in firstRow))

        if (missingColumns.length > 0) {
          toast.error(`Faltan columnas requeridas: ${missingColumns.join(', ')}`)
          return
        }

        setPreviewData(data.slice(0, 50))
        setShowPreview(true)
        toast.success(`Archivo cargado: ${data.length} ${contentType === 'productos' ? 'productos' : 'propiedades'} encontrados`)
      } catch (error: any) {
        console.error('Error leyendo archivo:', error)
        toast.error('Error al leer el archivo')
      }
    }
  }

  // Enviar Excel
  const handleExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Selecciona un archivo')
      return
    }

    setIsUploadingExcel(true)
    setExcelResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Usar endpoint diferente según el tipo de contenido
      const endpoint = contentType === 'productos' 
        ? '/api/publish/listing/import-excel'
        : '/api/properties/import-excel'

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al importar el archivo')
        if (data.details) {
          console.error('Detalles del error:', data.details)
        }
        setIsUploadingExcel(false)
        return
      }

      setExcelResult(data)
      setShowPreview(false)
      const itemType = contentType === 'productos' ? 'productos' : 'propiedades'
      toast.success(`¡Importación completada! ${data.success} ${itemType} creados`)
      
      if (data.errors && data.errors.length > 0) {
        toast.warning(`${data.errors.length} ${itemType} tuvieron errores`)
      }
    } catch (error: any) {
      console.error('Error al importar:', error)
      toast.error('Error al importar el archivo')
    } finally {
      setIsUploadingExcel(false)
    }
  }

  // Agregar producto en modo manual
  const addProduct = () => {
    setProducts([...products, {
      title: '',
      categoryId: 'all',
      zoneId: 'all',
      description: '',
      price: '',
      currency: 'ARS',
      condition: '',
      images: [],
    }])
  }

  // Eliminar producto en modo manual
  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index))
    }
  }

  // Actualizar producto en modo manual
  const updateProduct = (index: number, field: keyof ProductFormData, value: any) => {
    const updated = [...products]
    updated[index] = { ...updated[index], [field]: value }
    setProducts(updated)
  }

  // Agregar propiedad en modo manual
  const addProperty = () => {
    setProperties([...properties, {
      type: 'alquiler',
      title: '',
      zoneId: 'all',
      description: '',
      price: '',
      currency: 'ARS',
      rooms: '',
      bathrooms: '',
      area_m2: '',
      address: '',
      images: [],
      professional_service: false,
    }])
  }

  // Eliminar propiedad en modo manual
  const removeProperty = (index: number) => {
    if (properties.length > 1) {
      setProperties(properties.filter((_, i) => i !== index))
    }
  }

  // Actualizar propiedad en modo manual
  const updateProperty = (index: number, field: keyof PropertyFormData, value: any) => {
    const updated = [...properties]
    updated[index] = { ...updated[index], [field]: value }
    setProperties(updated)
  }

  // Validar y enviar productos manuales
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (contentType === 'productos') {
      // Validar que todos los productos tengan datos requeridos
      const errors: string[] = []
      products.forEach((product, index) => {
        if (!product.title.trim()) {
          errors.push(`Producto ${index + 1}: El título es requerido`)
        }
        if (product.categoryId === 'all' || !product.categoryId) {
          errors.push(`Producto ${index + 1}: La categoría es requerida`)
        }
        if (product.zoneId === 'all' || !product.zoneId) {
          errors.push(`Producto ${index + 1}: La zona es requerida`)
        }
        if (!product.description.trim()) {
          errors.push(`Producto ${index + 1}: La descripción es requerida`)
        }
      })

      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }

      setIsUploadingManual(true)
      setManualResult(null)

      try {
        const response = await fetch('/api/publish/listing/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: products.map(product => ({
              title: product.title.trim(),
              categoryId: product.categoryId,
              zoneId: product.zoneId,
              description: product.description.trim(),
              price: product.price || undefined,
              currency: product.currency,
              condition: product.condition || undefined,
              images: product.images,
              whatsapp: product.whatsapp?.trim() || undefined,
              phone: product.phone?.trim() || undefined,
              email: product.email?.trim() || undefined,
              instagram: product.instagram?.trim() || undefined,
            })),
            globalContact: {
              whatsapp: globalContact.whatsapp.trim() || undefined,
              phone: globalContact.phone.trim() || undefined,
              email: globalContact.email.trim() || undefined,
              instagram: globalContact.instagram.trim() || undefined,
            },
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || data.message || 'Error al publicar productos')
          setIsUploadingManual(false)
          return
        }

        setManualResult(data)
        toast.success(`¡Publicación completada! ${data.success} productos creados`)
        
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} productos tuvieron errores`)
        }
      } catch (error: any) {
        console.error('Error al publicar:', error)
        toast.error('Error al publicar los productos')
      } finally {
        setIsUploadingManual(false)
      }
    } else {
      // Validar propiedades
      const errors: string[] = []
      properties.forEach((property, index) => {
        if (!property.title.trim()) {
          errors.push(`Propiedad ${index + 1}: El título es requerido`)
        }
        if (property.zoneId === 'all' || !property.zoneId) {
          errors.push(`Propiedad ${index + 1}: La zona es requerida`)
        }
        if (!property.description.trim()) {
          errors.push(`Propiedad ${index + 1}: La descripción es requerida`)
        }
        if (!property.price.trim()) {
          errors.push(`Propiedad ${index + 1}: El precio es requerido`)
        }
      })

      if (errors.length > 0) {
        toast.error(errors[0])
        return
      }

      setIsUploadingManual(true)
      setManualResult(null)

      try {
        const response = await fetch('/api/properties/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: properties.map(property => ({
              type: property.type,
              title: property.title.trim(),
              zone_id: property.zoneId,
              description: property.description.trim(),
              price: property.price,
              currency: property.currency,
              rooms: property.rooms || undefined,
              bathrooms: property.bathrooms || undefined,
              area_m2: property.area_m2 || undefined,
              address: property.address.trim() || undefined,
              images: property.images,
              whatsapp: property.whatsapp?.trim() || undefined,
              phone: property.phone?.trim() || undefined,
              email: property.email?.trim() || undefined,
              instagram: property.instagram?.trim() || undefined,
              professional_service: property.professional_service,
            })),
            globalContact: {
              whatsapp: globalContact.whatsapp.trim() || undefined,
              phone: globalContact.phone.trim() || undefined,
              email: globalContact.email.trim() || undefined,
              instagram: globalContact.instagram.trim() || undefined,
            },
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || data.message || 'Error al publicar propiedades')
          setIsUploadingManual(false)
          return
        }

        setManualResult(data)
        toast.success(`¡Publicación completada! ${data.success} propiedades creadas`)
        
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} propiedades tuvieron errores`)
        }
      } catch (error: any) {
        console.error('Error al publicar:', error)
        toast.error('Error al publicar las propiedades')
      } finally {
        setIsUploadingManual(false)
      }
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
            Volver a publicación individual
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Carga Masiva
          </h1>
          <p className="text-muted-foreground">
            Publicá múltiples productos o propiedades a la vez con sus fotos
          </p>
        </div>

        {/* Selector de tipo de contenido */}
        <div className="flex gap-4 mb-6">
          <Button
            type="button"
            variant={contentType === 'productos' ? 'default' : 'outline'}
            onClick={() => {
              setContentType('productos')
              setPropertyType(null) // Limpiar tipo de propiedad al cambiar a productos
              setManualResult(null)
            }}
            className="flex-1"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Productos
          </Button>
          <Button
            type="button"
            variant={contentType === 'propiedades' ? 'default' : 'outline'}
            onClick={() => {
              setContentType('propiedades')
              setPropertyType(null) // Resetear el tipo de propiedad al cambiar
              setManualResult(null)
            }}
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Propiedades
          </Button>
        </div>

        {/* Selector de tipo de propiedad (solo cuando se selecciona Propiedades) */}
        {contentType === 'propiedades' && !propertyType && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">¿Cómo vas a publicar?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Seleccioná si vas a publicar como particular o como inmobiliaria
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPropertyType('particular')}
                className="h-auto p-6 flex flex-col items-start"
              >
                <User className="h-8 w-8 mb-3 text-primary" />
                <span className="text-lg font-semibold">Particular</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Publicá propiedades como persona particular
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPropertyType('inmobiliaria')}
                className="h-auto p-6 flex flex-col items-start"
              >
                <Building2 className="h-8 w-8 mb-3 text-primary" />
                <span className="text-lg font-semibold">Inmobiliaria</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Publicá propiedades como inmobiliaria profesional
                </span>
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs para seleccionar modo (solo mostrar si ya se seleccionó el tipo de propiedad o si es productos) */}
        {((contentType === 'propiedades' && propertyType) || contentType === 'productos') && (
          <div className="flex gap-4 mb-6">
            <Button
              type="button"
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carga Manual
            </Button>
            <Button
              type="button"
              variant={mode === 'excel' ? 'default' : 'outline'}
              onClick={() => setMode('excel')}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar desde Excel
            </Button>
          </div>
        )}

        {/* MODO MANUAL */}
        {mode === 'manual' && contentType === 'productos' && (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            {/* Contacto Global */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Contacto (aplicará a todos los productos)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Estos datos se usarán para todos los productos que no tengan contacto individual
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="global-whatsapp">WhatsApp</Label>
                  <PhoneInput
                    id="global-whatsapp"
                    placeholder="3425-123456"
                    value={globalContact.whatsapp}
                    onChange={(e) => setGlobalContact({ ...globalContact, whatsapp: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-phone">Teléfono</Label>
                  <PhoneInput
                    id="global-phone"
                    placeholder="3425-123456"
                    value={globalContact.phone}
                    onChange={(e) => setGlobalContact({ ...globalContact, phone: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-email">Email</Label>
                  <Input
                    id="global-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={globalContact.email}
                    onChange={(e) => setGlobalContact({ ...globalContact, email: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-instagram">Instagram</Label>
                  <Input
                    id="global-instagram"
                    placeholder="@tuusuario"
                    value={globalContact.instagram}
                    onChange={(e) => setGlobalContact({ ...globalContact, instagram: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
              </div>
            </Card>

            {/* Productos */}
            {products.map((product, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Producto {index + 1}</h2>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      disabled={isUploadingManual}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor={`title-${index}`}>
                      Título <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`title-${index}`}
                      placeholder="Ej: iPhone 13 Pro Max 256GB"
                      value={product.title}
                      onChange={(e) => updateProduct(index, 'title', e.target.value)}
                      disabled={isUploadingManual}
                      required
                    />
                  </div>

                  {/* Categoría y Zona */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`category-${index}`}>
                        Categoría <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={product.categoryId}
                        onValueChange={(value) => updateProduct(index, 'categoryId', value)}
                        disabled={isUploadingManual}
                      >
                        <SelectTrigger id={`category-${index}`}>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories
                            .filter(cat => cat.slug !== 'alquileres' && cat.slug !== 'inmuebles')
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`zone-${index}`}>
                        Zona <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={product.zoneId}
                        onValueChange={(value) => updateProduct(index, 'zoneId', value)}
                        disabled={isUploadingManual}
                      >
                        <SelectTrigger id={`zone-${index}`}>
                          <SelectValue placeholder="Selecciona zona" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`description-${index}`}
                      placeholder="Describe tu producto..."
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      disabled={isUploadingManual}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Precio y Condición */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>Precio</Label>
                      <PriceInputWithCurrency
                        value={product.price}
                        currency={product.currency}
                        onPriceChange={(price) => updateProduct(index, 'price', price)}
                        onCurrencyChange={(currency) => updateProduct(index, 'currency', currency)}
                        disabled={isUploadingManual}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`condition-${index}`}>Condición</Label>
                      <Select
                        value={product.condition || 'none'}
                        onValueChange={(value) => updateProduct(index, 'condition', value === 'none' ? '' : value as any)}
                        disabled={isUploadingManual}
                      >
                        <SelectTrigger id={`condition-${index}`}>
                          <SelectValue placeholder="Selecciona condición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin especificar</SelectItem>
                          <SelectItem value="nuevo">Nuevo</SelectItem>
                          <SelectItem value="usado">Usado</SelectItem>
                          <SelectItem value="reacondicionado">Reacondicionado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-2">
                    <Label htmlFor={`images-${index}`}>Fotos (máximo 5)</Label>
                    <ImageUpload
                      value={product.images}
                      onChange={(images) => updateProduct(index, 'images', images)}
                      maxImages={5}
                      disabled={isUploadingManual}
                    />
                  </div>

                  {/* Contacto Individual (Opcional) */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Contacto individual (opcional - si no completás, se usará el contacto global)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`whatsapp-${index}`}>WhatsApp</Label>
                        <PhoneInput
                          id={`whatsapp-${index}`}
                          placeholder="3425-123456"
                          value={product.whatsapp || ''}
                          onChange={(e) => updateProduct(index, 'whatsapp', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${index}`}>Teléfono</Label>
                        <PhoneInput
                          id={`phone-${index}`}
                          placeholder="3425-123456"
                          value={product.phone || ''}
                          onChange={(e) => updateProduct(index, 'phone', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          placeholder="tu@email.com"
                          value={product.email || ''}
                          onChange={(e) => updateProduct(index, 'email', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`instagram-${index}`}>Instagram</Label>
                        <Input
                          id={`instagram-${index}`}
                          placeholder="@tuusuario"
                          value={product.instagram || ''}
                          onChange={(e) => updateProduct(index, 'instagram', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Botón Agregar Producto */}
            <Button
              type="button"
              variant="outline"
              onClick={addProduct}
              disabled={isUploadingManual}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar otro producto
            </Button>

            {/* Botones de envío */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isUploadingManual}
                className="flex-1"
              >
                {isUploadingManual ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Publicar {products.length} {products.length === 1 ? 'producto' : 'productos'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploadingManual}
              >
                Cancelar
              </Button>
            </div>

            {/* Resultados Manual */}
            {manualResult && (
              <Card className="p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {manualResult.success > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Resultados de la publicación
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{manualResult.success}</div>
                      <div className="text-sm text-muted-foreground">Productos creados</div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{manualResult.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Errores</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{manualResult.listings?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Total procesados</div>
                    </div>
                  </div>

                  {manualResult.errors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Errores encontrados:
                      </h3>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {manualResult.errors.map((error, idx) => (
                          <div key={idx} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
                            <strong>Producto {error.index}:</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {manualResult.success > 0 && (
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
          </form>
        )}

        {/* MODO MANUAL - PROPIEDADES */}
        {mode === 'manual' && contentType === 'propiedades' && propertyType && (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            {/* Contacto Global */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Contacto (aplicará a todas las propiedades)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Estos datos se usarán para todas las propiedades que no tengan contacto individual
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="global-whatsapp-prop">WhatsApp</Label>
                  <PhoneInput
                    id="global-whatsapp-prop"
                    placeholder="3425-123456"
                    value={globalContact.whatsapp}
                    onChange={(e) => setGlobalContact({ ...globalContact, whatsapp: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-phone-prop">Teléfono</Label>
                  <PhoneInput
                    id="global-phone-prop"
                    placeholder="3425-123456"
                    value={globalContact.phone}
                    onChange={(e) => setGlobalContact({ ...globalContact, phone: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-email-prop">Email</Label>
                  <Input
                    id="global-email-prop"
                    type="email"
                    placeholder="tu@email.com"
                    value={globalContact.email}
                    onChange={(e) => setGlobalContact({ ...globalContact, email: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global-instagram-prop">Instagram</Label>
                  <Input
                    id="global-instagram-prop"
                    placeholder="@tuusuario"
                    value={globalContact.instagram}
                    onChange={(e) => setGlobalContact({ ...globalContact, instagram: e.target.value })}
                    disabled={isUploadingManual}
                  />
                </div>
              </div>
            </Card>

            {/* Propiedades */}
            {properties.map((property, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Propiedad {index + 1}</h2>
                  {properties.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProperty(index)}
                      disabled={isUploadingManual}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Tipo y Título */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`type-${index}`}>
                        Tipo <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={property.type}
                        onValueChange={(value) => updateProperty(index, 'type', value as any)}
                        disabled={isUploadingManual}
                      >
                        <SelectTrigger id={`type-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alquiler">Alquiler</SelectItem>
                          <SelectItem value="venta">Venta</SelectItem>
                          <SelectItem value="alquiler-temporal">Alquiler Temporal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`prop-title-${index}`}>
                        Título <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`prop-title-${index}`}
                        placeholder="Ej: Departamento 2 ambientes en Centro"
                        value={property.title}
                        onChange={(e) => updateProperty(index, 'title', e.target.value)}
                        disabled={isUploadingManual}
                        required
                      />
                    </div>
                  </div>

                  {/* Zona y Precio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`prop-zone-${index}`}>
                        Zona <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={property.zoneId}
                        onValueChange={(value) => updateProperty(index, 'zoneId', value)}
                        disabled={isUploadingManual}
                      >
                        <SelectTrigger id={`prop-zone-${index}`}>
                          <SelectValue placeholder="Selecciona zona" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`prop-price-${index}`}>
                        Precio <span className="text-destructive">*</span>
                      </Label>
                      <PriceInputWithCurrency
                        value={property.price}
                        currency={property.currency}
                        onPriceChange={(price) => updateProperty(index, 'price', price)}
                        onCurrencyChange={(currency) => updateProperty(index, 'currency', currency)}
                        disabled={isUploadingManual}
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor={`prop-description-${index}`}>
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`prop-description-${index}`}
                      placeholder="Describe la propiedad..."
                      value={property.description}
                      onChange={(e) => updateProperty(index, 'description', e.target.value)}
                      disabled={isUploadingManual}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Características */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`prop-rooms-${index}`}>Ambientes</Label>
                      <Input
                        id={`prop-rooms-${index}`}
                        type="number"
                        placeholder="Ej: 2"
                        value={property.rooms}
                        onChange={(e) => updateProperty(index, 'rooms', e.target.value)}
                        disabled={isUploadingManual}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`prop-bathrooms-${index}`}>Baños</Label>
                      <Input
                        id={`prop-bathrooms-${index}`}
                        type="number"
                        placeholder="Ej: 1"
                        value={property.bathrooms}
                        onChange={(e) => updateProperty(index, 'bathrooms', e.target.value)}
                        disabled={isUploadingManual}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`prop-area-${index}`}>Superficie (m²)</Label>
                      <Input
                        id={`prop-area-${index}`}
                        type="number"
                        placeholder="Ej: 65"
                        value={property.area_m2}
                        onChange={(e) => updateProperty(index, 'area_m2', e.target.value)}
                        disabled={isUploadingManual}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label htmlFor={`prop-address-${index}`}>Dirección</Label>
                    <Input
                      id={`prop-address-${index}`}
                      placeholder="Ej: San Martín 1234"
                      value={property.address}
                      onChange={(e) => updateProperty(index, 'address', e.target.value)}
                      disabled={isUploadingManual}
                    />
                  </div>

                  {/* Imágenes */}
                  <div className="space-y-2">
                    <Label htmlFor={`prop-images-${index}`}>Fotos (máximo 10)</Label>
                    <ImageUpload
                      value={property.images}
                      onChange={(images) => updateProperty(index, 'images', images)}
                      maxImages={10}
                      disabled={isUploadingManual}
                    />
                  </div>

                  {/* Servicio Profesional */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`prop-professional-${index}`}
                      checked={property.professional_service}
                      onChange={(e) => updateProperty(index, 'professional_service', e.target.checked)}
                      disabled={isUploadingManual}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`prop-professional-${index}`} className="text-sm font-normal cursor-pointer">
                      Solicitar servicio profesional inmobiliario
                    </Label>
                  </div>

                  {/* Contacto Individual (Opcional) */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Contacto individual (opcional - si no completás, se usará el contacto global)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`prop-whatsapp-${index}`}>WhatsApp</Label>
                        <PhoneInput
                          id={`prop-whatsapp-${index}`}
                          placeholder="3425-123456"
                          value={property.whatsapp || ''}
                          onChange={(e) => updateProperty(index, 'whatsapp', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`prop-phone-${index}`}>Teléfono</Label>
                        <PhoneInput
                          id={`prop-phone-${index}`}
                          placeholder="3425-123456"
                          value={property.phone || ''}
                          onChange={(e) => updateProperty(index, 'phone', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`prop-email-${index}`}>Email</Label>
                        <Input
                          id={`prop-email-${index}`}
                          type="email"
                          placeholder="tu@email.com"
                          value={property.email || ''}
                          onChange={(e) => updateProperty(index, 'email', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`prop-instagram-${index}`}>Instagram</Label>
                        <Input
                          id={`prop-instagram-${index}`}
                          placeholder="@tuusuario"
                          value={property.instagram || ''}
                          onChange={(e) => updateProperty(index, 'instagram', e.target.value)}
                          disabled={isUploadingManual}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Botón Agregar Propiedad */}
            <Button
              type="button"
              variant="outline"
              onClick={addProperty}
              disabled={isUploadingManual}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar otra propiedad
            </Button>

            {/* Botones de envío */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isUploadingManual}
                className="flex-1"
              >
                {isUploadingManual ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Publicar {properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploadingManual}
              >
                Cancelar
              </Button>
            </div>

            {/* Resultados Manual - Propiedades */}
            {manualResult && (
              <Card className="p-6 mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {manualResult.success > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Resultados de la publicación
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{manualResult.success}</div>
                      <div className="text-sm text-muted-foreground">Propiedades creadas</div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{manualResult.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Errores</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{manualResult.properties?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Total procesadas</div>
                    </div>
                  </div>

                  {manualResult.errors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Errores encontrados:
                      </h3>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {manualResult.errors.map((error, idx) => (
                          <div key={idx} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
                            <strong>Propiedad {error.index}:</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {manualResult.success > 0 && (
                    <div className="pt-4 border-t">
                      <Button asChild>
                        <Link href="/propiedades">
                          Ver propiedades publicadas
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </form>
        )}

        {/* MODO EXCEL */}
        {mode === 'excel' && ((contentType === 'propiedades' && propertyType) || contentType === 'productos') && (
          <>
        {/* Instrucciones */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Formato del Excel
          </h2>
          <div className="space-y-3 text-sm">
                {contentType === 'productos' ? (
                  <>
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
                      <li><code className="bg-muted px-1 rounded">foto_2, foto_3, foto_4</code> - Fotos adicionales</li>
                      <li><code className="bg-muted px-1 rounded">whatsapp, telefono, email, instagram</code> - Contacto</li>
            </ul>
                  </>
                ) : (
                  <>
                    <p><strong>Columnas requeridas:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                      <li><code className="bg-muted px-1 rounded">titulo</code> - Título de la propiedad</li>
                      <li><code className="bg-muted px-1 rounded">tipo</code> - alquiler, venta o alquiler-temporal</li>
                      <li><code className="bg-muted px-1 rounded">zona</code> - Nombre o ID de la zona</li>
                      <li><code className="bg-muted px-1 rounded">descripcion</code> - Descripción de la propiedad</li>
                      <li><code className="bg-muted px-1 rounded">precio</code> - Precio de la propiedad</li>
                    </ul>
                    <p className="mt-4"><strong>Columnas opcionales:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                      <li><code className="bg-muted px-1 rounded">moneda</code> - ARS o USD (default: ARS)</li>
                      <li><code className="bg-muted px-1 rounded">ambientes</code> - Cantidad de ambientes</li>
                      <li><code className="bg-muted px-1 rounded">banos</code> o <code className="bg-muted px-1 rounded">bathrooms</code> - Cantidad de baños</li>
                      <li><code className="bg-muted px-1 rounded">superficie</code> o <code className="bg-muted px-1 rounded">area_m2</code> - Superficie en m²</li>
                      <li><code className="bg-muted px-1 rounded">direccion</code> o <code className="bg-muted px-1 rounded">address</code> - Dirección</li>
                      <li><code className="bg-muted px-1 rounded">foto_principal</code> - Nombre del archivo en /uploads/</li>
                      <li><code className="bg-muted px-1 rounded">foto_2, foto_3, foto_4, foto_5...</code> - Fotos adicionales (hasta 10)</li>
                      <li><code className="bg-muted px-1 rounded">whatsapp, telefono, email, instagram</code> - Contacto</li>
                      <li><code className="bg-muted px-1 rounded">servicio_profesional</code> - si, true o 1 para activar</li>
                    </ul>
                  </>
                )}
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

            {/* Formulario de subida Excel */}
        <Card className="p-6 mb-6">
              <form onSubmit={handleExcelSubmit} className="space-y-6">
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                    Seleccionar archivo
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="file"
                  type="file"
                      accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    cursor-pointer"
                      disabled={isUploadingExcel}
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Archivo seleccionado: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                    Formatos aceptados: .xlsx, .xls, .csv (máximo 50 {contentType})
              </p>
            </div>

            {showPreview && previewData.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                        Vista previa ({previewData.length} {contentType === 'productos' ? 'productos' : 'propiedades'})
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
                            {contentType === 'productos' ? (
                              <>
                        <th className="px-3 py-2 text-left font-semibold border-b">Categoría</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Zona</th>
                        <th className="px-3 py-2 text-left font-semibold border-b">Precio</th>
                              </>
                            ) : (
                              <>
                                <th className="px-3 py-2 text-left font-semibold border-b">Tipo</th>
                                <th className="px-3 py-2 text-left font-semibold border-b">Zona</th>
                                <th className="px-3 py-2 text-left font-semibold border-b">Precio</th>
                              </>
                            )}
                        <th className="px-3 py-2 text-left font-semibold border-b">Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                          {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium max-w-xs truncate" title={row.titulo}>
                            {row.titulo || '-'}
                          </td>
                              {contentType === 'productos' ? (
                                <>
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
                                </>
                              ) : (
                                <>
                                  <td className="px-3 py-2 text-muted-foreground">{row.tipo || '-'}</td>
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
                                </>
                              )}
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
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                    disabled={!file || isUploadingExcel || !showPreview}
                className="flex-1"
              >
                    {isUploadingExcel ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                        Importar {previewData.length > 0 ? `${previewData.length} ${contentType === 'productos' ? 'productos' : 'propiedades'}` : contentType}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                    disabled={isUploadingExcel}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>

            {/* Resultados Excel */}
            {excelResult && (
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {excelResult.success > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Resultados de la importación
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{excelResult.success}</div>
                      <div className="text-sm text-muted-foreground">{contentType === 'productos' ? 'Productos creados' : 'Propiedades creadas'}</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{excelResult.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errores</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{contentType === 'productos' ? (excelResult.listings?.length || 0) : (excelResult.properties?.length || 0)}</div>
                  <div className="text-sm text-muted-foreground">Total procesados</div>
                </div>
              </div>

                  {excelResult.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Errores encontrados:
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                        {excelResult.errors.map((error, idx) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
                        <strong>Fila {error.row}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                  {excelResult.success > 0 && (
                <div className="pt-4 border-t">
                  <Button asChild>
                        <Link href={contentType === 'productos' ? "/mercado" : "/propiedades"}>
                          Ver {contentType === 'productos' ? 'productos en el mercado' : 'propiedades publicadas'}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}