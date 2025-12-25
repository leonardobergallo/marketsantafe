// Banner para mostrar período gratuito y días restantes
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Gift, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface FreePlanBannerProps {
  daysRemaining: number | null
  isExpiringSoon?: boolean
  onDismiss?: () => void
}

export function FreePlanBanner({ daysRemaining, isExpiringSoon = false, onDismiss }: FreePlanBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (dismissed || daysRemaining === null) {
    return null
  }

  if (daysRemaining === 0) {
    return (
      <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-950/10 mb-6">
        <div className="p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Tu período gratuito ha finalizado
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Para seguir publicando, elegí un plan de suscripción.
              </p>
              <Button size="sm" asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/suscripciones">Ver planes</Link>
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  if (isExpiringSoon) {
    return (
      <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/10 mb-6">
        <div className="p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Tu período gratuito vence pronto
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                Te quedan <strong>{daysRemaining} días</strong> de acceso gratuito.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                No te quedes sin publicar. Elegí tu plan ahora y aprovechá un <strong>20% de descuento</strong> en el primer mes.
              </p>
              <div className="flex gap-2">
                <Button size="sm" asChild className="bg-yellow-600 hover:bg-yellow-700">
                  <Link href="/suscripciones">Ver planes</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/suscripciones">Más información</Link>
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/10 mb-6">
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                ¡Estás en período gratuito!
              </h3>
              <Badge variant="secondary" className="bg-green-600 text-white">
                {daysRemaining} días restantes
              </Badge>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              Estás disfrutando de acceso completo sin costo. Publicá todo lo que quieras.
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Cuando termine tu período gratuito, podés elegir un plan para seguir publicando.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 flex-shrink-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

