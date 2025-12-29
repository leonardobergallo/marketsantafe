// Página para publicar un nuevo aviso
// TypeScript: este componente es un Client Component porque usa hooks de formulario
// En JavaScript sería similar pero sin tipos

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
import { categories } from '@/lib/categories'
import { zones } from '@/lib/zones'
import { type Condition } from '@/lib/mockListings'
import { toast } from 'sonner'
import { ArrowLeft, ShoppingBag, UtensilsCrossed, Loader2, Home, FileSpreadsheet, Upload } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { phoneSchema, whatsappSchema, priceSchema, optionalEmailSchema, instagramSchema } from '@/lib/validations'
import { PhoneInput } from '@/components/ui/phone-input'
import { PriceInput } from '@/components/ui/price-input'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { ImageUpload } from '@/components/ui/image-upload'

type VerticalType = 'mercado' | 'gastronomia' | null

export default function PublicarPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Estado para la vertical seleccionada
  const [vertical, setVertical] = useState<VerticalType>(null)
  
  // Schemas de validación
  const mercadoSchema = z.object({
    title: z.string()
      .min(5, 'El título debe tener al menos 5 caracteres')
      .max(200, 'El título no puede tener más de 200 caracteres')
      .trim(),
    categoryId: z.string()
      .min(1, 'Selecciona una categoría')
      .refine((val) => val !== 'all', {
        message: 'Debes seleccionar una categoría',
      }),
    zoneId: z.string()
      .min(1, 'Selecciona una zona')
      .refine((val) => val !== 'all', {
        message: 'Debes seleccionar una zona',
      }),
    price: priceSchema,
    currency: z.enum(['ARS', 'USD']).default('ARS'),
    condition: z.enum(['nuevo', 'usado', 'reacondicionado']).optional().or(z.literal('')),
    description: z.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede tener más de 2000 caracteres')
      .trim(),
    whatsapp: whatsappSchema,
    phone: phoneSchema,
    email: optionalEmailSchema,
    instagram: instagramSchema,
    images: z.array(z.string())
      .max(5, 'Máximo 5 imágenes permitidas')
      .optional()
      .default([]),
  })

  const gastronomiaSchema = z.object({
    name: z.string()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(200, 'El nombre no puede tener más de 200 caracteres')
      .trim(),
    foodType: z.string().optional().or(z.literal('')),
    zoneId: z.string()
      .min(1, 'Selecciona una zona')
      .refine((val) => val !== 'all', {
        message: 'Debes seleccionar una zona',
      }),
    description: z.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(2000, 'La descripción no puede tener más de 2000 caracteres')
      .trim(),
    hours: z.string().optional().or(z.literal('')),
    whatsapp: whatsappSchema,
    phone: phoneSchema,
    email: optionalEmailSchema,
    instagram: instagramSchema,
    delivery: z.boolean().default(false),
    pickup: z.boolean().default(false),
    images: z.array(z.string())
      .max(5, 'Máximo 5 imágenes permitidas')
      .optional()
      .default([]),
  })

  type MercadoFormData = z.infer<typeof mercadoSchema>
  type GastronomiaFormData = z.infer<typeof gastronomiaSchema>

  // Formulario MERCADO
  const mercadoForm = useForm<MercadoFormData>({
    resolver: zodResolver(mercadoSchema),
    defaultValues: {
      categoryId: 'all',
      zoneId: 'all',
      condition: '',
      price: '',
      currency: 'ARS',
      whatsapp: '',
      phone: '',
      email: '',
      instagram: '',
      images: [],
    },
  })

  // Formulario GASTRONOMÍA
  const gastronomiaForm = useForm<GastronomiaFormData>({
    resolver: zodResolver(gastronomiaSchema),
    defaultValues: {
      zoneId: 'all',
      foodType: '',
      hours: '',
      whatsapp: '',
      phone: '',
      email: '',
      instagram: '',
      delivery: false,
      pickup: true,
      images: [],
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Redirigir a login con returnUrl (401 es esperado si no está autenticado)
          router.push(`/login?returnUrl=${encodeURIComponent('/publicar')}`)
        }
      } catch (error) {
        // Silenciar errores de red, solo redirigir
        router.push(`/login?returnUrl=${encodeURIComponent('/publicar')}`)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // Función para manejar el envío del formulario MERCADO
  const onMercadoSubmit = async (data: MercadoFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/publish/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          categoryId: data.categoryId,
          zoneId: data.zoneId,
          price: data.price && data.price.trim() !== '' ? data.price : undefined,
          currency: data.currency || 'ARS',
          condition: data.condition && data.condition !== '' && data.condition !== 'none' ? data.condition : undefined,
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
          toast.error(result.error || 'Error al crear la publicación')
        }
        setIsSubmitting(false)
        return
      }

      toast.success('¡Publicación creada exitosamente!')
      router.push('/mercado')
    } catch (error) {
      console.error('Error al publicar:', error)
      toast.error('Error al crear la publicación')
      setIsSubmitting(false)
    }
  }

  // Función para manejar el envío del formulario GASTRONOMÍA
  const onGastronomiaSubmit = async (data: GastronomiaFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/publish/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          foodType: data.foodType || undefined,
          zoneId: data.zoneId,
          description: data.description,
          hours: data.hours || undefined,
          whatsapp: data.whatsapp || undefined,
          phone: data.phone || undefined,
          email: data.email,
          instagram: data.instagram,
          delivery: data.delivery,
          pickup: data.pickup,
          image_url: data.images && data.images.length > 0 ? data.images[0] : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al crear el restaurante')
        setIsSubmitting(false)
        return
      }

      toast.success('¡Restaurante creado exitosamente!')
      router.push('/comer')
    } catch (error) {
      console.error('Error al publicar:', error)
      toast.error('Error al crear el restaurante')
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras se verifica autenticación
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl flex items-center justify-center">
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
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl">
        {/* Header de la página */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Publicá en menos de 1 minuto
          </h1>
          <p className="text-muted-foreground">
            Publicá fácil, vendé directo
          </p>
        </div>

        {/* Selector de vertical - Paso 1 */}
        {!vertical && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              ¿Qué querés publicar?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setVertical('mercado')}
                className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
              >
                <ShoppingBag className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  Mercado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Productos, servicios, alquileres
                </p>
              </button>
              <Link
                href="/inmobiliaria-en-equipo/publicar"
                className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
              >
                <Home className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  Propiedades
                </h3>
                <p className="text-sm text-muted-foreground">
                  Alquiler, venta, alquiler temporal
                </p>
                <p className="text-xs text-primary mt-2 font-medium">
                  Con opción de servicio profesional
                </p>
              </Link>
              {/* Gastronomía - Oculto para segunda etapa */}
              {/* <button
                onClick={() => setVertical('gastronomia')}
                className="p-6 border-2 border-border rounded-lg hover:border-primary transition-colors text-left group"
              >
                <UtensilsCrossed className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  Gastronomía
                </h3>
                <p className="text-sm text-muted-foreground">
                  Restaurantes, locales, delivery
                </p>
              </button> */}
            </div>
          </Card>
        )}

        {/* Formulario MERCADO */}
        {vertical === 'mercado' && (
          <>
            {/* Opción de importar desde Excel */}
            <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    ¿Tenés muchos productos para publicar?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Importá múltiples productos desde un archivo Excel de una vez. Ideal para negocios con muchos productos.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Link href="/publicar/masivo">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar desde Excel
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>

            <form onSubmit={mercadoForm.handleSubmit(onMercadoSubmit)} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Publicar producto individual</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVertical(null)}
                >
                  Cambiar
                </Button>
              </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Departamento 2 ambientes en Centro"
                {...mercadoForm.register('title')}
                disabled={isSubmitting}
              />
              {mercadoForm.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {mercadoForm.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Categoría y Zona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={mercadoForm.watch('categoryId')}
                  onValueChange={(value) => mercadoForm.setValue('categoryId', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
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
                {mercadoForm.formState.errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">
                  Zona <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={mercadoForm.watch('zoneId')}
                  onValueChange={(value) => mercadoForm.setValue('zoneId', value)}
                >
                  <SelectTrigger id="zone">
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
                {mercadoForm.formState.errors.zoneId && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.zoneId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Precio y Condición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <PriceInputWithCurrency
                  value={mercadoForm.watch('price') || ''}
                  currency={mercadoForm.watch('currency') || 'ARS'}
                  onPriceChange={(price) => mercadoForm.setValue('price', price, { shouldValidate: true })}
                  onCurrencyChange={(currency) => mercadoForm.setValue('currency', currency)}
                  disabled={isSubmitting}
                />
                {mercadoForm.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.price.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Dejá vacío para "Consultar precio"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condición</Label>
                <Select
                  value={mercadoForm.watch('condition') || undefined}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      mercadoForm.setValue('condition', '')
                    } else {
                      mercadoForm.setValue('condition', value as Condition | '')
                    }
                  }}
                >
                  <SelectTrigger id="condition">
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
              <Label htmlFor="description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe tu producto o servicio..."
                rows={6}
                {...mercadoForm.register('description')}
                disabled={isSubmitting}
              />
              {mercadoForm.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {mercadoForm.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <PhoneInput
                  id="whatsapp"
                  placeholder="3425-123456"
                  value={mercadoForm.watch('whatsapp') || ''}
                  onChange={(e) => mercadoForm.setValue('whatsapp', e.target.value, { shouldValidate: true })}
                  disabled={isSubmitting}
                />
                {mercadoForm.formState.errors.whatsapp && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.whatsapp.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: 3425-123456 (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <PhoneInput
                  id="phone"
                  placeholder="3425-123456"
                  value={mercadoForm.watch('phone') || ''}
                  onChange={(e) => mercadoForm.setValue('phone', e.target.value, { shouldValidate: true })}
                  disabled={isSubmitting}
                />
                {mercadoForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: 3425-123456 (opcional)
                </p>
              </div>
            </div>

            {/* Email e Instagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...mercadoForm.register('email')}
                  disabled={isSubmitting}
                />
                {mercadoForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.email.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  type="text"
                  placeholder="@tuusuario"
                  {...mercadoForm.register('instagram')}
                  disabled={isSubmitting}
                />
                {mercadoForm.formState.errors.instagram && (
                  <p className="text-sm text-destructive">
                    {mercadoForm.formState.errors.instagram.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: @usuario (opcional)
                </p>
              </div>
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label>Fotos</Label>
              <ImageUpload
                maxImages={3}
                value={mercadoForm.watch('images') || []}
                onChange={(images) => mercadoForm.setValue('images', images)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 3 fotos (máximo 5). Formatos: JPG, PNG, etc.
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || mercadoForm.formState.isSubmitting}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar aviso'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
          </>
        )}

        {/* Formulario GASTRONOMÍA - Oculto para segunda etapa */}
        {false && vertical === 'gastronomia' && (
          <form onSubmit={gastronomiaForm.handleSubmit(onGastronomiaSubmit)} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Publicar en Gastronomía</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setVertical(null)}
              >
                Cambiar
              </Button>
            </div>

            {/* Nombre del local */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del local <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Pizzería El Buen Sabor"
                {...gastronomiaForm.register('name')}
                disabled={isSubmitting}
              />
              {gastronomiaForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {gastronomiaForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Tipo de comida y Zona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodType">Tipo de comida</Label>
                <Input
                  id="foodType"
                  placeholder="Ej: Pizza, Comida Casera, Sushi"
                  {...gastronomiaForm.register('foodType')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone-gastro">
                  Zona <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={gastronomiaForm.watch('zoneId')}
                  onValueChange={(value) => gastronomiaForm.setValue('zoneId', value)}
                >
                  <SelectTrigger id="zone-gastro">
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
                {gastronomiaForm.formState.errors.zoneId && (
                  <p className="text-sm text-destructive">
                    {gastronomiaForm.formState.errors.zoneId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description-gastro">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description-gastro"
                placeholder="Describe tu local, especialidades..."
                rows={6}
                {...gastronomiaForm.register('description')}
                disabled={isSubmitting}
              />
              {gastronomiaForm.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {gastronomiaForm.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Horarios */}
            <div className="space-y-2">
              <Label htmlFor="hours">Horarios</Label>
              <Input
                id="hours"
                placeholder="Ej: Lun-Vie 12:00-15:00, 19:00-23:00"
                {...gastronomiaForm.register('hours')}
                disabled={isSubmitting}
              />
            </div>

            {/* Delivery / Retiro */}
            <div className="space-y-2">
              <Label>Servicios</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={gastronomiaForm.watch('delivery')}
                    onChange={(e) => gastronomiaForm.setValue('delivery', e.target.checked)}
                    className="rounded"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">Delivery</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={gastronomiaForm.watch('pickup')}
                    onChange={(e) => gastronomiaForm.setValue('pickup', e.target.checked)}
                    className="rounded"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">Retiro</span>
                </label>
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp-gastro">WhatsApp</Label>
                <PhoneInput
                  id="whatsapp-gastro"
                  placeholder="3425-123456"
                  value={gastronomiaForm.watch('whatsapp') || ''}
                  onChange={(e) => gastronomiaForm.setValue('whatsapp', e.target.value, { shouldValidate: true })}
                  disabled={isSubmitting}
                />
                {gastronomiaForm.formState.errors.whatsapp && (
                  <p className="text-sm text-destructive">
                    {gastronomiaForm.formState.errors.whatsapp.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: 3425-123456 (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-gastro">Teléfono</Label>
                <PhoneInput
                  id="phone-gastro"
                  placeholder="3425-123456"
                  value={gastronomiaForm.watch('phone') || ''}
                  onChange={(e) => gastronomiaForm.setValue('phone', e.target.value, { shouldValidate: true })}
                  disabled={isSubmitting}
                />
                {gastronomiaForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {gastronomiaForm.formState.errors.phone.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: 3425-123456 (opcional)
                </p>
              </div>
            </div>

            {/* Email e Instagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-gastro">Email</Label>
                <Input
                  id="email-gastro"
                  type="email"
                  placeholder="tu@email.com"
                  {...gastronomiaForm.register('email')}
                  disabled={isSubmitting}
                />
                {gastronomiaForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {gastronomiaForm.formState.errors.email.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram-gastro">Instagram</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="instagram-gastro"
                    placeholder="usuario"
                    {...gastronomiaForm.register('instagram')}
                    disabled={isSubmitting}
                    className="pl-8"
                  />
                </div>
                {gastronomiaForm.formState.errors.instagram && (
                  <p className="text-sm text-destructive">
                    {gastronomiaForm.formState.errors.instagram.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  (opcional)
                </p>
              </div>
            </div>

            {/* Fotos */}
            <div className="space-y-2">
              <Label>Fotos</Label>
              <ImageUpload
                value={gastronomiaForm.watch('images') || []}
                onChange={(images) => gastronomiaForm.setValue('images', images)}
                maxImages={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || gastronomiaForm.formState.isSubmitting}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar local'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
