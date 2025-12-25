'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatbotCTAProps {
  variant?: 'banner' | 'card' | 'floating'
  message?: string
  showAfterDelay?: number
  onDismiss?: () => void
}

export function ChatbotCTA({
  variant = 'banner',
  message = '¿Necesitas ayuda? Nuestro asistente virtual está aquí para ayudarte a encontrar lo que buscas.',
  showAfterDelay = 5000, // 5 segundos por defecto
  onDismiss,
}: ChatbotCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Verificar si ya fue descartado en esta sesión
    const dismissed = sessionStorage.getItem('chatbot-cta-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Mostrar después del delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, showAfterDelay)

    return () => clearTimeout(timer)
  }, [showAfterDelay])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem('chatbot-cta-dismissed', 'true')
    onDismiss?.()
  }

  const handleOpenChatbot = () => {
    // Disparar evento para abrir el chatbot
    const event = new CustomEvent('open-chatbot')
    window.dispatchEvent(event)
    handleDismiss()
  }

  if (isDismissed || !isVisible) return null

  if (variant === 'banner') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-t border-border/50 backdrop-blur-sm animate-in slide-in-from-bottom">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground flex-1">{message}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleOpenChatbot}
                className="text-xs"
              >
                Abrir chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Asistente Virtual</h3>
              <p className="text-sm text-muted-foreground mb-3">{message}</p>
              <Button size="sm" onClick={handleOpenChatbot} className="text-xs">
                Chatear ahora
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  // Floating variant
  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-xs animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3 mb-3">
          <MessageCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-5 w-5 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <Button size="sm" onClick={handleOpenChatbot} className="w-full text-xs">
          Abrir chat
        </Button>
      </div>
    </div>
  )
}

