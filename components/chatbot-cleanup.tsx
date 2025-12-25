'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Componente para limpiar el chatbot cuando no estás en la página de inmobiliaria
 */
export function ChatbotCleanup() {
  const pathname = usePathname()
  
  useEffect(() => {
    const cleanupChatbot = () => {
      const isInmobiliariaPage = pathname?.includes('/inmobiliaria-en-equipo')
      
      // Si estás en la página de inmobiliaria, mostrar el chatbot
      if (isInmobiliariaPage) {
        // Mostrar el botón del chatbot
        const chatbotButton = document.querySelector('.inmobiliaria-chatbot-button, [id*="chatbot"], [class*="chatbot-button"], [data-chatbot]')
        if (chatbotButton && chatbotButton instanceof HTMLElement) {
          chatbotButton.style.removeProperty('display')
          chatbotButton.style.removeProperty('visibility')
        }
        
        // Ocultar mensajes de error del chatbot (pero mantener el widget visible)
        const errorMessages = document.querySelectorAll('.inmobiliaria-chatbot-widget [class*="error"], .inmobiliaria-chatbot-widget [class*="Error"]')
        errorMessages.forEach((el) => {
          if (el instanceof HTMLElement) {
            const text = el.textContent || ''
            if (text.includes('Error al conectar') || text.includes('servidor')) {
              el.style.display = 'none'
            }
          }
        })
        return // No ocultar nada si estás en la página correcta
      }
      
      // Si NO estás en la página de inmobiliaria, ocultar/destruir el chatbot
      // Ocultar el botón del chatbot
      const chatbotButton = document.querySelector('.inmobiliaria-chatbot-button, [id*="chatbot"], [class*="chatbot-button"], [data-chatbot]')
      if (chatbotButton && chatbotButton instanceof HTMLElement) {
        chatbotButton.style.display = 'none'
        chatbotButton.style.visibility = 'hidden'
      }
      
      // Ocultar el widget del chatbot si está abierto
      const chatbotWidget = document.querySelector('.inmobiliaria-chatbot-widget, [id*="chatbot-widget"], [class*="chatbot-widget"], [class*="chatbot-modal"]')
      if (chatbotWidget && chatbotWidget instanceof HTMLElement) {
        chatbotWidget.style.display = 'none'
        chatbotWidget.style.visibility = 'hidden'
      }
      
      // Intentar destruir el widget si existe
      if (typeof window !== 'undefined') {
        try {
          if ((window as any).inmobiliariaChatbotWidget?.destroy) {
            (window as any).inmobiliariaChatbotWidget.destroy()
          }
        } catch (e) {
          // Ignorar errores al destruir
        }
      }
    }
    
    // Ejecutar inmediatamente
    cleanupChatbot()
    
    // Ejecutar después de un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(cleanupChatbot, 100)
    
    // Observar cambios en el DOM para detectar cuando se agrega el chatbot
    const observer = new MutationObserver(cleanupChatbot)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    
    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [pathname])
  
  return null
}
