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
      
      // Agregar atributo al body para CSS
      if (typeof document !== 'undefined') {
        if (isInmobiliariaPage) {
          document.body.setAttribute('data-inmobiliaria-page', 'true')
        } else {
          document.body.removeAttribute('data-inmobiliaria-page')
        }
      }
      
      // Si estás en la página de inmobiliaria, mostrar el chatbot
      if (isInmobiliariaPage) {
        // Mostrar el botón del chatbot
        const chatbotButton = document.querySelector('.inmobiliaria-chatbot-button, [id*="chatbot"], [class*="chatbot-button"], [data-chatbot], [id*="chatbot-button"]')
        if (chatbotButton && chatbotButton instanceof HTMLElement) {
          chatbotButton.style.removeProperty('display')
          chatbotButton.style.removeProperty('visibility')
          chatbotButton.style.removeProperty('opacity')
        }
        
        // Mostrar el widget del chatbot si existe
        const chatbotWidget = document.querySelector('.inmobiliaria-chatbot-widget, [id*="chatbot-widget"], [class*="chatbot-widget"], [class*="chatbot-modal"], [id*="chatbot-modal"]')
        if (chatbotWidget && chatbotWidget instanceof HTMLElement) {
          chatbotWidget.style.removeProperty('display')
          chatbotWidget.style.removeProperty('visibility')
          chatbotWidget.style.removeProperty('opacity')
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
      
      // Si NO estás en la página de inmobiliaria, ocultar/destruir el chatbot de forma agresiva
      // Buscar todos los posibles elementos del chatbot con múltiples selectores
      const selectors = [
        '.inmobiliaria-chatbot-button',
        '[id*="chatbot"]',
        '[class*="chatbot-button"]',
        '[data-chatbot]',
        '[id*="chatbot-button"]',
        '.inmobiliaria-chatbot-widget',
        '[id*="chatbot-widget"]',
        '[class*="chatbot-widget"]',
        '[class*="chatbot-modal"]',
        '[id*="chatbot-modal"]',
        'iframe[src*="chatbot"]',
        'iframe[src*="inmobiliaria"]',
      ]
      
      selectors.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(selector)
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none'
              el.style.visibility = 'hidden'
              el.style.opacity = '0'
              el.style.pointerEvents = 'none'
              el.style.position = 'fixed'
              el.style.top = '-9999px'
              el.style.left = '-9999px'
              el.style.zIndex = '-9999'
            }
          })
        } catch (e) {
          // Ignorar errores de selector
        }
      })
      
      // Intentar destruir el widget si existe
      if (typeof window !== 'undefined') {
        try {
          // Intentar múltiples formas de destruir el widget
          if ((window as any).inmobiliariaChatbotWidget?.destroy) {
            (window as any).inmobiliariaChatbotWidget.destroy()
          }
          if ((window as any).chatbotWidget?.destroy) {
            (window as any).chatbotWidget.destroy()
          }
          if ((window as any).destroyChatbot) {
            (window as any).destroyChatbot()
          }
        } catch (e) {
          // Ignorar errores al destruir
        }
      }
    }
    
    // Ejecutar inmediatamente
    cleanupChatbot()
    
    // Ejecutar después de múltiples delays para asegurar que el DOM esté listo
    const timeoutIds = [
      setTimeout(cleanupChatbot, 50),
      setTimeout(cleanupChatbot, 100),
      setTimeout(cleanupChatbot, 300),
      setTimeout(cleanupChatbot, 500),
    ]
    
    // Observar cambios en el DOM para detectar cuando se agrega el chatbot
    const observer = new MutationObserver(() => {
      cleanupChatbot()
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'id'],
    })
    
    // También observar cambios en el head (por si el script se carga ahí)
    if (document.head) {
      const headObserver = new MutationObserver(() => {
        cleanupChatbot()
      })
      headObserver.observe(document.head, {
        childList: true,
        subtree: true,
      })
      
      return () => {
        timeoutIds.forEach(id => clearTimeout(id))
        observer.disconnect()
        headObserver.disconnect()
      }
    }
    
    return () => {
      timeoutIds.forEach(id => clearTimeout(id))
      observer.disconnect()
    }
  }, [pathname])
  
  return null
}
