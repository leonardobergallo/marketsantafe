// Página de registro de usuarios
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { PhoneInput } from '@/components/ui/phone-input'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { emailSchema, phoneSchema, whatsappSchema, nameSchema } from '@/lib/validations'

// Schema de validación
const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede tener más de 100 caracteres')
      .refine(
        (val) => /[A-Za-z]/.test(val) && /[0-9]/.test(val),
        {
          message: 'La contraseña debe contener al menos una letra y un número',
        }
      ),
    confirmPassword: z.string(),
    phone: phoneSchema,
    whatsapp: whatsappSchema,
    is_business: z.boolean().default(false),
    business_name: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val, ctx) => {
          // Si es negocio, el nombre es requerido
          if (ctx.parent.is_business) {
            return val && val.trim() !== ''
          }
          return true
        },
        {
          message: 'El nombre del negocio es requerido',
        }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegistroPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      is_business: false,
    },
  })

  const isBusiness = watch('is_business')

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone && data.phone.trim() !== '' ? data.phone.trim() : undefined,
          whatsapp: data.whatsapp && data.whatsapp.trim() !== '' ? data.whatsapp.trim() : undefined,
          is_business: data.is_business,
          business_name: data.is_business && data.business_name && data.business_name.trim() !== '' 
            ? data.business_name.trim() 
            : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Mostrar detalles de error si están disponibles
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((d: any) => d.message).join(', ')
          toast.error(errorMessages || result.error || 'Error al registrar usuario')
        } else {
          toast.error(result.error || 'Error al registrar usuario')
        }
        setIsSubmitting(false)
        return
      }

      toast.success('¡Registro exitoso! Redirigiendo...')
      
      // Redirigir a login después de 1 segundo
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } catch (error) {
      console.error('Error en registro:', error)
      toast.error('Error al registrar usuario')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Crear cuenta
          </h1>
          <p className="text-muted-foreground">
            Registrate para publicar y contactar directamente
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Juan Pérez"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="tu@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Mínimo 6 caracteres"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Repetí tu contraseña"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <PhoneInput
                id="phone"
                {...register('phone')}
                placeholder="3425-123456"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: 3425-123456 (opcional)
              </p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <PhoneInput
                id="whatsapp"
                {...register('whatsapp')}
                placeholder="3425-123456"
                disabled={isSubmitting}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: 3425-123456 (opcional)
              </p>
            </div>

            {/* Es negocio */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_business"
                {...register('is_business')}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="is_business"
                className="text-sm font-normal cursor-pointer"
              >
                Soy un negocio
              </Label>
            </div>

            {/* Nombre del negocio (solo si es negocio) */}
            {isBusiness && (
              <div className="space-y-2">
                <Label htmlFor="business_name">
                  Nombre del negocio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="business_name"
                  {...register('business_name')}
                  placeholder="Mi Negocio"
                  disabled={isSubmitting}
                />
                {errors.business_name && (
                  <p className="text-sm text-destructive">
                    {errors.business_name.message}
                  </p>
                )}
              </div>
            )}

            {/* Botón submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </Button>

            {/* Link a login */}
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

