// Página para crear una tienda
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
import { ArrowLeft, Store, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { phoneSchema, whatsappSchema, optionalEmailSchema, instagramSchema } from '@/lib/validations'
import { PhoneInput } from '@/components/ui/phone-input'
import { ImageUpload } from '@/components/ui/image-upload'

const storeSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede tener más de 200 caracteres')
    .trim(),
  description: z.string()
    .max(2000, 'La descripción no puede tener más de 2000 caracteres')
    .optional()
    .or(z.literal('')),
  zone_id: z.string()
    .optional()
    .or(z.literal('')),
  phone: phoneSchema,
  whatsapp: whatsappSchema,
  email: optionalEmailSchema,
  instagram: instagramSchema,
  address: z.string()
    .max(500, 'La dirección no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
})

type StoreFormData = z.infer<typeof storeSchema>

export default function CrearTiendaPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  })

  // Verificar autenticación y si ya tiene tienda
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          // 401 es esperado si no está autenticado, redirigir silenciosamente
          router.push('/login?redirect=/crear-tienda')
          return
        }

        setIsAuthenticated(true)

        // Verificar si ya tiene tienda
        const storeResponse = await fetch('/api/stores')
        if (storeResponse.ok) {
          const data = await storeResponse.json()
          if (data.store) {
            setHasStore(true)
            router.push('/mi-tienda')
            return
          }
        }
      } catch (error) {
        // Silenciar errores de red, solo redirigir
        router.push('/login?redirect=/crear-tienda')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const onSubmit = async (data: StoreFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || undefined,
          zone_id: data.zone_id && data.zone_id !== 'all' ? data.zone_id : undefined,
          phone: data.phone || undefined,
          whatsapp: data.whatsapp || undefined,
          email: data.email || undefined,
          instagram: data.instagram || undefined,
          address: data.address || undefined,
          logo_url: data.logo_url || undefined,
          cover_image_url: data.cover_image_url || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al crear la tienda')
        setIsSubmitting(false)
        return
      }

      toast.success('¡Tienda creada exitosamente!')
      router.push('/mi-tienda')
    } catch (error) {
      console.error('Error al crear tienda:', error)
      toast.error('Error al crear la tienda')
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras se verifica autenticación
  if (isCheckingAuth || hasStore) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-3xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando...</p>
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
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Crear mi tienda
              </h1>
              <p className="text-muted-foreground">
                Creá tu tienda online en MarketSantaFe
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre de la tienda */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la tienda <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ej: Mi Tienda Online"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Contá sobre tu tienda, qué vendés, tu historia..."
                rows={4}
                {...register('description')}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Zona */}
            <div className="space-y-2">
              <Label htmlFor="zone">Zona</Label>
              <Select
                value={watch('zone_id') || ''}
                onValueChange={(value) => setValue('zone_id', value)}
              >
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Selecciona una zona (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin zona específica</SelectItem>
                  {zones.filter(z => z.id !== '11').map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL del logo</Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://ejemplo.com/logo.jpg"
                {...register('logo_url')}
                disabled={isSubmitting}
              />
              {errors.logo_url && (
                <p className="text-sm text-destructive">
                  {errors.logo_url.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                URL de la imagen del logo de tu tienda (opcional)
              </p>
            </div>

            {/* Imagen de portada */}
            <div className="space-y-2">
              <Label htmlFor="cover_image_url">URL de imagen de portada</Label>
              <Input
                id="cover_image_url"
                type="url"
                placeholder="https://ejemplo.com/portada.jpg"
                {...register('cover_image_url')}
                disabled={isSubmitting}
              />
              {errors.cover_image_url && (
                <p className="text-sm text-destructive">
                  {errors.cover_image_url.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                URL de la imagen de portada de tu tienda (opcional)
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
                    placeholder="tienda@ejemplo.com"
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
                    placeholder="@tutienda"
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

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle y número (opcional)"
                  {...register('address')}
                  disabled={isSubmitting}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
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
                    Creando tienda...
                  </>
                ) : (
                  'Crear tienda'
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

