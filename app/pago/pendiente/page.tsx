'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import Link from 'next/link'

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Pago Pendiente
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu pago está siendo procesado. Te notificaremos por email cuando se confirme. Esto puede tardar unos minutos.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/mi-suscripcion">Ver Mi Suscripción</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/planes">Volver a Planes</Link>
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}




