// Página para ver y gestionar la suscripción del usuario
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  Loader2,
  Sparkles,
  User,
  Store,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Subscription {
  plan: string
  status: string
  expiresAt: string | null
  isActive: boolean
  limits: {
    listings: number
    properties: number
    store_products: number
    featured: boolean
  }
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratis',
  'individual-premium': 'Individual Premium',
  'properties-premium': 'Propiedades Premium',
  'business-basic': 'Negocio Básico',
  'business-pro': 'Negocio Pro',
}

const PLAN_PRICES: Record<string, number> = {
  'individual-premium': 4999,
  'properties-premium': 9999,
  'business-basic': 9999,
  'business-pro': 19999,
}

export default function MiSuscripcionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else if (response.status === 401) {
        router.push('/login?redirect=/mi-suscripcion')
      }
    } catch (error) {
      console.error('Error obteniendo suscripción:', error)
      toast.error('Error al cargar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (planType: string) => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: planType,
          payment_method: 'whatsapp', // Por ahora solo WhatsApp
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al crear la suscripción')
        return
      }

      if (result.whatsapp_url) {
        // Abrir WhatsApp
        window.open(result.whatsapp_url, '_blank')
        toast.success('Te redirigimos a WhatsApp para completar el pago')
      } else {
        toast.success('Suscripción creada. Te contactaremos pronto.')
      }

      // Recargar suscripción después de un momento
      setTimeout(() => {
        fetchSubscription()
      }, 2000)
    } catch (error) {
      console.error('Error actualizando plan:', error)
      toast.error('Error al actualizar el plan')
    } finally {
      setIsUpgrading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando suscripción...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No se pudo cargar la suscripción</p>
            <Button asChild className="mt-4">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Ilimitado' : limit.toString()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mi Suscripción
          </h1>
          <p className="text-muted-foreground">
            Gestioná tu plan y límites de publicación
          </p>
        </div>

        {/* Suscripción Actual */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {PLAN_NAMES[subscription.plan] || 'Plan Gratis'}
                </h2>
                {subscription.isActive ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Expirada
                  </Badge>
                )}
              </div>
              {subscription.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {subscription.isActive 
                      ? `Vence el ${new Date(subscription.expiresAt).toLocaleDateString('es-AR')}`
                      : `Expiró el ${new Date(subscription.expiresAt).toLocaleDateString('es-AR')}`
                    }
                  </span>
                </div>
              )}
            </div>
            {subscription.plan !== 'free' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  ${PLAN_PRICES[subscription.plan]?.toLocaleString('es-AR')}
                </div>
                <div className="text-sm text-muted-foreground">/mes</div>
              </div>
            )}
          </div>

          {/* Límites */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Publicaciones</div>
              <div className="text-2xl font-bold text-foreground">
                {formatLimit(subscription.limits.listings)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Propiedades</div>
              <div className="text-2xl font-bold text-foreground">
                {formatLimit(subscription.limits.properties)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Productos en tienda</div>
              <div className="text-2xl font-bold text-foreground">
                {formatLimit(subscription.limits.store_products)}
              </div>
            </div>
          </div>

          {subscription.limits.featured && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Publicaciones destacadas incluidas</span>
              </div>
            </div>
          )}
        </Card>

        {/* Planes Disponibles */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Actualizar Plan
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {subscription.plan !== 'individual-premium' && (
              <Card className="p-6 border-2">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-lg">Individual Premium</h3>
                    <div className="text-2xl font-bold text-foreground">
                      $4.999<span className="text-sm text-muted-foreground">/mes</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Publicaciones ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Destacado en búsquedas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Estadísticas</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('individual-premium')}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Actualizar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </Card>
            )}

            {subscription.plan !== 'properties-premium' && (
              <Card className="p-6 border-2">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-lg">Propiedades Premium</h3>
                    <div className="text-2xl font-bold text-foreground">
                      $9.999<span className="text-sm text-muted-foreground">/mes</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Hasta 10 propiedades</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Destacado en búsquedas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Estadísticas detalladas</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleUpgrade('properties-premium')}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Actualizar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </Card>
            )}

            {subscription.plan !== 'business-basic' && (
              <Card className="p-6 border-2">
                <div className="flex items-center gap-3 mb-4">
                  <Store className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-lg">Negocio Básico</h3>
                    <div className="text-2xl font-bold text-foreground">
                      $9.999<span className="text-sm text-muted-foreground">/mes</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Tienda online</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Hasta 50 productos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Panel de control</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleUpgrade('business-basic')}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Actualizar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </Card>
            )}

            {subscription.plan !== 'business-pro' && (
              <Card className="p-6 border-2 border-primary">
                <Badge className="mb-2">Más Popular</Badge>
                <div className="flex items-center gap-3 mb-4">
                  <Store className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-lg">Negocio Pro</h3>
                    <div className="text-2xl font-bold text-foreground">
                      $19.999<span className="text-sm text-muted-foreground">/mes</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Todo ilimitado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Estadísticas avanzadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Soporte prioritario</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade('business-pro')}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Actualizar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Ver todos los planes */}
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Querés ver todos los planes disponibles?
          </p>
          <Button asChild variant="outline">
            <Link href="/planes">
              Ver todos los planes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  )
}





