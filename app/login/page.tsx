// Página de inicio de sesión
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { emailSchema } from '@/lib/validations'

// Schema de validación
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordHelp, setShowPasswordHelp] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Si es un error de autenticación (401), mostrar mensaje sobre contactar al administrador
        if (response.status === 401) {
          setShowPasswordHelp(true)
          toast.error(result.error || 'Email o contraseña incorrectos', {
            description: 'Si necesitás recuperar o cambiar tu contraseña, contactá con el administrador.',
            duration: 6000,
          })
        } else {
          setShowPasswordHelp(false)
          toast.error(result.error || 'Error al iniciar sesión')
        }
        setIsSubmitting(false)
        return
      }

      // Si el login es exitoso, ocultar el mensaje de ayuda
      setShowPasswordHelp(false)

      toast.success('¡Bienvenido!')
      
      // Redirigir a la página anterior o al inicio
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/'
      router.push(returnUrl)
      router.refresh() // Refrescar para actualizar el header
    } catch (error) {
      console.error('Error en login:', error)
      toast.error('Error al iniciar sesión')
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
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground">
            Ingresá a tu cuenta para publicar y contactar
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                autoComplete="email"
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
                placeholder="Tu contraseña"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Mensaje de ayuda para recuperar contraseña */}
            {showPasswordHelp && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Si necesitás recuperar o cambiar tu contraseña, contactá con el administrador.
                </AlertDescription>
              </Alert>
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            {/* Link a registro */}
            <p className="text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <Link href="/registro" className="text-primary hover:underline">
                Crear cuenta
              </Link>
            </p>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

