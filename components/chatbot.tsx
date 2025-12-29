'use client'

import { useEffect, useState, useRef } from 'react'
import { MessageCircle, X, ArrowRight, Home, FileText, Sparkles, HelpCircle, ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Message {
  id: string
  type: 'bot' | 'user'
  text: string
  timestamp: Date
  quickReplies?: { text: string; action: string }[]
}

// Función global para abrir el chatbot desde cualquier lugar
if (typeof window !== 'undefined') {
  (window as any).openChatbot = () => {
    const event = new CustomEvent('open-chatbot')
    window.dispatchEvent(event)
  }
  
  (window as any).chatbot = {
    open: () => {
      const event = new CustomEvent('open-chatbot')
      window.dispatchEvent(event)
    }
  }
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentPath, setCurrentPath] = useState<string>('')

  // Detectar la página actual
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  // Mensaje inicial - adaptado según la página
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeMessage: Message

      // Si está en /mercado, solo mostrar opciones de productos
      if (currentPath.startsWith('/mercado')) {
        welcomeMessage = {
          id: '1',
          type: 'bot',
          text: '¡Hola! 👋 Soy tu asistente de MarketSantaFe. ¿En qué puedo ayudarte con productos?',
          timestamp: new Date(),
          quickReplies: [
            { text: '🛍️ Ver productos', action: 'products' },
            { text: '📦 Publicar producto', action: 'publish-product' },
            { text: '📊 Importar desde Excel', action: 'import-excel' },
            { text: '❓ Consultas generales', action: 'general' },
          ],
        }
      }
      // Si está en /propiedades, solo mostrar opciones de propiedades
      else if (currentPath.startsWith('/propiedades') || currentPath.startsWith('/inmobiliaria-en-equipo')) {
        welcomeMessage = {
          id: '1',
          type: 'bot',
          text: '¡Hola! 👋 Soy tu asesor inmobiliario. ¿En qué puedo ayudarte con propiedades?',
          timestamp: new Date(),
          quickReplies: [
            { text: '🏠 Ver propiedades', action: 'properties' },
            { text: '🏡 Publicar propiedad', action: 'publish' },
            { text: '💼 Servicio profesional', action: 'professional' },
            { text: '❓ Consultas generales', action: 'general' },
          ],
        }
      }
      // Página general - mostrar todas las opciones
      else {
        welcomeMessage = {
          id: '1',
          type: 'bot',
          text: '¡Hola! 👋 Soy tu asistente de MarketSantaFe. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date(),
          quickReplies: [
            { text: '🛍️ Ver productos', action: 'products' },
            { text: '🏠 Ver propiedades', action: 'properties' },
            { text: '📦 Publicar producto', action: 'publish-product' },
            { text: '🏡 Publicar propiedad', action: 'publish' },
            { text: '💼 Servicios profesionales', action: 'professional' },
            { text: '❓ Consultas generales', action: 'general' },
          ],
        }
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, currentPath])

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }

    window.addEventListener('open-chatbot', handleOpen)
    return () => {
      window.removeEventListener('open-chatbot', handleOpen)
    }
  }, [])

  const handleQuickReply = (action: string) => {
    let botResponse: Message

    switch (action) {
      case 'products':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: '¡Perfecto! Te muestro los productos disponibles. Podés buscar por categoría, zona, precio y más.',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver todos los productos', action: 'view-all-products' },
            { text: 'Buscar por categoría', action: 'search-category' },
            { text: 'Buscar por zona', action: 'search-zone-product' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'view-all-products':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo al mercado donde podrás ver todos los productos disponibles y aplicar filtros.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/mercado'
        }, 1500)
        break

      case 'search-category':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Podés buscar productos por categoría en el mercado. Las categorías incluyen: Electrónica, Ropa, Hogar, Deportes, Vehículos, Servicios y más.',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ir al mercado', action: 'view-all-products' },
            { text: 'Publicar producto', action: 'publish-product' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'search-zone-product':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'En el mercado podés filtrar productos por zona de Santa Fe. Hay productos disponibles en todas las zonas de la ciudad.',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver productos', action: 'view-all-products' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'publish-product':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: '¡Excelente! Podés publicar productos de forma gratuita. Tenés dos opciones:\n\n📝 Publicar uno por uno: Completar formulario y subir fotos\n📊 Importar desde Excel: Cargar muchos productos a la vez\n\n¿Qué preferís?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Publicar uno por uno', action: 'publish-product-now' },
            { text: 'Importar desde Excel', action: 'import-excel' },
            { text: 'Ver planes y precios', action: 'view-plans' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'import-excel':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Perfecto! Podés importar muchos productos desde un archivo Excel. El Excel debe tener columnas como: titulo, categoria, zona, descripcion, precio, foto_principal, etc.\n\nTe redirijo a la página de importación masiva.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/publicar/masivo'
        }, 1500)
        break

      case 'publish-product-now':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo al formulario para publicar tu producto. Recordá que podés publicar gratis o contratar un plan premium para destacar tu publicación.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/publicar'
        }, 1500)
        break

      case 'product-info':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Información sobre publicar productos:\n\n✅ Publicación gratuita disponible\n✅ Hasta 5 productos activos en plan gratis\n✅ Planes premium con publicaciones ilimitadas\n✅ Destacados en búsquedas\n✅ Estadísticas de visitas\n\n¿Querés ver los planes disponibles?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver planes', action: 'view-plans' },
            { text: 'Publicar gratis', action: 'publish-product-now' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'view-plans':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo a la página de planes donde podrás ver todas las opciones disponibles y sus precios.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/planes'
        }, 1500)
        break

      case 'properties':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Perfecto! Te muestro las propiedades disponibles. Podés buscar por tipo (alquiler, venta, alquiler temporal), zona, precio y características.',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver todas las propiedades', action: 'view-all' },
            { text: 'Buscar por zona', action: 'search-zone' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'view-all':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo a la página de propiedades donde podrás ver todas las opciones disponibles y aplicar filtros.',
          timestamp: new Date(),
        }
        // Redirigir después de un momento
        setTimeout(() => {
          window.location.href = '/propiedades'
        }, 1500)
        break

      case 'publish':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Excelente! Podés publicar tu propiedad de forma gratuita o contratar nuestro servicio profesional. El servicio profesional incluye: tasación, fotos profesionales, publicación en múltiples portales, coordinación de visitas y más.',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Publicar gratis', action: 'publish-free' },
            { text: 'Servicio profesional', action: 'professional-service' },
            { text: 'Más información', action: 'more-info' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'publish-free':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo al formulario para publicar tu propiedad de forma gratuita. Solo necesitás completar los datos básicos y subir fotos.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/inmobiliaria-en-equipo/publicar'
        }, 1500)
        break

      case 'professional':
      case 'professional-service':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Nuestro servicio profesional incluye:\n\n✅ Tasación profesional\n✅ Fotos profesionales y recorrido 360°\n✅ Publicación en múltiples portales\n✅ Coordinación de visitas\n✅ Asesoramiento legal\n✅ Soporte continuo\n\n¿Querés conocer más detalles o contratar el servicio?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver detalles completos', action: 'view-details' },
            { text: 'Contratar ahora', action: 'hire-now' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'view-details':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo a la página con todos los detalles del servicio profesional inmobiliario.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/servicio-profesional-inmobiliario'
        }, 1500)
        break

      case 'hire-now':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Perfecto! Te redirijo al formulario de publicación donde podrás marcar la opción de servicio profesional.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.location.href = '/inmobiliaria-en-equipo/publicar'
        }, 1500)
        break

      case 'general':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Estoy aquí para ayudarte con cualquier consulta sobre:\n\n🛍️ Productos y servicios\n🏠 Propiedades en venta o alquiler\n📋 Proceso de publicación\n💼 Servicios profesionales\n💰 Planes y precios\n📞 Contacto con vendedores\n\n¿Sobre qué querés consultar?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Cómo publicar', action: 'how-to-publish' },
            { text: 'Planes y precios', action: 'pricing' },
            { text: 'Contactar vendedor', action: 'contact' },
            { text: 'Preguntas frecuentes', action: 'faq' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'how-to-publish':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Publicar es muy fácil:\n\n📦 Para productos:\n1️⃣ Creá una cuenta\n2️⃣ Hacé clic en "Publicar"\n3️⃣ Seleccioná "Mercado"\n4️⃣ Completá el formulario y subí fotos\n\n🏠 Para propiedades:\n1️⃣ Creá una cuenta\n2️⃣ Hacé clic en "Publicar"\n3️⃣ Seleccioná "Propiedades"\n4️⃣ Completá el formulario\n5️⃣ Opcional: contratá servicio profesional\n\n¿Qué querés publicar?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Publicar producto', action: 'publish-product-now' },
            { text: 'Publicar propiedad', action: 'publish-free' },
            { text: 'Ver planes', action: 'view-plans' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'pricing':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Planes disponibles:\n\n🆓 Gratis:\n• Hasta 5 productos activos\n• Publicar propiedades gratis\n• Contacto directo\n\n⭐ Individual Premium ($4.999/mes):\n• Productos ilimitados\n• Destacados en búsquedas\n• Estadísticas\n\n🏠 Propiedades Premium ($9.999/mes):\n• Hasta 10 propiedades\n• Destacados y estadísticas\n\n💼 Negocio Básico ($9.999/mes):\n• Tienda online\n• Hasta 50 productos\n\n💼 Negocio Pro ($19.999/mes):\n• Productos ilimitados\n• Estadísticas avanzadas\n\n¿Querés ver más detalles?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver planes completos', action: 'view-plans' },
            { text: 'Contactar por WhatsApp', action: 'contact-whatsapp' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'contact':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Para contactar a un vendedor o propietario:\n\n1️⃣ Buscá el producto o propiedad que te interesa\n2️⃣ Hacé clic en "Ver detalles"\n3️⃣ Usá los botones de contacto (WhatsApp, teléfono, email)\n\n¿Qué querés buscar?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Buscar productos', action: 'view-all-products' },
            { text: 'Buscar propiedades', action: 'view-all' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'contact-whatsapp':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Te redirijo a WhatsApp para que puedas contactarnos directamente.',
          timestamp: new Date(),
        }
        setTimeout(() => {
          window.open('https://wa.me/5493425123456', '_blank')
        }, 1000)
        break

      case 'more-info':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Podés encontrar más información en:\n\n📄 Página de planes\n📋 Formularios de publicación\n💼 Servicio profesional inmobiliario\n💬 Este chat\n\n¿Sobre qué querés saber más?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver planes', action: 'view-plans' },
            { text: 'Servicio profesional', action: 'professional' },
            { text: 'Cómo publicar', action: 'how-to-publish' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'faq':
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Preguntas frecuentes:\n\n❓ ¿Es gratis publicar?\n✅ Sí, podés publicar productos y propiedades gratis (con límites)\n\n❓ ¿Cómo contacto a un vendedor?\n✅ En cada publicación hay botones de contacto\n\n❓ ¿Qué planes hay disponibles?\n✅ Plan Gratis, Individual Premium, Propiedades Premium, Negocio Básico y Pro\n\n❓ ¿Puedo destacar mi publicación?\n✅ Sí, con los planes premium\n\n¿Querés más información?',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver planes', action: 'view-plans' },
            { text: 'Cómo publicar', action: 'how-to-publish' },
            { text: 'Contactar por WhatsApp', action: 'contact-whatsapp' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
        break

      case 'menu':
        // Mostrar menú según la página actual
        let menuReplies: { text: string; action: string }[]
        if (currentPath.startsWith('/mercado')) {
          menuReplies = [
            { text: '🛍️ Ver productos', action: 'products' },
            { text: '📦 Publicar producto', action: 'publish-product' },
            { text: '📊 Importar desde Excel', action: 'import-excel' },
            { text: '❓ Consultas generales', action: 'general' },
          ]
        } else if (currentPath.startsWith('/propiedades') || currentPath.startsWith('/inmobiliaria-en-equipo')) {
          menuReplies = [
            { text: '🏠 Ver propiedades', action: 'properties' },
            { text: '🏡 Publicar propiedad', action: 'publish' },
            { text: '💼 Servicio profesional', action: 'professional' },
            { text: '❓ Consultas generales', action: 'general' },
          ]
        } else {
          menuReplies = [
            { text: '🛍️ Ver productos', action: 'products' },
            { text: '🏠 Ver propiedades', action: 'properties' },
            { text: '📦 Publicar producto', action: 'publish-product' },
            { text: '🏡 Publicar propiedad', action: 'publish' },
            { text: '💼 Servicios profesionales', action: 'professional' },
            { text: '❓ Consultas generales', action: 'general' },
          ]
        }
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: '¡Por supuesto! ¿En qué puedo ayudarte?',
          timestamp: new Date(),
          quickReplies: menuReplies,
        }
        break

      default:
        // Mostrar opciones según la página actual
        let defaultReplies: { text: string; action: string }[]
        let defaultText = 'No entendí esa opción. Podés elegir una de las opciones disponibles o escribirme lo que necesitás:'
        
        if (currentPath.startsWith('/mercado')) {
          defaultReplies = [
            { text: '🛍️ Ver productos', action: 'products' },
            { text: '📦 Publicar producto', action: 'publish-product' },
            { text: '📊 Importar desde Excel', action: 'import-excel' },
            { text: '🔍 Buscar por zona', action: 'search-zone-product' },
            { text: '❓ Consultas generales', action: 'general' },
          ]
          defaultText = 'No entendí esa opción. Podés elegir una de las opciones o escribirme:\n\n• "buscar por zona" para filtrar productos\n• "publicar" para crear una publicación\n• "importar excel" para cargar muchos productos\n\n¿Qué necesitás?'
        } else if (currentPath.startsWith('/propiedades') || currentPath.startsWith('/inmobiliaria-en-equipo')) {
          defaultReplies = [
            { text: '🏠 Ver propiedades', action: 'properties' },
            { text: '🏡 Publicar propiedad', action: 'publish' },
            { text: '🔍 Buscar por zona', action: 'search-zone' },
            { text: '💼 Servicio profesional', action: 'professional' },
            { text: '❓ Consultas generales', action: 'general' },
          ]
          defaultText = 'No entendí esa opción. Podés elegir una de las opciones o escribirme:\n\n• "buscar por zona" para filtrar propiedades\n• "publicar" para publicar tu propiedad\n• "servicio profesional" para conocer el servicio\n\n¿En qué puedo ayudarte?'
        } else {
          defaultReplies = [
            { text: '🛍️ Ver productos', action: 'products' },
            { text: '🏠 Ver propiedades', action: 'properties' },
            { text: '📦 Publicar producto', action: 'publish-product' },
            { text: '🏡 Publicar propiedad', action: 'publish' },
            { text: '💼 Servicios profesionales', action: 'professional' },
            { text: '❓ Consultas generales', action: 'general' },
          ]
          defaultText = 'No entendí esa opción. Podés elegir una de las opciones o escribirme lo que necesitás:\n\n• "ver productos" o "ver propiedades"\n• "publicar" para crear una publicación\n• "buscar por zona" para filtrar resultados\n\n¿Qué querés hacer?'
        }
        botResponse = {
          id: Date.now().toString(),
          type: 'bot',
          text: defaultText,
          timestamp: new Date(),
          quickReplies: defaultReplies,
        }
    }

    setMessages((prev) => [...prev, botResponse])
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userText = inputValue.toLowerCase().trim()
    setInputValue('')

    // Detectar intenciones del usuario
    setTimeout(() => {
      let botResponse: Message

      // Detectar búsqueda por zona
      if (userText.includes('zona') || userText.includes('barrio') || userText.includes('buscar por')) {
        if (currentPath.startsWith('/mercado') || userText.includes('producto')) {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: 'Perfecto! Para buscar productos por zona, te redirijo al mercado donde podrás usar los filtros para seleccionar la zona que te interesa.',
            timestamp: new Date(),
            quickReplies: [
              { text: 'Ir al mercado', action: 'view-all-products' },
              { text: 'Ver todas las zonas', action: 'search-zone-product' },
              { text: 'Volver al menú', action: 'menu' },
            ],
          }
          setTimeout(() => {
            window.location.href = '/mercado'
          }, 2000)
        } else {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: 'Perfecto! Para buscar propiedades por zona, te redirijo a la página de propiedades donde podrás usar los filtros para seleccionar la zona que te interesa.',
            timestamp: new Date(),
            quickReplies: [
              { text: 'Ir a propiedades', action: 'view-all' },
              { text: 'Ver todas las zonas', action: 'search-zone' },
              { text: 'Volver al menú', action: 'menu' },
            ],
          }
          setTimeout(() => {
            window.location.href = '/propiedades'
          }, 2000)
        }
      }
      // Detectar publicación
      else if (userText.includes('publicar') || userText.includes('vender') || userText.includes('alquilar')) {
        if (userText.includes('propiedad') || userText.includes('casa') || userText.includes('departamento')) {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: '¡Excelente! Te redirijo al formulario para publicar tu propiedad. Podés publicar gratis o contratar nuestro servicio profesional.',
            timestamp: new Date(),
            quickReplies: [
              { text: 'Publicar gratis', action: 'publish-free' },
              { text: 'Servicio profesional', action: 'professional-service' },
              { text: 'Volver al menú', action: 'menu' },
            ],
          }
          setTimeout(() => {
            window.location.href = '/inmobiliaria-en-equipo/publicar'
          }, 2000)
        } else {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: '¡Perfecto! Te redirijo al formulario para publicar tu producto. Podés publicar gratis o importar desde Excel si tenés muchos productos.',
            timestamp: new Date(),
            quickReplies: [
              { text: 'Publicar producto', action: 'publish-product-now' },
              { text: 'Importar desde Excel', action: 'import-excel' },
              { text: 'Volver al menú', action: 'menu' },
            ],
          }
          setTimeout(() => {
            window.location.href = '/publicar'
          }, 2000)
        }
      }
      // Detectar ver/buscar productos o propiedades
      else if (userText.includes('ver') || userText.includes('buscar') || userText.includes('encontrar')) {
        if (userText.includes('producto') || userText.includes('mercado')) {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: 'Te redirijo al mercado donde podrás ver todos los productos disponibles y usar filtros para encontrar lo que buscás.',
            timestamp: new Date(),
            quickReplies: [
              { text: 'Ir al mercado', action: 'view-all-products' },
              { text: 'Buscar por categoría', action: 'search-category' },
              { text: 'Volver al menú', action: 'menu' },
            ],
          }
          setTimeout(() => {
            window.location.href = '/mercado'
          }, 2000)
        } else {
          botResponse = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: 'Te redirijo a la página de propiedades donde podrás ver todas las opciones disponibles y usar filtros para encontrar lo que buscás.',
            timestamp: new Date(),
            quickReplies: [
              { text: 'Ir a propiedades', action: 'view-all' },
              { text: 'Buscar por zona', action: 'search-zone' },
              { text: 'Volver al menú', action: 'menu' },
            ],
          }
          setTimeout(() => {
            window.location.href = '/propiedades'
          }, 2000)
        }
      }
      // Detectar servicio profesional
      else if (userText.includes('servicio') || userText.includes('profesional') || userText.includes('asesor')) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Nuestro servicio profesional incluye tasación, fotos profesionales, publicación multiplataforma, coordinación de visitas y más. La comisión es del 3% solo cuando se concreta la venta/alquiler.',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver detalles completos', action: 'view-details' },
            { text: 'Contratar ahora', action: 'hire-now' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
      }
      // Detectar precios/comisiones
      else if (userText.includes('precio') || userText.includes('costo') || userText.includes('comisión') || userText.includes('cuanto')) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'El servicio profesional funciona con comisión del 3%:\n\n💰 Venta: 3% del valor\n🏠 Alquiler: 1 mes de alquiler\n⏰ Temporal: 15% del contrato\n\n✅ Sin pago inicial\n✅ Se paga solo al concretar\n✅ Incluye todos los servicios',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver planes', action: 'view-plans' },
            { text: 'Servicio profesional', action: 'professional' },
            { text: 'Volver al menú', action: 'menu' },
          ],
        }
      }
      // Respuesta por defecto más útil
      else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Entiendo. Podés escribirme cosas como:\n\n• "buscar por zona" - Para filtrar por zona\n• "publicar" - Para crear una publicación\n• "ver productos" o "ver propiedades"\n• "servicio profesional" - Para conocer el servicio\n\nO elegí una opción del menú:',
          timestamp: new Date(),
          quickReplies: [
            { text: 'Ver menú', action: 'menu' },
            { text: 'Contactar por WhatsApp', action: 'contact-whatsapp' },
          ],
        }
      }
      
      setMessages((prev) => [...prev, botResponse])
    }, 800)
  }

  if (!isOpen && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-background border border-border rounded-lg shadow-2xl flex flex-col h-[600px] max-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="font-semibold">MarketSantaFe</h3>
            <p className="text-xs opacity-90">Estamos aquí para ayudarte</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsMinimized(true)
              setIsOpen(false)
            }}
            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.type === 'bot' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {message.quickReplies && message.quickReplies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.quickReplies.map((reply, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply.action)}
                        className="text-xs"
                      >
                        {reply.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage()
                }
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="sm" onClick={handleSendMessage}>
              Enviar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            O contactanos por{' '}
            <a
              href="https://wa.me/5493425123456"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
