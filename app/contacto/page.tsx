// Página de contacto general
'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react'
import { LeadsWizardForm } from '@/components/leads-wizard-form'

export default function ContactoPage() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Contactanos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estamos acá para ayudarte. Completá el formulario y nos pondremos en contacto contigo a la brevedad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información de contacto */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Información de contacto</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Formulario de contacto</h3>
                    <p className="text-sm text-muted-foreground">
                      Completá el formulario y te responderemos pronto
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Enviános un email cuando quieras
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ubicación</h3>
                    <p className="text-sm text-muted-foreground">
                      Santa Fe, Argentina
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Formulario */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Envianos un mensaje</h2>
              <p className="text-muted-foreground mb-6">
                Completá el formulario y nos pondremos en contacto contigo
              </p>
              <Button 
                onClick={() => setWizardOpen(true)} 
                className="w-full" 
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Abrir formulario de contacto
              </Button>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Horario de atención:</strong>
                  <br />
                  Lunes a Viernes: 9:00 - 18:00
                  <br />
                  Sábados: 9:00 - 13:00
                </p>
              </div>
            </Card>
          </div>

          {/* Información adicional */}
          <Card className="p-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">¿Necesitás ayuda con algo específico?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Propiedades</h3>
                <p className="text-sm text-muted-foreground">
                  Consultas sobre propiedades en venta o alquiler
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Publicar Propiedad</h3>
                <p className="text-sm text-muted-foreground">
                  Información sobre cómo publicar tu propiedad
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Servicios</h3>
                <p className="text-sm text-muted-foreground">
                  Consultas sobre nuestros servicios profesionales
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Wizard Form Modal */}
      <LeadsWizardForm
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        flowType="CONTACTO"
        source="web:landing"
      />
    </div>
  )
}

