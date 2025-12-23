// Página para editar un producto ya publicado
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { ImageUpload } from '@/components/ui/image-upload'
import { PhoneInput } from '@/components/ui/phone-input'

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [listing, setListing] = useState<any>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [condition, setCondition] = useState<Condition | ''>('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [whatsapp, setWhatsapp] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        // Verificar autenticación
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          router.push('/registro')
          return
        }
        const authData = await authResponse.json()
        setIsAuthenticated(true)
        setCurrentUserId(authData.user.id)

        // Cargar listing
        const listingResponse = await fetch(`/api/listings/${id}`)
        if (!listingResponse.ok) {
          toast.error('Producto no encontrado')
          router.push('/mercado')
          return
        }
        const listingData = await listingResponse.json()

        // Verificar que el usuario es el dueño
        if (listingData.user_id !== authData.user.id) {
          toast.error('No tienes permiso para editar este producto')
          router.push(`/aviso/${id}`)
          return
        }

        setListing(listingData)
        
        // Parsear imágenes
        let parsedImages: string[] = []
        if (listingData.images) {
          try {
            parsedImages = typeof listingData.images === 'string' 
              ? JSON.parse(listingData.images) 
              : listingData.images
          } catch (e) {
            parsedImages = []
          }
        }
        if (parsedImages.length === 0 && listingData.image_url) {
          parsedImages = [listingData.image_url]
        }

        // Llenar formulario
        setTitle(listingData.title || '')
        setCategoryId(String(listingData.category_id || ''))
        setZoneId(String(listingData.zone_id || ''))
        setPrice(listingData.price ? String(listingData.price) : '')
        setCurrency(listingData.currency || 'ARS')
        setCondition(listingData.condition || '')
        setDescription(listingData.description || '')
        setImages(parsedImages)
        setWhatsapp(listingData.whatsapp || '')
        setPhone(listingData.phone || '')
        setEmail(listingData.email || '')
        setInstagram(listingData.instagram || '')
      } catch (error) {
        console.error('Error cargando datos:', error)
        toast.error('Error al cargar el producto')
        router.push('/mercado')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      checkAuthAndLoad()
    }
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          categoryId,
          zoneId,
          price,
          currency,
          condition: condition || null,
          description,
          images,
          whatsapp: whatsapp.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          instagram: instagram.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al actualizar el producto')
        setIsSubmitting(false)
        return
      }

      toast.success('¡Producto actualizado exitosamente!')
      router.push(`/aviso/${id}`)
    } catch (error) {
      console.error('Error al actualizar:', error)
      toast.error('Error al actualizar el producto')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar el producto')
        setIsDeleting(false)
        return
      }

      toast.success('Producto eliminado exitosamente')
      router.push('/mercado')
    } catch (error) {
      console.error('Error al eliminar:', error)
      toast.error('Error al eliminar el producto')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!listing) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl">
        <Link
          href={`/aviso/${id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al producto
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Editar Producto</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
                placeholder="Ej: iPhone 13 Pro Max 256GB"
              />
            </div>

            {/* Categoría y Zona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zone">Zona *</Label>
                <Select value={zoneId} onValueChange={setZoneId} required>
                  <SelectTrigger id="zone">
                    <SelectValue placeholder="Seleccionar zona" />
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

            {/* Precio y Moneda */}
            <div>
              <Label>Precio</Label>
              <PriceInputWithCurrency
                value={price}
                currency={currency}
                onChange={(p, c) => {
                  setPrice(p)
                  setCurrency(c)
                }}
                disabled={isSubmitting}
              />
            </div>

            {/* Condición */}
            <div>
              <Label htmlFor="condition">Condición</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as Condition | '')}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Seleccionar condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                  <SelectItem value="reacondicionado">Reacondicionado</SelectItem>
                  <SelectItem value="none">Sin especificar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={5}
                placeholder="Describe tu producto..."
              />
            </div>

            {/* Imágenes */}
            <div>
              <Label>Imágenes</Label>
              <ImageUpload
                value={images}
                onChange={setImages}
                maxImages={10}
                disabled={isSubmitting}
              />
            </div>

            {/* Contacto */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Información de Contacto</h3>

              <div>
                <Label htmlFor="whatsapp">WhatsApp (URL completa)</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="https://wa.me/5493425123456"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@ejemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                  placeholder="@usuario"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}


