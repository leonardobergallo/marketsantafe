// Página de administración del chatbot
// Integra el panel admin.html del chatbot
// URL: /admin-chatbot
// Solo accesible para agentes de inmobiliaria

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { Metadata } from 'next'
import { Shield, Users, MessageSquare, BarChart3, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Panel de Administración - Chatbot Inmobiliaria',
  description: 'Panel de control para gestionar clientes potenciales y conversaciones del chatbot',
}

export default async function AdminChatbotPage() {
  const user = await getCurrentUser()
  
  // Verificar que el usuario esté autenticado
  if (!user) {
    redirect('/login?redirect=/admin-chatbot')
  }
  
  // Verificar que el usuario sea agente de inmobiliaria
  if (!user.is_inmobiliaria_agent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12">
            <div className="max-w-md mx-auto text-center bg-card border border-border rounded-lg p-8 shadow-lg">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
              <p className="text-muted-foreground mb-6">
                Esta sección está disponible solo para agentes de inmobiliaria.
                Si sos agente y necesitás acceso, contactá al administrador.
              </p>
              <Button asChild>
                <Link href="/">Volver al inicio</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  const chatbotAdminUrl = 'https://inmobiliariaenquipo.vercel.app/admin.html'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Header del panel */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Panel de Administración
                </h1>
                <p className="text-muted-foreground">
                  Gestioná clientes potenciales y conversaciones del chatbot
                </p>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes</p>
                    <p className="text-lg font-semibold">-</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversaciones</p>
                    <p className="text-lg font-semibold">-</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-lg font-semibold">-</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="text-lg font-semibold text-green-600">Activo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel del chatbot embebido */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Panel de Control del Chatbot</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={chatbotAdminUrl} target="_blank" rel="noopener noreferrer">
                  Abrir en nueva pestaña
                </Link>
              </Button>
            </div>
            <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
              <iframe
                src={chatbotAdminUrl}
                className="w-full h-full border-0"
                title="Panel de Administración del Chatbot"
                allow="clipboard-read; clipboard-write"
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gestión de Clientes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Desde este panel podés ver todos los clientes potenciales que se contactaron
                a través del chatbot, sus datos de contacto y el historial de conversaciones.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Ver lista de clientes potenciales</li>
                <li>• Exportar datos de contacto</li>
                <li>• Filtrar por fecha o estado</li>
                <li>• Marcar como contactado</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversaciones
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revisá todas las conversaciones que tuvo el chatbot con los usuarios,
                analizá las consultas más frecuentes y mejorá las respuestas.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Historial completo de conversaciones</li>
                <li>• Búsqueda por palabras clave</li>
                <li>• Estadísticas de uso</li>
                <li>• Exportar reportes</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

