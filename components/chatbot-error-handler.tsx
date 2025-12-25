'use client'

import { useEffect } from 'react'

/**
 * Componente cliente para silenciar errores del chatbot
 * Intercepta errores de fetch relacionados con el chatbot y los silencia
 * Debe estar presente en todas las páginas donde el chatbot pueda estar activo
 */
export function ChatbotErrorHandler() {
  useEffect(() => {
    // Verificar si el interceptor ya está instalado (para evitar duplicados)
    if ((window as any).__chatbotErrorHandlerInstalled) {
      return
    }
    (window as any).__chatbotErrorHandlerInstalled = true
    // Función para verificar si un error es del chatbot
    const isChatbotError = (error: any): boolean => {
      if (!error) return false
      
      const errorString = String(error)
      const errorMessage = error?.message || ''
      const errorStack = error?.stack || ''
      
      return (
        errorString.includes('Failed to fetch') ||
        errorString.includes('chatbot') ||
        errorString.includes('inmobiliariaenquipo') ||
        errorString.includes('/api/web/chat') ||
        errorString.includes('/api/admin') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('chatbot') ||
        errorMessage.includes('inmobiliariaenquipo') ||
        errorStack.includes('chatbot') ||
        errorStack.includes('inmobiliariaenquipo')
      )
    }
    
    // Interceptor de errores no capturados relacionados con el chatbot
    const originalErrorHandler = window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
      // Silenciar errores relacionados con el chatbot
      if (
        (typeof message === 'string' && (
          message.includes('Failed to fetch') ||
          message.includes('chatbot') ||
          message.includes('inmobiliariaenquipo') ||
          message.includes('/api/web/chat') ||
          message.includes('/api/admin')
        )) ||
        isChatbotError(error)
      ) {
        console.warn('⚠️ Chatbot: Error silenciado:', message)
        return true // Prevenir que el error se muestre
      }
      
      // Para otros errores, usar el handler original
      if (originalErrorHandler) {
        return originalErrorHandler.call(this, message, source, lineno, colno, error)
      }
      return false
    }
    
    // Interceptor de promesas rechazadas no capturadas
    const originalUnhandledRejection = window.onunhandledrejection
    window.onunhandledrejection = function(event) {
      const reason = event.reason
      
      // Silenciar rechazos relacionados con el chatbot
      if (isChatbotError(reason)) {
        // No loguear nada, solo silenciar
        event.preventDefault() // Prevenir que se muestre el error
        return
      }
      
      // Verificar también en el string del error
      const reasonString = String(reason)
      const reasonMessage = reason?.message || ''
      const reasonName = reason?.name || ''
      
      // Capturar "Failed to fetch" de cualquier origen relacionado con el chatbot
      if (
        reasonString.includes('Failed to fetch') ||
        reasonString.includes('chatbot') ||
        reasonString.includes('inmobiliariaenquipo') ||
        reasonString.includes('/api/web/chat') ||
        reasonString.includes('/api/admin') ||
        reasonMessage.includes('Failed to fetch') ||
        reasonMessage.includes('chatbot') ||
        reasonMessage.includes('inmobiliariaenquipo') ||
        reasonName === 'TypeError' && (reasonMessage.includes('fetch') || reasonString.includes('fetch'))
      ) {
        // No loguear nada, solo silenciar completamente
        event.preventDefault() // Prevenir que se muestre el error
        return
      }
      
      // Para otros rechazos, usar el handler original
      if (originalUnhandledRejection) {
        return originalUnhandledRejection.call(this, event)
      }
    }
    
    // Interceptor adicional para errores de fetch del chatbot
    const originalConsoleError = console.error
    console.error = function(...args) {
      // Verificar si el error es del chatbot
      const errorString = args.map(arg => String(arg)).join(' ')
      if (
        (errorString.includes('Failed to fetch') || 
         errorString.includes('CORS') ||
         errorString.includes('ERR_FAILED') ||
         errorString.includes('Error inicializando sesión') ||
         errorString.includes('initSession')) &&
        (errorString.includes('chatbot') || 
         errorString.includes('inmobiliariaenquipo') ||
         errorString.includes('/api/web/chat') ||
         errorString.includes('/api/admin') ||
         errorString.includes('chat/session') ||
         errorString.includes('chatbot-widget'))
      ) {
        // Silenciar el error del chatbot completamente
        return
      }
      // Para otros errores, usar el console.error original
      originalConsoleError.apply(console, args)
    }
    
    // También interceptar console.log para silenciar mensajes del widget
    const originalConsoleLog = console.log
    console.log = function(...args) {
      const logString = args.map(arg => String(arg)).join(' ')
      // Silenciar logs relacionados con errores del chatbot
      if (
        logString.includes('inmobiliariaenquipo.vercel.app') &&
        (logString.includes('error') || logString.includes('Error') || logString.includes('failed'))
      ) {
        return
      }
      originalConsoleLog.apply(console, args)
    }
    
    // Cleanup al desmontar
    return () => {
      // Restaurar handlers originales solo si este componente los instaló
      window.onerror = originalErrorHandler
      window.onunhandledrejection = originalUnhandledRejection
      console.error = originalConsoleError
      console.log = originalConsoleLog
      delete (window as any).__chatbotErrorHandlerInstalled
    }
  }, [])
  
  return null // Este componente no renderiza nada
}

