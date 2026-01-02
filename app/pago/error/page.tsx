'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PagoErrorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <Card className="p-8 max-w-md mx-auto text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Pago Rechazado
          </h1>
          <p className="text-muted-foreground mb-6">
            No se pudo procesar tu pago. Por favor, intentá nuevamente o contactanos si el problema persiste.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link href="/planes">Volver a Planes</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://wa.me/5493425123456" target="_blank" rel="noopener noreferrer">
                Contactar por WhatsApp
              </a>
            </Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}




