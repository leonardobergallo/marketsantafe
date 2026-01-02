'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Home, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { SubscribeButton } from '@/components/subscribe-button'

interface UpgradePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLimit: number
  limitType: 'property' | 'listing' | 'store_product'
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  currentLimit,
  limitType,
}: UpgradePlanDialogProps) {
  const router = useRouter()

  // Planes relevantes para propiedades
  const propertyPlans = [
    {
      id: 'properties-premium',
      name: 'Propiedades Premium',
      price: '$9.999',
      period: '/mes',
      icon: Home,
      features: [
        'Hasta 10 propiedades activas',
        'Destacado en búsquedas',
        'Estadísticas detalladas',
        'Soporte prioritario',
      ],
      notIncluded: ['Sin servicio profesional incluido'],
    },
    {
      id: 'business-pro',
      name: 'Negocio Pro',
      price: '$19.999',
      period: '/mes',
      icon: Sparkles,
      popular: true,
      features: [
        'Propiedades ilimitadas',
        'Publicaciones ilimitadas',
        'Productos ilimitados',
        'Destacado en búsquedas',
        'Estadísticas avanzadas',
        'Soporte prioritario',
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Límite alcanzado: {currentLimit} propiedades
          </DialogTitle>
          <DialogDescription className="text-base">
            Actualizá tu plan para publicar más propiedades y potenciar tus ventas
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {propertyPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 border-2 relative ${
                plan.popular ? 'border-primary' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute top-4 right-4" variant="default">
                  Más Popular
                </Badge>
              )}
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <plan.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <SubscribeButton
                planType={plan.id as any}
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full"
              >
                Comenzar ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </SubscribeButton>
            </Card>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/planes')}
          >
            Ver todos los planes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

