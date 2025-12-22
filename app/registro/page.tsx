// Página de registro de usuarios
'use client'

import { useState, useEffect } from 'react'
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
import { ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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
    business_name: z.string().default(''),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      // Si es negocio, el nombre es requerido
      if (data.is_business) {
        return data.business_name && typeof data.business_name === 'string' && data.business_name.trim() !== ''
      }
      return true
    },
    {
      message: 'El nombre del negocio es requerido',
      path: ['business_name'],
    }
  )

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegistroPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean
    exists: boolean | null
    valid: boolean | null
  }>({
    checking: false,
    exists: null,
    valid: null,
  })

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
  const emailValue = watch('email')

  // Verificar email en tiempo real con debounce
  useEffect(() => {
    if (!emailValue || emailValue.trim() === '') {
      setEmailStatus({ checking: false, exists: null, valid: null })
      return
    }

    // Validar formato básico antes de hacer la petición
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailValue)) {
      setEmailStatus({ checking: false, exists: null, valid: false })
      return
    }

    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(async () => {
      setEmailStatus({ checking: true, exists: null, valid: null })

      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(emailValue)}`)
        const data = await response.json()

        if (response.ok) {
          setEmailStatus({
            checking: false,
            exists: data.exists,
            valid: data.valid,
          })

          if (data.exists) {
            toast.error('Este email ya está registrado', {
              description: '¿Querés iniciar sesión en su lugar?',
              duration: 4000,
            })
          }
        } else {
          setEmailStatus({ checking: false, exists: null, valid: false })
        }
      } catch (error) {
        console.error('Error verificando email:', error)
        setEmailStatus({ checking: false, exists: null, valid: null })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [emailValue])

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
        } else if (response.status === 409) {
          // Error de conflicto (email ya existe)
          toast.error('Este email ya está registrado', {
            description: '¿Querés iniciar sesión en su lugar?',
            duration: 5000,
            action: {
              label: 'Ir a login',
              onClick: () => router.push('/login'),
            },
          })
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
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                  className={
                    emailStatus.exists
                      ? 'border-destructive pr-10'
                      : emailStatus.exists === false && emailStatus.valid
                      ? 'border-green-500 pr-10'
                      : ''
                  }
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailStatus.checking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : emailStatus.exists ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : emailStatus.exists === false && emailStatus.valid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : null}
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
              {emailStatus.exists && !errors.email && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Este email ya está registrado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ¿Ya tenés cuenta?{' '}
                      <Link href="/login" className="text-primary hover:underline font-medium">
                        Iniciar sesión
                      </Link>
                    </p>
                  </div>
                </div>
              )}
              {emailStatus.exists === false && emailStatus.valid && !errors.email && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Email disponible
                </p>
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

