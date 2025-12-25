// Banner cliente para mostrar período gratuito
'use client'

import { useState, useEffect } from 'react'
import { FreePlanBanner } from './free-plan-banner'

export function FreePlanBannerClient() {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [expiringSoon, setExpiringSoon] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFreePlanInfo()
  }, [])

  const fetchFreePlanInfo = async () => {
    try {
      const response = await fetch('/api/subscriptions/free-plan-info')
      if (response.ok) {
        const data = await response.json()
        setDaysRemaining(data.daysRemaining)
        setExpiringSoon(data.expiringSoon || false)
      }
    } catch (error) {
      console.error('Error obteniendo info del plan gratuito:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || daysRemaining === null) {
    return null
  }

  return (
    <FreePlanBanner 
      daysRemaining={daysRemaining}
      isExpiringSoon={expiringSoon}
    />
  )
}

