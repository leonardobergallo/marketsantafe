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
        // Restaurar todos los estilos del chatbot para que sea visible
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
                // Restaurar estilos para mostrar el chatbot
                el.style.removeProperty('display')
                el.style.removeProperty('visibility')
                el.style.removeProperty('opacity')
                el.style.removeProperty('pointer-events')
                el.style.removeProperty('position')
                el.style.removeProperty('top')
                el.style.removeProperty('left')
                el.style.removeProperty('z-index')
              }
            })
          } catch (e) {
            // Ignorar errores de selector
          }
        })
        
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
        
        // Si el widget no existe, intentar cargarlo (solo si el script ya está disponible)
        if (typeof window !== 'undefined' && (window as any).INMOBILIARIA_CHATBOT_API) {
          // El script ya está configurado, el widget debería cargarse automáticamente
          // Solo verificamos que no se haya destruido
          if ((window as any).inmobiliariaChatbotWidget && typeof (window as any).inmobiliariaChatbotWidget.destroy === 'function') {
            // El widget existe y está disponible, no hacer nada
          }
        }
        
        return // No ocultar nada si estás en la página correcta
      }
      
      // Si NO estás en la página de inmobiliaria, ocultar el chatbot (pero NO destruirlo para mantener el estado)
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
              // Solo ocultar, NO destruir para mantener el estado del chat
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
      
      // NO destruir el widget para mantener el estado del chat cuando vuelvas a inmobiliaria
      // Solo ocultarlo visualmente
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
