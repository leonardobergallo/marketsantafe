// Página para editar una propiedad inmobiliaria
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { zones } from '@/lib/zones'
import { toast } from 'sonner'
import { ArrowLeft, Home, Loader2, Sparkles, Info, DollarSign, MessageCircle, CheckCircle2, Edit } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { phoneSchema, whatsappSchema, optionalEmailSchema, instagramSchema } from '@/lib/validations'
import { PhoneInput } from '@/components/ui/phone-input'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { ImageUpload } from '@/components/ui/image-upload'
import { LocationPicker } from '@/components/location-picker'

const propertySchema = z.object({
  type: z.enum(['alquiler', 'venta', 'alquiler-temporal'], {
    required_error: 'Selecciona el tipo de operación',
  }),
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede tener más de 200 caracteres')
    .trim(),
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede tener más de 2000 caracteres')
    .trim(),
  price: z.string().min(1, 'El precio es requerido'),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  zone_id: z.string()
    .min(1, 'Selecciona una zona')
    .refine((val) => val !== 'all', {
      message: 'Debes seleccionar una zona',
    }),
  rooms: z.string().optional().or(z.literal('')),
  bathrooms: z.string().optional().or(z.literal('')),
  area_m2: z.string().optional().or(z.literal('')),
  address: z.string()
    .max(500, 'La dirección no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: phoneSchema,
  whatsapp: whatsappSchema,
  email: optionalEmailSchema,
  instagram: instagramSchema,
  images: z.array(z.string())
    .max(10, 'Máximo 10 imágenes permitidas')
    .optional()
    .default([]),
  professional_service: z.boolean().optional().default(false),
})

type PropertyFormData = z.infer<typeof propertySchema>

export default function EditarPropiedadPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.id as string
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLatitude, setSelectedLatitude] = useState<number | null>(null)
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      currency: 'ARS',
      type: 'alquiler',
      professional_service: false,
    },
  })

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setSelectedLatitude(lat)
    setSelectedLongitude(lng)
    setSelectedAddress(address)
    setValue('latitude', lat, { shouldValidate: true })
    setValue('longitude', lng, { shouldValidate: true })
    setValue('address', address, { shouldValidate: true })
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/inmobiliaria-en-equipo/publicar')
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/inmobiliaria-en-equipo/publicar')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Cargar datos de la propiedad cuando esté autenticado
  useEffect(() => {
    const loadProperty = async () => {
      if (!isAuthenticated || !propertyId) {
        return
      }

      try {
        const response = await fetch(`/api/properties/${propertyId}/edit`)
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Propiedad no encontrada')
            router.push('/inmobiliaria-en-equipo/mis-propiedades')
            return
          }
          if (response.status === 401) {
            router.push('/login?redirect=/inmobiliaria-en-equipo/editar/' + propertyId)
            return
          }
          throw new Error('Error al cargar la propiedad')
        }

        const data = await response.json()
        const property = data.property

        // Rellenar formulario con los datos
        setValue('type', property.type)
        setValue('title', property.title)
        setValue('description', property.description)
        setValue('price', property.price.toString())
        setValue('currency', property.currency || 'ARS')
        setValue('zone_id', property.zone_id?.toString() || '')
        setValue('rooms', property.rooms?.toString() || '')
        setValue('bathrooms', property.bathrooms?.toString() || '')
        setValue('area_m2', property.area_m2?.toString() || '')
        setValue('address', property.address || '')
        setValue('latitude', property.latitude)
        setValue('longitude', property.longitude)
        setValue('phone', property.phone || '')
        setValue('whatsapp', property.whatsapp || '')
        setValue('email', property.email || '')
        setValue('instagram', property.instagram || '')
        setValue('images', property.images || [])
        setValue('professional_service', property.professional_service || false)

        // Establecer ubicación seleccionada
        if (property.latitude && property.longitude) {
          setSelectedLatitude(property.latitude)
          setSelectedLongitude(property.longitude)
        }
        if (property.address) {
          setSelectedAddress(property.address)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error cargando propiedad:', error)
        toast.error('Error al cargar la propiedad')
        setIsLoading(false)
        router.push('/inmobiliaria-en-equipo/mis-propiedades')
      }
    }

    loadProperty()
  }, [isAuthenticated, propertyId, router, setValue])

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: data.type,
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency || 'ARS',
          zone_id: data.zone_id,
          rooms: data.rooms || undefined,
          bathrooms: data.bathrooms || undefined,
          area_m2: data.area_m2 || undefined,
          address: data.address || selectedAddress || undefined,
          latitude: selectedLatitude || data.latitude || undefined,
          longitude: selectedLongitude || data.longitude || undefined,
          phone: data.phone || undefined,
          whatsapp: data.whatsapp || undefined,
          email: data.email || undefined,
          instagram: data.instagram || undefined,
          images: data.images || [],
          professional_service: data.professional_service || false,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 403 && result.message) {
          // Límite alcanzado
          toast.error(result.message, {
            duration: 5000,
            action: {
              label: 'Ver planes',
              onClick: () => router.push('/planes'),
            },
          })
        } else {
          toast.error(result.error || 'Error al publicar la propiedad')
        }
        setIsSubmitting(false)
        return
      }

      const publishedProperty = result.property

      // Si contrató servicio profesional, activar chatbot
      if (data.professional_service) {
        toast.success('¡Propiedad publicada con servicio profesional! Abriendo chatbot...')
        
        // Activar chatbot después de un delay
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const w = window as any
            // Intentar métodos comunes de chatbot
            if (w.chatbot?.open) {
              w.chatbot.open()
            } else if (w.openChatbot) {
              w.openChatbot()
            } else if (w.chatbotOpen) {
              w.chatbotOpen()
            } else if (w.Chatbot?.open) {
              w.Chatbot.open()
            } else if (w.Tawk_API?.maximize) {
              w.Tawk_API.maximize()
            } else {
              // Buscar botón en DOM
              const btn = document.querySelector('[data-chatbot], .chatbot-button, #chatbot-button') as HTMLElement
              if (btn) btn.click()
            }
          }
        }, 1000)
      } else {
        toast.success('¡Propiedad publicada exitosamente!')
      }
      
      router.push('/inmobiliaria-en-equipo/mis-propiedades')
    } catch (error) {
      console.error('Error al actualizar propiedad:', error)
      toast.error('Error al actualizar la propiedad')
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras se verifica autenticación o se carga la propiedad
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando propiedad...</p>
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
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/inmobiliaria-en-equipo/mis-propiedades">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mis propiedades
            </Link>
          </Button>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Edit className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Editar propiedad
              </h1>
              <p className="text-muted-foreground">
                Modificá los datos de tu propiedad
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Tipo de operación */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Tipo de operación <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as 'alquiler' | 'venta' | 'alquiler-temporal')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="alquiler-temporal">Alquiler Temporal</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Departamento 2 ambientes en Centro"
                {...register('title')}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describí la propiedad, características, ubicación, etc."
                rows={6}
                {...register('description')}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Precio y Zona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Precio <span className="text-destructive">*</span>
                </Label>
                <PriceInputWithCurrency
                  value={watch('price') || ''}
                  currency={watch('currency') || 'ARS'}
                  onPriceChange={(price) => setValue('price', price, { shouldValidate: true })}
                  onCurrencyChange={(currency) => setValue('currency', currency)}
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone_id">
                  Zona <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('zone_id') || ''}
                  onValueChange={(value) => setValue('zone_id', value)}
                >
                  <SelectTrigger id="zone_id">
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Selecciona zona</SelectItem>
                    {zones.filter(z => z.id !== '11').map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone_id && (
                  <p className="text-sm text-destructive">
                    {errors.zone_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Características */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rooms">Ambientes</Label>
                <Input
                  id="rooms"
                  type="number"
                  placeholder="Ej: 2"
                  {...register('rooms')}
                  disabled={isSubmitting}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="Ej: 1"
                  {...register('bathrooms')}
                  disabled={isSubmitting}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_m2">Metros cuadrados</Label>
                <Input
                  id="area_m2"
                  type="number"
                  placeholder="Ej: 60"
                  {...register('area_m2')}
                  disabled={isSubmitting}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Ubicación en el mapa */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-4">Ubicación exacta</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Seleccioná la ubicación exacta de tu propiedad en el mapa. Podés hacer clic en el mapa o arrastrar el marcador.
                </p>
              </div>
              <LocationPicker
                latitude={selectedLatitude}
                longitude={selectedLongitude}
                address={selectedAddress || watch('address')}
                onLocationChange={handleLocationChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Dirección (texto adicional) */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección adicional (opcional)</Label>
              <Input
                id="address"
                placeholder="Ej: Calle San Martín 1234, entre calles..."
                {...register('address')}
                disabled={isSubmitting}
                value={selectedAddress || watch('address') || ''}
                onChange={(e) => {
                  setValue('address', e.target.value)
                  setSelectedAddress(e.target.value)
                }}
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                La dirección se completa automáticamente desde el mapa, pero podés editarla o agregar más detalles.
              </p>
            </div>

            {/* Contacto */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Información de contacto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <PhoneInput
                    id="phone"
                    placeholder="3425-123456"
                    value={watch('phone') || ''}
                    onChange={(e) => setValue('phone', e.target.value, { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <PhoneInput
                    id="whatsapp"
                    placeholder="3425-123456"
                    value={watch('whatsapp') || ''}
                    onChange={(e) => setValue('whatsapp', e.target.value, { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                  {errors.whatsapp && (
                    <p className="text-sm text-destructive">
                      {errors.whatsapp.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    {...register('email')}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder="@tuusuario"
                    {...register('instagram')}
                    disabled={isSubmitting}
                  />
                  {errors.instagram && (
                    <p className="text-sm text-destructive">
                      {errors.instagram.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label>Fotos</Label>
              <ImageUpload
                maxImages={10}
                value={watch('images') || []}
                onChange={(images) => setValue('images', images)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 5-10 fotos. Formatos: JPG, PNG, etc.
              </p>
            </div>

            {/* Servicio Profesional */}
            <div className="space-y-4 pt-6 border-t-2 border-border">
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                watch('professional_service') 
                  ? 'bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-primary shadow-lg' 
                  : 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50'
              }`}>
                <div className="flex items-start gap-4 mb-4">
                  <Checkbox
                    id="professional_service"
                    checked={watch('professional_service') || false}
                    onCheckedChange={(checked) => setValue('professional_service', checked === true)}
                    disabled={isSubmitting}
                    className="mt-1.5 h-5 w-5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="professional_service" className="flex items-center gap-3 cursor-pointer group">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-foreground flex items-center gap-2">
                          <span>Servicio Profesional Inmobiliario</span>
                          {watch('professional_service') && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Seleccionado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                          Contratá nuestro servicio completo y maximizá las oportunidades de venta o alquiler de tu propiedad
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>

                {watch('professional_service') && (
                  <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Tasación y Precio */}
                    <div className="bg-background rounded-xl p-5 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-base">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <span>Tasación y Asesoramiento en Precio</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground ml-13">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Tasación profesional</strong> basada en análisis de mercado actualizado</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Comparativa de precios</strong> con propiedades similares en la zona</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Estrategia de precio</strong> optimizada para venta rápida o máximo rendimiento</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Asesoramiento continuo</strong> para ajustar precio según demanda del mercado</span>
                        </li>
                      </ul>
                    </div>

                    {/* Fotografía y Marketing */}
                    <div className="bg-background rounded-xl p-5 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-base">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <span>Fotografía Profesional y Marketing</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground ml-13">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Sesión fotográfica profesional</strong> con equipo especializado</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Recorrido virtual 360°</strong> para que los interesados exploren la propiedad desde cualquier lugar</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Edición profesional</strong> de imágenes para destacar los mejores espacios</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Video promocional</strong> de alta calidad para redes sociales y portales</span>
                        </li>
                      </ul>
                    </div>

                    {/* Publicación y Difusión */}
                    <div className="bg-background rounded-xl p-5 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-base">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <span>Publicación Multiplataforma</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground ml-13">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Publicación destacada</strong> en MarketSantaFe con mayor visibilidad</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Portales inmobiliarios aliados</strong> (Zonaprop, Argenprop, MercadoLibre Inmuebles, etc.)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Redes sociales</strong> (Instagram, Facebook) con campañas dirigidas</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">SEO optimizado</strong> para que tu propiedad aparezca en búsquedas</span>
                        </li>
                      </ul>
                    </div>

                    {/* Coordinación y Gestión */}
                    <div className="bg-background rounded-xl p-5 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-base">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <span>Coordinación de Visitas y Gestión</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground ml-13">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Agenda de visitas</strong> coordinada según tu disponibilidad</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Preselección de interesados</strong> verificando capacidad económica y seriedad</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Acompañamiento en visitas</strong> por parte de nuestro equipo profesional</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Gestión de consultas</strong> respondiendo dudas y seguimiento personalizado</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Negociación asistida</strong> para obtener las mejores condiciones</span>
                        </li>
                      </ul>
                    </div>

                    {/* Asesoramiento Legal y Documentación */}
                    <div className="bg-background rounded-xl p-5 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-base">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Info className="h-5 w-5 text-primary" />
                        </div>
                        <span>Asesoramiento Legal y Documentación</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground ml-13">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Revisión de documentación</strong> (título, escritura, boletos, etc.)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Asesoramiento legal</strong> en contratos y cláusulas</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Verificación de habilitaciones</strong> y estado de deudas</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Coordinación con escribanos</strong> y gestores para la operación</span>
                        </li>
                      </ul>
                    </div>

                    {/* Soporte y Seguimiento */}
                    <div className="bg-background rounded-xl p-5 border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-base">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <span>Soporte y Seguimiento Continuo</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-foreground ml-13">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Chatbot 24/7</strong> para consultas inmediatas</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">WhatsApp directo</strong> con tu asesor inmobiliario</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Reportes periódicos</strong> de visitas, consultas y estadísticas</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Reuniones de seguimiento</strong> para ajustar estrategia según resultados</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 flex items-start gap-3 text-sm text-foreground bg-primary/10 px-5 py-4 rounded-xl border-2 border-primary/30 shadow-sm">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Al publicar con servicio profesional</strong>, se abrirá el chatbot automáticamente para coordinar todos los detalles y agendar la primera reunión con tu asesor inmobiliario.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : watch('professional_service') ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Publicar con Servicio Profesional
                  </>
                ) : (
                  'Publicar propiedad gratis'
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
        </Card>
      </main>
      <Footer />
    </div>
  )
}

