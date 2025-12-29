'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PagoExitoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('payment_id')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!paymentId) {
      setError('ID de pago no encontrado')
      setIsLoading(false)
      return
    }

    // Verificar el estado del pago
    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/payments/status?payment_id=${paymentId}`)
        if (!response.ok) {
          throw new Error('Error al verificar el pago')
        }
        const data = await response.json()
        setIsLoading(false)
      } catch (err: any) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    checkPayment()
  }, [paymentId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando tu pago...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link href="/mi-suscripcion">Ir a Mi Suscripción</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <Card className="p-8 max-w-md mx-auto text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu suscripción ha sido activada correctamente. Ya podés disfrutar de todos los beneficios de tu plan.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/mi-suscripcion">Ver Mi Suscripción</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/publicar">Comenzar a Publicar</Link>
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

