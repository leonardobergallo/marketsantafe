// Página para publicar propiedades inmobiliarias
// URL: /inmobiliaria-en-equipo/publicar

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { zones } from '@/lib/zones'
import { toast } from 'sonner'
import { ArrowLeft, Building2, Loader2, Home, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { phoneSchema, whatsappSchema, priceSchema, optionalEmailSchema, instagramSchema } from '@/lib/validations'
import { PhoneInput } from '@/components/ui/phone-input'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { ImageUpload } from '@/components/ui/image-upload'

// Schema de validación para propiedades inmobiliarias
const inmobiliariaSchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede tener más de 200 caracteres')
    .trim(),
  propertyType: z.enum(['alquiler', 'venta', 'terreno'], {
    required_error: 'Selecciona el tipo de propiedad',
  }),
  zoneId: z.string()
    .min(1, 'Selecciona una zona')
    .refine((val) => val !== 'all', {
      message: 'Debes seleccionar una zona',
    }),
  price: priceSchema,
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede tener más de 2000 caracteres')
    .trim(),
  whatsapp: whatsappSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  instagram: instagramSchema,
  images: z.array(z.string())
    .max(10, 'Máximo 10 imágenes permitidas')
    .optional()
    .default([]),
})

type InmobiliariaFormData = z.infer<typeof inmobiliariaSchema>

export default function PublicarInmobiliariaPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/login?redirect=/inmobiliaria-en-equipo/publicar')
        }
      } catch (error) {
        router.push('/login?redirect=/inmobiliaria-en-equipo/publicar')
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InmobiliariaFormData>({
    resolver: zodResolver(inmobiliariaSchema),
    defaultValues: {
      propertyType: 'venta',
      currency: 'ARS',
      images: [],
    },
  })

  const propertyType = watch('propertyType')
  const images = watch('images')

  // Mapear tipo de propiedad a categoría
  const getCategoryId = (propertyType: string) => {
    switch (propertyType) {
      case 'alquiler':
        return '1' // Alquileres
      case 'venta':
      case 'terreno':
        return '2' // Inmuebles
      default:
        return '2'
    }
  }

  const onSubmit = async (data: InmobiliariaFormData) => {
    setIsSubmitting(true)

    try {
      const categoryId = getCategoryId(data.propertyType)

      const response = await fetch('/api/publish/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          categoryId: categoryId,
          zoneId: data.zoneId,
          price: data.price && data.price.trim() !== '' ? data.price : undefined,
          currency: data.currency || 'ARS',
          condition: 'nuevo', // Propiedades inmobiliarias generalmente son nuevas
          description: data.description,
          whatsapp: data.whatsapp && data.whatsapp.trim() !== '' ? data.whatsapp : undefined,
          phone: data.phone && data.phone.trim() !== '' ? data.phone : undefined,
          email: data.email && data.email.trim() !== '' ? data.email : undefined,
          instagram: data.instagram && data.instagram.trim() !== '' ? data.instagram : undefined,
          images: data.images && data.images.length > 0 ? data.images : undefined,
          image_url: data.images && data.images.length > 0 ? data.images[0] : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al crear la publicación')
        setIsSubmitting(false)
        return
      }

      toast.success('¡Propiedad publicada exitosamente!')
      router.push('/inmobiliaria-en-equipo')
    } catch (error) {
      console.error('Error al publicar:', error)
      toast.error('Error al crear la publicación')
      setIsSubmitting(false)
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
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link href="/inmobiliaria-en-equipo">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Inmobiliaria
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/inmobiliaria-en-equipo/importar">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Importar en Lote
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Publicar Propiedad</h1>
              <p className="text-muted-foreground">Completá los datos de tu propiedad</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            
            <div className="space-y-4">
              {/* Tipo de Propiedad */}
              <div>
                <Label htmlFor="propertyType">Tipo de Propiedad *</Label>
                <Select
                  value={propertyType}
                  onValueChange={(value) => setValue('propertyType', value as 'alquiler' | 'venta' | 'terreno')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venta">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Venta
                      </div>
                    </SelectItem>
                    <SelectItem value="alquiler">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Alquiler
                      </div>
                    </SelectItem>
                    <SelectItem value="terreno">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Terreno
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="text-sm text-destructive mt-1">{errors.propertyType.message}</p>
                )}
              </div>

              {/* Título */}
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Ej: Casa en Zona Norte, 3 dormitorios"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Zona */}
              <div>
                <Label htmlFor="zoneId">Zona *</Label>
                <Select
                  onValueChange={(value) => setValue('zoneId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zoneId && (
                  <p className="text-sm text-destructive mt-1">{errors.zoneId.message}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <Label htmlFor="price">Precio</Label>
                <PriceInputWithCurrency
                  value={watch('price')}
                  currency={watch('currency')}
                  onChange={(price) => setValue('price', price)}
                  onCurrencyChange={(currency) => setValue('currency', currency)}
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describí la propiedad, características, ubicación, etc."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Imágenes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Imágenes</h2>
            <ImageUpload
              value={images || []}
              onChange={(newImages) => setValue('images', newImages)}
              maxImages={10}
            />
            {errors.images && (
              <p className="text-sm text-destructive mt-2">{errors.images.message}</p>
            )}
          </Card>

          {/* Contacto */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <PhoneInput
                  value={watch('whatsapp') || ''}
                  onChange={(value) => setValue('whatsapp', value)}
                  placeholder="+54 9 342 123 4567"
                />
                {errors.whatsapp && (
                  <p className="text-sm text-destructive mt-1">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <PhoneInput
                  value={watch('phone') || ''}
                  onChange={(value) => setValue('phone', value)}
                  placeholder="+54 342 123 4567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register('instagram')}
                  placeholder="@tuusuario"
                />
                {errors.instagram && (
                  <p className="text-sm text-destructive mt-1">{errors.instagram.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                'Publicar Propiedad'
              )}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

