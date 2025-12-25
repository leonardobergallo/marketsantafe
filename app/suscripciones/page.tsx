// Página para ver y gestionar suscripciones
// URL: /suscripciones

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getCurrentUser } from '@/lib/auth'
import { getActivePlans, getActiveSubscription, getUserSubscriptions, getPendingPayments } from '@/lib/subscriptions'
import { getDaysRemainingInFreePlan, isSubscriptionExpiringSoon } from '@/lib/subscription-strategy'
import { FreePlanBanner } from '@/components/free-plan-banner'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function SuscripcionesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/suscripciones')
  }

  const [activeSubscription, allSubscriptions, pendingPayments, availablePlans, daysRemaining, expiringSoon] = await Promise.all([
    getActiveSubscription(user.id),
    getUserSubscriptions(user.id),
    getPendingPayments(user.id),
    getActivePlans(),
    getDaysRemainingInFreePlan(user.id),
    isSubscriptionExpiringSoon(user.id, 7)
  ])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      active: { variant: 'default', label: 'Activa' },
      expired: { variant: 'secondary', label: 'Expirada' },
      cancelled: { variant: 'destructive', label: 'Cancelada' },
      pending: { variant: 'outline', label: 'Pendiente' }
    }
    const config = variants[status] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mis Suscripciones</h1>
          <p className="text-muted-foreground">
            Gestioná tus planes y pagos mensuales
          </p>
        </div>

        {/* Banner de plan gratuito */}
        {daysRemaining !== null && (
          <FreePlanBanner 
            daysRemaining={daysRemaining} 
            isExpiringSoon={expiringSoon}
          />
        )}

        {/* Suscripción Activa */}
        {activeSubscription ? (
          <Card className="mb-8 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{activeSubscription.plan?.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {activeSubscription.plan?.description}
                  </CardDescription>
                </div>
                {getStatusBadge(activeSubscription.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Precio mensual</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(activeSubscription.plan?.price || 0, activeSubscription.plan?.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Válida hasta</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(activeSubscription.end_date)}
                  </p>
                </div>
              </div>

              {/* Features */}
              {activeSubscription.plan?.features && activeSubscription.plan.features.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3">Beneficios incluidos:</p>
                  <ul className="space-y-2">
                    {activeSubscription.plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" asChild>
                  <Link href="/suscripciones/historial">Ver historial</Link>
                </Button>
                {activeSubscription.auto_renew && (
                  <Badge variant="secondary" className="self-start sm:self-center">
                    Renovación automática activa
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-dashed">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tenés suscripción activa</h3>
                <p className="text-muted-foreground mb-6">
                  Elegí un plan para comenzar a publicar
                </p>
                <Button asChild>
                  <Link href="#planes">Ver planes disponibles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagos Pendientes */}
        {pendingPayments.length > 0 && (
          <Card className="mb-8 border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pagos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div>
                      <p className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <Button size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar ahora
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Planes Disponibles */}
        <div id="planes" className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Planes Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePlans.map((plan) => {
              const isCurrentPlan = activeSubscription?.plan?.id === plan.id
              return (
                <Card key={plan.id} className={isCurrentPlan ? 'border-primary shadow-lg' : ''}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatCurrency(plan.price, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isCurrentPlan ? (
                      <Button disabled className="w-full" variant="outline">
                        Plan actual
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <Link href={`/suscripciones/contratar?plan=${plan.slug}`}>
                          Contratar plan
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Historial de Suscripciones */}
        {allSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Suscripciones</CardTitle>
              <CardDescription>
                Todas tus suscripciones anteriores y actuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{subscription.plan?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(subscription.status)}
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(subscription.plan?.price || 0, subscription.plan?.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}

