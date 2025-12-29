'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SubscribeButtonProps {
  planType: 'individual-premium' | 'properties-premium' | 'business-basic' | 'business-pro'
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  className?: string
}

export function SubscribeButton({ 
  planType, 
  variant = 'default', 
  size = 'lg',
  children,
  className 
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setIsLoading(true)
    
    try {
      // Crear preferencia de pago
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_type: planType }),
      })

      // Verificar si no está autenticado ANTES de parsear el JSON
      if (response.status === 401) {
        setIsLoading(false)
        toast.error('Debes iniciar sesión para suscribirte')
        router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      if (!response.ok) {
        let errorMessage = 'Error al crear la preferencia de pago'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }
        setIsLoading(false)
        toast.error(errorMessage)
        return
      }

      const data = await response.json()

      // Redirigir a MercadoPago
      if (data.init_point) {
        window.location.href = data.init_point
      } else if (data.sandbox_init_point) {
        // En desarrollo, usar sandbox
        window.location.href = data.sandbox_init_point
      } else {
        setIsLoading(false)
        toast.error('No se recibió el link de pago')
      }
    } catch (error: any) {
      console.error('Error al suscribirse:', error)
      setIsLoading(false)
      // Solo mostrar error si no es un error de redirección
      if (error.name !== 'AbortError') {
        toast.error(error.message || 'Error al procesar la suscripción')
      }
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        children
      )}
    </Button>
  )
}

