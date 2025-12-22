// Página para publicar múltiples productos a la vez
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'
import { type Condition } from '@/lib/mockListings'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Loader2, Upload, FileSpreadsheet, Download, Sparkles, X, ZoomIn, Edit2, Save } from 'lucide-react'
import Link from 'next/link'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { ImageUpload } from '@/components/ui/image-upload'
import { PhoneInput } from '@/components/ui/phone-input'

interface ProductForm {
  id: string
  title: string
  categoryId: string
  zoneId: string
  price: string
  currency: 'ARS' | 'USD'
  condition: Condition | ''
  description: string
  images: string[]
  // Campos opcionales individuales
  whatsapp?: string
  phone?: string
  email?: string
  instagram?: string
}

export default function PublicarMasivoPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showExcelImport, setShowExcelImport] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [enhancingImages, setEnhancingImages] = useState<Map<string, boolean>>(new Map()) // Map<"listingIndex_imageIndex", boolean>
  const [enhancedImages, setEnhancedImages] = useState<Map<string, string>>(new Map()) // Map<"listingIndex_imageIndex", enhancedImageUrl>
  const [selectedImagePreview, setSelectedImagePreview] = useState<{ listingIndex: number; imageIndex: number; url: string } | null>(null)
  const [editingListing, setEditingListing] = useState<number | null>(null) // Index del listing que se está editando
  const imageFileInputRefs = useRef<Map<number, HTMLInputElement | null>>(new Map()) // Refs para inputs de archivos por listing
  
  // Estado para los productos
  const [products, setProducts] = useState<ProductForm[]>([
    {
      id: '1',
      title: '',
      categoryId: 'all',
      zoneId: 'all',
      price: '',
      currency: 'ARS',
      condition: '',
      description: '',
      images: [],
    },
  ])

  // Campos compartidos (se aplican a todos los productos si no tienen valores individuales)
  const [defaultContact, setDefaultContact] = useState({
    whatsapp: '',
    phone: '',
    email: '',
    instagram: '',
  })

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push(`/login?returnUrl=${encodeURIComponent('/publicar/masivo')}`)
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push(`/login?returnUrl=${encodeURIComponent('/publicar/masivo')}`)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Agregar un nuevo producto
  const addProduct = () => {
    const newId = String(Date.now())
    setProducts([
      ...products,
      {
        id: newId,
        title: '',
        categoryId: 'all',
        zoneId: 'all',
        price: '',
        currency: 'ARS',
        condition: '',
        description: '',
        images: [],
      },
    ])
  }

  // Eliminar un producto
  const removeProduct = (id: string) => {
    if (products.length === 1) {
      toast.error('Debes tener al menos un producto')
      return
    }
    setProducts(products.filter((p) => p.id !== id))
  }

  // Actualizar un campo de un producto
  const updateProduct = (id: string, field: keyof ProductForm, value: any) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  // Validar un producto individual
  const validateProduct = (product: ProductForm): string[] => {
    const errors: string[] = []
    
    if (!product.title || product.title.trim().length < 5) {
      errors.push('Título debe tener al menos 5 caracteres')
    }
    if (product.categoryId === 'all') {
      errors.push('Debes seleccionar una categoría')
    }
    if (product.zoneId === 'all') {
      errors.push('Debes seleccionar una zona')
    }
    if (!product.description || product.description.trim().length < 10) {
      errors.push('Descripción debe tener al menos 10 caracteres')
    }
    
    return errors
  }

  // Manejar preview de importación desde Excel
  const handleExcelPreview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsImporting(true)

    // Usar el archivo del estado o del ref
    const file = selectedFile || (fileInputRef.current?.files?.[0] || null)
    
    if (!file) {
      toast.error('Por favor selecciona un archivo Excel')
      setIsImporting(false)
      return
    }
    const previewFormData = new FormData()
    previewFormData.append('file', file)
    previewFormData.append('previewOnly', 'true')
    
    // Agregar contactos por defecto si están definidos
    if (defaultContact.whatsapp) previewFormData.append('defaultWhatsapp', defaultContact.whatsapp)
    if (defaultContact.phone) previewFormData.append('defaultPhone', defaultContact.phone)
    if (defaultContact.email) previewFormData.append('defaultEmail', defaultContact.email)
    if (defaultContact.instagram) previewFormData.append('defaultInstagram', defaultContact.instagram)

    try {
      const response = await fetch('/api/publish/listing/import-excel-v2', {
        method: 'POST',
        body: previewFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        // Mostrar error más detallado
        const errorMessage = result.error || 'Error al procesar el archivo Excel'
        console.error('Error del servidor:', result)
        toast.error(errorMessage, {
          description: result.details ? JSON.stringify(result.details) : undefined,
          duration: 5000,
        })
        setIsImporting(false)
        return
      }

      // Verificar que el resultado tenga la estructura esperada
      if (!result || typeof result !== 'object') {
        toast.error('Respuesta inválida del servidor')
        setIsImporting(false)
        return
      }

      // Adaptar la respuesta al formato esperado por el preview
      const adaptedPreview = {
        valid: result.validRows || result.valid || 0,
        validRows: result.validRows || result.valid || 0,
        errors: result.errorRows || result.errors || 0,
        errorRows: result.errorRows || result.errors || 0,
        total: result.totalRows || result.total || 0,
        totalRows: result.totalRows || result.total || 0,
        listings: (result.previewListings || result.listings || []).map((l: any) => ({
          ...l,
          // Asegurar que categoryId y zoneId estén presentes
          categoryId: l.categoryId || l.category_id || (l.category ? categories.find(c => c.name === l.category)?.id : null),
          zoneId: l.zoneId || l.zone_id || (l.zone ? zones.find(z => z.name === l.zone)?.id : null),
          // Asegurar que description esté presente
          description: l.description || '',
          imageUrl: l.imageUrl || l.image_url || (l.images && l.images.length > 0 ? l.images[0] : null), // null si no hay imágenes (OK)
          images: l.images || (l.imageUrl ? [l.imageUrl] : []) || (l.image_url ? [l.image_url] : []), // Puede estar vacío
        })),
        previewListings: (result.previewListings || result.listings || []).map((l: any) => ({
          ...l,
          // Asegurar que categoryId y zoneId estén presentes
          categoryId: l.categoryId || l.category_id || (l.category ? categories.find(c => c.name === l.category)?.id : null),
          zoneId: l.zoneId || l.zone_id || (l.zone ? zones.find(z => z.name === l.zone)?.id : null),
          // Asegurar que description esté presente
          description: l.description || '',
          imageUrl: l.imageUrl || l.image_url || (l.images && l.images.length > 0 ? l.images[0] : null), // null si no hay imágenes (OK)
          images: l.images || (l.imageUrl ? [l.imageUrl] : []) || (l.image_url ? [l.image_url] : []), // Puede estar vacío
        })),
        errorsDetails: result.errorsDetails || [],
      }

      console.log('Preview data recibida:', adaptedPreview)
      if (adaptedPreview.listings.length > 0) {
        console.log('Primer listing:', adaptedPreview.listings[0])
        console.log('ImageUrl del primer listing:', adaptedPreview.listings[0].imageUrl)
      }
      
      if (adaptedPreview.valid === 0 && adaptedPreview.errors > 0) {
        toast.warning('No se encontraron productos válidos. Revisa los errores abajo.')
      }

      setPreviewData(adaptedPreview)
      setShowPreview(true)
      setIsImporting(false)
    } catch (error) {
      console.error('Error al procesar:', error)
      toast.error('Error al procesar el archivo Excel', {
        description: error instanceof Error ? error.message : 'Error desconocido',
        duration: 5000,
      })
      setIsImporting(false)
    }
  }

  // Mejorar imagen con IA
  const enhanceImage = async (listingIndex: number, imageIndex: number, imageUrl: string) => {
    const key = `${listingIndex}_${imageIndex}`
    
    if (enhancingImages.get(key)) return // Ya está procesando
    
    setEnhancingImages(prev => new Map(prev).set(key, true))
    
    try {
      let base64Image = imageUrl
      
      // Si la imagen ya es base64, usarla directamente
      // Si es una URL, convertirla a base64
      if (!imageUrl.startsWith('data:image') && !imageUrl.startsWith('/')) {
        // Es una URL externa, convertir a base64
        try {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          
          reader.onloadend = async () => {
            const base64 = reader.result as string
            await processEnhancement(listingIndex, imageIndex, base64)
          }
          
          reader.readAsDataURL(blob)
          return
        } catch (error) {
          console.error('Error al cargar imagen:', error)
          toast.error('Error al cargar la imagen para mejorar')
          setEnhancingImages(prev => {
            const newMap = new Map(prev)
            newMap.delete(key)
            return newMap
          })
          return
        }
      } else if (imageUrl.startsWith('/')) {
        // Es una ruta local, convertir a base64
        try {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          
          reader.onloadend = async () => {
            const base64 = reader.result as string
            await processEnhancement(listingIndex, imageIndex, base64)
          }
          
          reader.readAsDataURL(blob)
          return
        } catch (error) {
          console.error('Error al cargar imagen local:', error)
          toast.error('Error al cargar la imagen para mejorar')
          setEnhancingImages(prev => {
            const newMap = new Map(prev)
            newMap.delete(key)
            return newMap
          })
          return
        }
      } else {
        // Ya es base64
        await processEnhancement(listingIndex, imageIndex, base64Image)
      }
    } catch (error) {
      console.error('Error al mejorar imagen:', error)
      toast.error('Error al mejorar la imagen')
      setEnhancingImages(prev => {
        const newMap = new Map(prev)
        newMap.delete(key)
        return newMap
      })
    }
  }

  // Función auxiliar para procesar la mejora
  const processEnhancement = async (listingIndex: number, imageIndex: number, base64: string) => {
    const key = `${listingIndex}_${imageIndex}`
    
    try {
      const enhanceResponse = await fetch('/api/images/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          mode: 'remove-object',
        }),
      })

      const result = await enhanceResponse.json()

      if (!enhanceResponse.ok) {
        if (result.note) {
          toast.error(result.error, {
            description: result.note,
            duration: 5000,
          })
        } else {
          toast.error(result.error || 'Error al mejorar la imagen')
        }
        setEnhancingImages(prev => {
          const newMap = new Map(prev)
          newMap.delete(key)
          return newMap
        })
        return
      }

      // Guardar imagen mejorada
      setEnhancedImages(prev => new Map(prev).set(key, result.image))
      
      // Actualizar también en previewData para que se use al importar
      if (previewData && previewData.listings) {
        const updatedListings = [...previewData.listings]
        if (updatedListings[listingIndex]) {
          const updatedImages = [...(updatedListings[listingIndex].images || [])]
          updatedImages[imageIndex] = result.image
          updatedListings[listingIndex] = {
            ...updatedListings[listingIndex],
            images: updatedImages,
            imageUrl: updatedImages[0] || updatedListings[listingIndex].imageUrl,
          }
          setPreviewData({
            ...previewData,
            listings: updatedListings,
            previewListings: updatedListings,
          })
        }
      }
      
      toast.success('Imagen mejorada exitosamente')
    } catch (error) {
      console.error('Error al mejorar imagen:', error)
      toast.error('Error al mejorar la imagen')
    } finally {
      setEnhancingImages(prev => {
        const newMap = new Map(prev)
        newMap.delete(key)
        return newMap
      })
    }
  }

  // Función para actualizar un listing en el preview
  const updatePreviewListing = (index: number, updates: Partial<any>) => {
    if (!previewData || !previewData.listings) return
    
    const updatedListings = [...previewData.listings]
    updatedListings[index] = {
      ...updatedListings[index],
      ...updates,
    }
    
    setPreviewData({
      ...previewData,
      listings: updatedListings,
      previewListings: updatedListings,
    })
  }

  // Función para actualizar imágenes de un listing
  const updateListingImages = (index: number, images: string[]) => {
    updatePreviewListing(index, {
      images,
      imageUrl: images[0] || null,
    })
  }

  // Función para eliminar una imagen
  const removeImage = (listingIndex: number, imageIndex: number) => {
    if (!previewData || !previewData.listings) return
    
    const listing = previewData.listings[listingIndex]
    const currentImages = listing.images || []
    const updatedImages = currentImages.filter((_: any, i: number) => i !== imageIndex)
    
    // También limpiar la imagen mejorada si existe
    const key = `${listingIndex}_${imageIndex}`
    setEnhancedImages(prev => {
      const newMap = new Map(prev)
      // Limpiar todas las claves relacionadas con este índice
      for (let i = imageIndex; i < currentImages.length; i++) {
        const oldKey = `${listingIndex}_${i}`
        const newKey = `${listingIndex}_${i - 1}`
        if (newMap.has(oldKey)) {
          newMap.set(newKey, newMap.get(oldKey)!)
          newMap.delete(oldKey)
        }
      }
      return newMap
    })
    
    updateListingImages(listingIndex, updatedImages)
  }

  // Función para agregar una imagen (desde URL o base64)
  const addImage = (listingIndex: number, imageUrl: string) => {
    if (!previewData || !previewData.listings) return
    
    const listing = previewData.listings[listingIndex]
    const currentImages = listing.images || []
    updateListingImages(listingIndex, [...currentImages, imageUrl])
  }

  // Función para manejar la subida de archivos desde la computadora
  const handleImageUpload = async (listingIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    
    if (!previewData || !previewData.listings) return
    
    const listing = previewData.listings[listingIndex]
    const currentImages = listing.images || []
    const newImages: string[] = []
    
    // Procesar cada archivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error(`El archivo "${file.name}" no es una imagen`)
        continue
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`La imagen "${file.name}" es muy grande (máximo 5MB)`)
        continue
      }
      
      // Convertir a base64
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        newImages.push(base64)
      } catch (error) {
        console.error('Error al convertir imagen a base64:', error)
        toast.error(`Error al procesar "${file.name}"`)
      }
    }
    
    if (newImages.length > 0) {
      updateListingImages(listingIndex, [...currentImages, ...newImages])
      toast.success(`${newImages.length} imagen${newImages.length > 1 ? 'es' : ''} agregada${newImages.length > 1 ? 's' : ''}`)
    }
    
    // Limpiar el input
    const input = imageFileInputRefs.current.get(listingIndex)
    if (input) {
      input.value = ''
    }
  }

  // Confirmar e importar
  const handleConfirmImport = async () => {
    if (!previewData || !previewData.listings || previewData.listings.length === 0) {
      toast.error('No hay productos para importar')
      return
    }

    setIsImporting(true)

    try {
      // Preparar los listings editados para enviar
      console.log('📦 Preparando listings para importar:', previewData.listings.length)
      
      // Mapear, validar y corregir listings antes de enviar
      const validatedListings = previewData.listings.map((listing: any, index: number) => {
        console.log(`   Listing ${index + 1}:`, {
          title: listing.title,
          categoryId: listing.categoryId,
          zoneId: listing.zoneId,
          price: listing.price,
          imagesCount: listing.images?.length || 0,
        })
        
        // Obtener todas las imágenes (incluyendo las mejoradas)
        const allImages = listing.images || []
        const finalImages = allImages.map((img: string, imgIndex: number) => {
          const key = `${index}_${imgIndex}`
          return enhancedImages.get(key) || img
        })
        // Verificar y corregir campos faltantes
        const title = listing.title && listing.title.trim().length > 0 
          ? listing.title.trim() 
          : `Producto ${index + 1}`
        
        const description = listing.description && listing.description.trim().length > 0
          ? listing.description.trim()
          : title

        // Asegurar que categoryId y zoneId sean válidos
        let categoryId = listing.categoryId
        let zoneId = listing.zoneId

        // Si no hay categoryId, intentar obtenerlo del nombre de categoría
        if (!categoryId || categoryId === 'all' || isNaN(parseInt(String(categoryId)))) {
          if (listing.category) {
            const category = categories.find(c => 
              c.name === listing.category || 
              c.name.toLowerCase() === String(listing.category).toLowerCase()
            )
            categoryId = category?.id || categories[0]?.id || '1'
          } else {
            categoryId = categories[0]?.id || '1'
          }
        }

        // Si no hay zoneId, intentar obtenerlo del nombre de zona
        if (!zoneId || zoneId === 'all' || isNaN(parseInt(String(zoneId)))) {
          if (listing.zone) {
            const zone = zones.find(z => 
              z.name === listing.zone || 
              z.name.toLowerCase() === String(listing.zone).toLowerCase()
            )
            zoneId = zone?.id || zones[0]?.id || '1'
          } else {
            zoneId = zones[0]?.id || '1'
          }
        }

        // Validar que sean números válidos
        const categoryIdNum = parseInt(String(categoryId))
        const zoneIdNum = parseInt(String(zoneId))

        if (isNaN(categoryIdNum) || isNaN(zoneIdNum)) {
          console.error(`❌ Listing ${index + 1} tiene IDs inválidos, usando valores por defecto:`, {
            title,
            categoryId,
            zoneId,
            categoryIdNum,
            zoneIdNum,
          })
          // Usar valores por defecto
          categoryId = String(categories[0]?.id || '1')
          zoneId = String(zones[0]?.id || '1')
        } else {
          categoryId = String(categoryIdNum)
          zoneId = String(zoneIdNum)
        }

        // Retornar el listing completo y validado
        return {
          title,
          categoryId,
          zoneId,
          description,
          price: listing.price ? parseFloat(String(listing.price).replace(/[^\d.-]/g, '')) : 0,
          currency: listing.currency || 'ARS',
          condition: listing.condition || null,
          whatsapp: listing.whatsapp || defaultContact.whatsapp || undefined,
          phone: listing.phone || defaultContact.phone || undefined,
          email: listing.email || defaultContact.email || undefined,
          instagram: listing.instagram || defaultContact.instagram || undefined,
          images: finalImages,
          imageUrl: finalImages[0] || null,
        }
      })

      // Filtrar listings que aún no tienen los campos mínimos
      const invalidListings = validatedListings.filter((listing: any, index: number) => {
        const hasTitle = listing.title && listing.title.trim().length > 0
        const hasCategoryId = listing.categoryId && !isNaN(parseInt(String(listing.categoryId)))
        const hasZoneId = listing.zoneId && !isNaN(parseInt(String(listing.zoneId)))
        const hasDescription = listing.description && listing.description.trim().length > 0
        
        if (!hasTitle || !hasCategoryId || !hasZoneId || !hasDescription) {
          console.error(`❌ Listing ${index + 1} aún inválido después de corrección:`, {
            title: listing.title,
            categoryId: listing.categoryId,
            zoneId: listing.zoneId,
            description: listing.description?.substring(0, 50),
          })
          return true
        }
        return false
      })

      if (invalidListings.length > 0) {
        toast.error(`${invalidListings.length} productos tienen datos incompletos y no se pueden importar.`)
        setIsImporting(false)
        return
      }

      // Usar los listings validados
      const finalListingsToImport = validatedListings

      // Enviar los listings editados directamente al endpoint de bulk
      console.log('📤 Enviando', finalListingsToImport.length, 'listings al servidor...')
      console.log('📋 Primer listing completo:', JSON.stringify(finalListingsToImport[0], null, 2))
      console.log('📋 Todos los listings:', finalListingsToImport.map((l: any, i: number) => ({
        index: i + 1,
        title: l.title,
        categoryId: l.categoryId,
        zoneId: l.zoneId,
        price: l.price,
        currency: l.currency,
        description: l.description?.substring(0, 30),
        imagesCount: l.images?.length || 0,
      })))

      const requestBody = {
        listings: finalListingsToImport,
      }

      console.log('📦 Body completo a enviar:', JSON.stringify(requestBody, null, 2).substring(0, 2000))

      const response = await fetch('/api/publish/listing/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      let result: any = {}
      let text = ''
      
      // Verificar el status antes de intentar leer
      console.log('📊 Status de la respuesta:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })
      
      try {
        // Intentar leer como texto primero
        const clone = response.clone()
        text = await clone.text()
        
        console.log('📥 Respuesta del servidor (texto):', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          textLength: text.length,
          textIsEmpty: !text || text.trim().length === 0,
          textPreview: text.substring(0, 1000),
          isOk: response.ok,
        })
        
        if (text && text.trim()) {
          try {
            result = JSON.parse(text)
            console.log('✅ JSON parseado correctamente:', {
              keys: Object.keys(result),
              hasError: !!result.error,
              hasDetails: !!result.details,
              hasErrors: !!result.errors,
            })
          } catch (parseError) {
            console.error('❌ Error parseando JSON:', parseError)
            console.error('📄 Texto completo recibido:', text)
            result = { 
              error: `Error al parsear la respuesta del servidor`,
              rawResponse: text.substring(0, 2000),
              parseError: parseError instanceof Error ? parseError.message : String(parseError),
              status: response.status,
              statusText: response.statusText,
            }
          }
        } else {
          console.warn('⚠️ Respuesta vacía del servidor')
          result = { 
            error: `Respuesta vacía del servidor`,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
          }
        }
      } catch (error) {
        console.error('❌ Error obteniendo respuesta:', error)
        console.error('Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        result = { 
          error: `Error al procesar la respuesta del servidor`,
          fetchError: error instanceof Error ? error.message : String(error),
          status: response.status,
          statusText: response.statusText,
        }
      }

      if (!response.ok) {
        console.error('❌ Error en la respuesta:', {
          status: response.status,
          statusText: response.statusText,
          result,
          resultKeys: Object.keys(result),
          listingsCount: listingsToImport.length,
          firstListing: listingsToImport[0] ? {
            title: listingsToImport[0].title,
            categoryId: listingsToImport[0].categoryId,
            zoneId: listingsToImport[0].zoneId,
            hasImages: !!listingsToImport[0].images?.length,
            price: listingsToImport[0].price,
            currency: listingsToImport[0].currency,
          } : null
        })
        
        // Si result está vacío, intentar obtener más información
        if (Object.keys(result).length === 0) {
          console.error('⚠️ Result está vacío, intentando obtener más información...')
          // Intentar leer la respuesta nuevamente
          try {
            const responseText = await response.text()
            console.error('📄 Texto de respuesta (segundo intento):', responseText)
            if (responseText && responseText.trim()) {
              try {
                result = JSON.parse(responseText)
                console.log('✅ JSON parseado en segundo intento:', Object.keys(result))
              } catch (e) {
                result = { 
                  error: `Error al parsear respuesta: ${responseText.substring(0, 200)}`,
                  rawResponse: responseText
                }
              }
            }
          } catch (e) {
            console.error('❌ No se pudo leer la respuesta:', e)
          }
        }
        
        let errorMessage = result.error || result.message || `Error al importar los productos (${response.status}: ${response.statusText})`
        
        // Si aún no hay mensaje de error, usar información del status
        if (!result.error && !result.message && Object.keys(result).length === 0) {
          errorMessage = `Error ${response.status}: ${response.statusText || 'Error desconocido'}. La respuesta del servidor está vacía.`
        }
        
        // Mostrar detalles de validación si existen
        if (result.details && Array.isArray(result.details)) {
          const details = result.details.map((d: any) => {
            if (d.path) {
              return `${d.path.join('.')}: ${d.message}`
            }
            return d.message || JSON.stringify(d)
          }).join(', ')
          errorMessage = `${errorMessage}. Detalles: ${details}`
        } else if (result.errors && Array.isArray(result.errors)) {
          // Si hay errores de Zod, mostrarlos
          const errors = result.errors.map((e: any) => {
            if (e.path) {
              return `${e.path.join('.')}: ${e.message}`
            }
            return e.message || JSON.stringify(e)
          }).join(', ')
          errorMessage = `${errorMessage}. Errores: ${errors}`
        }
        
        toast.error(errorMessage)
        setIsImporting(false)
        return
      }

      if (result.errors && result.errors.length > 0) {
        toast.warning(
          `Importación parcial: ${result.success || result.created || 0} exitosos, ${result.errors.length} con errores`
        )
      } else {
        toast.success(`¡${result.success || result.created || listingsToImport.length} productos importados exitosamente!`)
      }

      // Redirigir al mercado después de 2 segundos
      setTimeout(() => {
        router.push('/mercado')
      }, 2000)
    } catch (error) {
      console.error('Error al importar:', error)
      toast.error('Error al importar los productos')
      setIsImporting(false)
    }
  }

  // Descargar plantilla de Excel
  const downloadTemplate = () => {
    // Crear un CSV simple como plantilla con el nuevo formato
    const headers = [
      'titulo',
      'categoria',
      'zona',
      'descripcion',
      'precio',
      'moneda',
      'condicion',
      'whatsapp',
      'telefono',
      'email',
      'instagram',
      'foto_principal',
      'foto_2',
      'foto_3',
      'foto_4',
    ]
    
    const exampleRow = [
      'iPhone 13 Pro Max 256GB',
      'Tecnología',
      'Centro',
      'iPhone en excelente estado, con caja original',
      '450000',
      'ARS',
      'Usado',
      'https://wa.me/5493425123456',
      '3425-123456',
      'ventas@ejemplo.com',
      '@usuario',
      'IMG_2561.JPG',
      'WhatsApp Image 2025-12-20 at 17.56.37 (1).jpeg',
      '',
      '',
    ]

    const csvContent = [
      headers.join(','),
      exampleRow.join(','),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla-productos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los productos
    const allErrors: { index: number; errors: string[] }[] = []
    products.forEach((product, index) => {
      const errors = validateProduct(product)
      if (errors.length > 0) {
        allErrors.push({ index, errors })
      }
    })

    if (allErrors.length > 0) {
      const errorMessages = allErrors
        .map(({ index, errors }) => `Producto ${index + 1}: ${errors.join(', ')}`)
        .join('\n')
      toast.error(`Por favor corrige los siguientes errores:\n${errorMessages}`)
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar los datos para enviar
      const listingsData = products.map((product) => ({
        title: product.title.trim(),
        categoryId: product.categoryId,
        zoneId: product.zoneId,
        price: product.price && product.price.trim() !== '' ? product.price : undefined,
        currency: product.currency || 'ARS',
        condition: product.condition && product.condition !== '' && product.condition !== 'none' 
          ? product.condition 
          : undefined,
        description: product.description.trim(),
        images: product.images && product.images.length > 0 ? product.images : undefined,
        whatsapp: product.whatsapp && product.whatsapp.trim() !== '' 
          ? product.whatsapp 
          : (defaultContact.whatsapp && defaultContact.whatsapp.trim() !== '' ? defaultContact.whatsapp : undefined),
        phone: product.phone && product.phone.trim() !== '' 
          ? product.phone 
          : (defaultContact.phone && defaultContact.phone.trim() !== '' ? defaultContact.phone : undefined),
        email: product.email && product.email.trim() !== '' 
          ? product.email 
          : (defaultContact.email && defaultContact.email.trim() !== '' ? defaultContact.email : undefined),
        instagram: product.instagram && product.instagram.trim() !== '' 
          ? product.instagram 
          : (defaultContact.instagram && defaultContact.instagram.trim() !== '' ? defaultContact.instagram : undefined),
      }))

      const response = await fetch('/api/publish/listing/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listings: listingsData,
          defaultWhatsapp: defaultContact.whatsapp || undefined,
          defaultPhone: defaultContact.phone || undefined,
          defaultEmail: defaultContact.email || undefined,
          defaultInstagram: defaultContact.instagram || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al publicar los productos')
        setIsSubmitting(false)
        return
      }

      if (result.errors > 0) {
        toast.warning(
          `Publicación parcial: ${result.success} exitosos, ${result.errors} con errores`
        )
        if (result.errorsDetails && result.errorsDetails.length > 0) {
          console.error('Errores:', result.errorsDetails)
        }
      } else {
        toast.success(`¡${result.success} productos publicados exitosamente!`)
      }

      // Redirigir al mercado después de 2 segundos
      setTimeout(() => {
        router.push('/mercado')
      }, 2000)
    } catch (error) {
      console.error('Error al publicar:', error)
      toast.error('Error al publicar los productos')
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras se verifica autenticación
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-5xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </div>
        </main>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-5xl">
        {/* Header de la página */}
        <div className="mb-6">
          <Link href="/publicar" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a publicación individual
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Carga Masiva de Productos
          </h1>
          <p className="text-muted-foreground">
            Publicá múltiples productos a la vez con sus fotos
          </p>
        </div>

        {/* Selector de método: Manual o Excel */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant={!showExcelImport ? "default" : "outline"}
              onClick={() => setShowExcelImport(false)}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carga Manual
            </Button>
            <Button
              type="button"
              variant={showExcelImport ? "default" : "outline"}
              onClick={() => setShowExcelImport(true)}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Importar desde Excel
            </Button>
          </div>
        </Card>

        {/* Importación desde Excel */}
        {showExcelImport && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Importar desde Excel</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Sube un archivo Excel (.xlsx, .xls) o CSV con tus productos. 
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="text-primary hover:underline ml-1"
                  >
                    Descargar plantilla
                  </button>
                </p>
              </div>

              <form onSubmit={handleExcelPreview} className="space-y-4">
                {/* Campos de contacto compartidos para Excel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="excel-default-whatsapp">WhatsApp (opcional)</Label>
                    <PhoneInput
                      id="excel-default-whatsapp"
                      placeholder="3425-123456"
                      value={defaultContact.whatsapp}
                      onChange={(e) => setDefaultContact({ ...defaultContact, whatsapp: e.target.value })}
                      disabled={isImporting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excel-default-phone">Teléfono (opcional)</Label>
                    <PhoneInput
                      id="excel-default-phone"
                      placeholder="3425-123456"
                      value={defaultContact.phone}
                      onChange={(e) => setDefaultContact({ ...defaultContact, phone: e.target.value })}
                      disabled={isImporting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excel-default-email">Email (opcional)</Label>
                    <Input
                      id="excel-default-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={defaultContact.email}
                      onChange={(e) => setDefaultContact({ ...defaultContact, email: e.target.value })}
                      disabled={isImporting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excel-default-instagram">Instagram (opcional)</Label>
                    <Input
                      id="excel-default-instagram"
                      type="text"
                      placeholder="@tuusuario"
                      value={defaultContact.instagram}
                      onChange={(e) => setDefaultContact({ ...defaultContact, instagram: e.target.value })}
                      disabled={isImporting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excel-file">
                    Archivo Excel o CSV <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="excel-file"
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      required
                      disabled={isImporting}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setSelectedFile(file)
                        if (file) {
                          console.log('Archivo seleccionado:', file.name, file.type, file.size)
                          toast.success(`Archivo seleccionado: ${file.name}`)
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        fileInputRef.current?.click()
                      }}
                      disabled={isImporting}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                    </Button>
                  </div>
                  {selectedFile && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        ✓ Archivo seleccionado: {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos aceptados: .xlsx, .xls, .csv (máximo 50 productos)
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isImporting}
                    className="flex-1"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Ver Preview
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTemplate}
                    disabled={isImporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Plantilla
                  </Button>
                </div>
              </form>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Columnas requeridas en el Excel:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li><strong>Obligatorias:</strong> titulo, categoria, zona, descripcion, foto_principal</li>
                  <li><strong>Opcionales:</strong> precio, moneda (ARS/USD), condicion (Nuevo/Usado), whatsapp (URL completa), telefono, email, instagram, foto_2, foto_3, foto_4</li>
                  <li className="mt-2 text-amber-600 dark:text-amber-400"><strong>Importante:</strong> Las imágenes deben estar en /public/uploads/ con sus nombres originales</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Preview de importación */}
        {showPreview && previewData && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Preview de Importación</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewData(null)
                  }}
                >
                  Cerrar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {previewData.valid || previewData.validRows || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Válidos</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {previewData.errors || previewData.errorRows || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Con errores</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {previewData.total || previewData.totalRows || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>

              {/* Lista de productos válidos */}
              {previewData.listings && previewData.listings.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Productos a importar ({previewData.listings.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                    {previewData.listings.map((listing: any, listingIndex: number) => {
                      const allImages = listing.images || (listing.imageUrl ? [listing.imageUrl] : []) || (listing.image_url ? [listing.image_url] : [])
                      const isEditing = editingListing === listingIndex
                      
                      return (
                        <Card key={listingIndex} className="p-4">
                          <div className="space-y-3">
                            {/* Header con botón de editar */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={listing.title || ''}
                                      onChange={(e) => updatePreviewListing(listingIndex, { title: e.target.value })}
                                      placeholder="Título del producto"
                                      className="text-sm font-semibold"
                                    />
                                    <div className="flex gap-2">
                                      <Select
                                        value={listing.categoryId || ''}
                                        onValueChange={(value) => {
                                          const category = categories.find(c => c.id === value)
                                          updatePreviewListing(listingIndex, { 
                                            categoryId: value,
                                            category: category?.name || listing.category
                                          })
                                        }}
                                      >
                                        <SelectTrigger className="text-xs h-8">
                                          <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                              {cat.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={listing.zoneId || ''}
                                        onValueChange={(value) => {
                                          const zone = zones.find(z => z.id === value)
                                          updatePreviewListing(listingIndex, { 
                                            zoneId: value,
                                            zone: zone?.name || listing.zone
                                          })
                                        }}
                                      >
                                        <SelectTrigger className="text-xs h-8">
                                          <SelectValue placeholder="Zona" />
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
                                    <PriceInputWithCurrency
                                      value={listing.price ? String(listing.price) : ''}
                                      currency={listing.currency || 'ARS'}
                                      onChange={(price, currency) => updatePreviewListing(listingIndex, { price, currency })}
                                    />
                                    <Textarea
                                      value={listing.description || ''}
                                      onChange={(e) => updatePreviewListing(listingIndex, { description: e.target.value })}
                                      placeholder="Descripción"
                                      className="text-xs min-h-[60px]"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="font-semibold text-sm truncate">{listing.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {listing.price > 0 ? `$${listing.price} ${listing.currency}` : 'Consultar precio'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {listing.category} • {listing.zone}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingListing(isEditing ? null : listingIndex)}
                                className="ml-2"
                              >
                                {isEditing ? (
                                  <>
                                    <Save className="h-4 w-4 mr-1" />
                                    Guardar
                                  </>
                                ) : (
                                  <>
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Editar
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Galería de imágenes */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {allImages.length} {allImages.length === 1 ? 'foto' : 'fotos'}
                                </span>
                                {!isEditing && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingListing(listingIndex)}
                                    className="h-6 text-xs"
                                  >
                                    <Edit2 className="h-3 w-3 mr-1" />
                                    Editar fotos
                                  </Button>
                                )}
                              </div>
                              {allImages.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {allImages.map((imgUrl: string, imageIndex: number) => {
                                    const key = `${listingIndex}_${imageIndex}`
                                    const isEnhancing = enhancingImages.get(key) || false
                                    const enhancedUrl = enhancedImages.get(key)
                                    const displayUrl = enhancedUrl || imgUrl
                                    
                                    return (
                                      <div key={imageIndex} className="relative group">
                                        <img
                                          src={displayUrl}
                                          alt={`${listing.title} - Foto ${imageIndex + 1}`}
                                          className="w-full h-20 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder.jpg'
                                          }}
                                          onClick={() => setSelectedImagePreview({ listingIndex, imageIndex, url: displayUrl })}
                                        />
                                        {/* Botones de acción - siempre visibles al hover */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                          {!enhancedUrl && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                enhanceImage(listingIndex, imageIndex, imgUrl)
                                              }}
                                              disabled={isEnhancing}
                                              className="p-1.5 bg-primary hover:bg-primary/80 text-white rounded disabled:opacity-50"
                                              title="Mejorar con IA"
                                            >
                                              {isEnhancing ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                <Sparkles className="h-3 w-3" />
                                              )}
                                            </button>
                                          )}
                                          {enhancedUrl && (
                                            <div className="p-1.5 bg-green-500 text-white rounded text-xs" title="Imagen mejorada con IA">
                                              ✨
                                            </div>
                                          )}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              if (isEditing) {
                                                removeImage(listingIndex, imageIndex)
                                              } else {
                                                setEditingListing(listingIndex)
                                              }
                                            }}
                                            className="p-1.5 bg-destructive hover:bg-destructive/80 text-white rounded"
                                            title={isEditing ? "Eliminar foto" : "Editar fotos"}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">Sin fotos</span>
                                </div>
                              )}
                              
                              {/* Botón para agregar foto cuando está editando */}
                              {isEditing && (
                                <div className="space-y-2">
                                  {/* Subir desde computadora */}
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      ref={(el) => {
                                        if (el) {
                                          imageFileInputRefs.current.set(listingIndex, el)
                                        } else {
                                          imageFileInputRefs.current.delete(listingIndex)
                                        }
                                      }}
                                      onChange={(e) => handleImageUpload(listingIndex, e.target.files)}
                                      className="hidden"
                                      id={`image-upload-${listingIndex}`}
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const input = imageFileInputRefs.current.get(listingIndex)
                                        input?.click()
                                      }}
                                      className="w-full h-8 text-xs"
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Subir fotos desde computadora
                                    </Button>
                                  </div>
                                  
                                  {/* O agregar por URL/base64 */}
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      placeholder="O pegar URL de imagen"
                                      className="text-xs h-8"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const input = e.target as HTMLInputElement
                                          if (input.value.trim()) {
                                            addImage(listingIndex, input.value.trim())
                                            input.value = ''
                                          }
                                        }
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                        if (input?.value.trim()) {
                                          addImage(listingIndex, input.value.trim())
                                          input.value = ''
                                        }
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Agregar URL
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Warnings */}
                            {listing.warnings && listing.warnings.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {listing.warnings.map((warning: string, i: number) => (
                                  <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                                    ⚠️ {warning}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Modal de preview de imagen */}
              {selectedImagePreview && (
                <div 
                  className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                  onClick={() => setSelectedImagePreview(null)}
                >
                  <div className="relative max-w-4xl max-h-[90vh]">
                    <button
                      type="button"
                      onClick={() => setSelectedImagePreview(null)}
                      className="absolute top-4 right-4 p-2 bg-background rounded-full hover:bg-muted z-10"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <img
                      src={selectedImagePreview.url}
                      alt="Preview"
                      className="max-w-full max-h-[90vh] object-contain rounded"
                    />
                  </div>
                </div>
              )}

              {/* Errores */}
              {previewData.errorsDetails && previewData.errorsDetails.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-destructive">Errores encontrados</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {previewData.errorsDetails.map((error: any, index: number) => (
                      <div key={index} className="p-3 bg-red-50 dark:bg-red-950 rounded text-sm">
                        <p className="font-semibold">Fila {error.row}:</p>
                        <ul className="list-disc list-inside mt-1">
                          {error.errors.map((err: string, i: number) => (
                            <li key={i} className="text-red-600 dark:text-red-400">{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting || (previewData.valid || previewData.validRows || 0) === 0}
                  className="flex-1"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Confirmar e Importar {previewData.valid || previewData.validRows || 0} productos
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewData(null)
                  }}
                  disabled={isImporting}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Formulario manual */}
        {!showExcelImport && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Campos de contacto compartidos */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Contacto (aplicará a todos los productos)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Estos datos se usarán para todos los productos que no tengan contacto individual
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-whatsapp">WhatsApp</Label>
                <PhoneInput
                  id="default-whatsapp"
                  placeholder="3425-123456"
                  value={defaultContact.whatsapp}
                  onChange={(e) => setDefaultContact({ ...defaultContact, whatsapp: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-phone">Teléfono</Label>
                <PhoneInput
                  id="default-phone"
                  placeholder="3425-123456"
                  value={defaultContact.phone}
                  onChange={(e) => setDefaultContact({ ...defaultContact, phone: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-email">Email</Label>
                <Input
                  id="default-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={defaultContact.email}
                  onChange={(e) => setDefaultContact({ ...defaultContact, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-instagram">Instagram</Label>
                <Input
                  id="default-instagram"
                  type="text"
                  placeholder="@tuusuario"
                  value={defaultContact.instagram}
                  onChange={(e) => setDefaultContact({ ...defaultContact, instagram: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Card>

          {/* Lista de productos */}
          <div className="space-y-6">
            {products.map((product, index) => (
              <Card key={product.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Producto {index + 1}</h3>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label>
                      Título <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Ej: iPhone 13 Pro Max 256GB"
                      value={product.title}
                      onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Categoría y Zona */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Categoría <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={product.categoryId}
                        onValueChange={(value) => updateProduct(product.id, 'categoryId', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Zona <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={product.zoneId}
                        onValueChange={(value) => updateProduct(product.id, 'zoneId', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una zona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Selecciona zona</SelectItem>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Precio y Condición */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <PriceInputWithCurrency
                        value={product.price}
                        currency={product.currency}
                        onPriceChange={(price) => updateProduct(product.id, 'price', price)}
                        onCurrencyChange={(currency) => updateProduct(product.id, 'currency', currency)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Condición</Label>
                      <Select
                        value={product.condition || undefined}
                        onValueChange={(value) => {
                          if (value === 'none') {
                            updateProduct(product.id, 'condition', '')
                          } else {
                            updateProduct(product.id, 'condition', value as Condition)
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona condición (opcional)" />
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

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label>
                      Descripción <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      placeholder="Describe tu producto..."
                      rows={4}
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Fotos */}
                  <div className="space-y-2">
                    <Label>Fotos (máximo 5)</Label>
                    <ImageUpload
                      maxImages={10}
                      value={product.images}
                      onChange={(images) => updateProduct(product.id, 'images', images)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Botón para agregar más productos */}
          <Button
            type="button"
            variant="outline"
            onClick={addProduct}
            disabled={isSubmitting || products.length >= 50}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar otro producto {products.length >= 50 && '(máximo 50)'}
          </Button>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publicando {products.length} productos...
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
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
        )}
      </main>
      <Footer />
    </div>
  )
}

