'use client'

import { useEffect } from 'react'

interface ChatbotActivatorProps {
  delay?: number
}

export function ChatbotActivator({ delay = 2000 }: ChatbotActivatorProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const w = window as any
        // Intentar métodos comunes de chatbot
        if (w.chatbot?.open) {
          w.chatbot.open()
        } else if (w.openChatbot) {
          w.openChatbot()
        } else {
          // Disparar evento personalizado para el chatbot
          const event = new CustomEvent('open-chatbot')
          window.dispatchEvent(event)
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return null
}




