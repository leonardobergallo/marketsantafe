// Dashboard - Chat con clientes
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageCircle, ArrowLeft, Send, User } from 'lucide-react'
import Link from 'next/link'
import { SafeImage } from '@/components/safe-image'

interface Message {
  id: number
  conversation_id: number
  sender_type: 'buyer' | 'seller'
  sender_id: number | null
  message_text: string
  read_at: string | null
  created_at: string
}

interface Conversation {
  id: number
  property_id: number
  seller_id: number
  buyer_name: string
  buyer_email: string | null
  buyer_whatsapp: string | null
  status: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  property_title: string | null
  property_image: string | null
  unread_count: number
}

export default function ChatPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/inmobiliaria-en-equipo/chat')
          return
        }

        setIsAuthenticated(true)
        loadConversations()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/inmobiliaria-en-equipo/chat')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages()
      // Polling para nuevos mensajes cada 3 segundos
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConversations(data.conversations || [])
        }
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedConversation) return

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages || [])
          // Marcar mensajes como leídos
          markAsRead()
        }
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
    }
  }

  const markAsRead = async () => {
    if (!selectedConversation) return

    try {
      // Marcar mensajes del comprador como leídos
      await fetch(`/api/conversations/${selectedConversation.id}/messages/read`, {
        method: 'POST',
      })
      // Recargar conversaciones para actualizar unread_count
      loadConversations()
    } catch (error) {
      console.error('Error marcando como leído:', error)
    }
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    const text = messageText.trim()
    setMessageText('')
    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: 'seller',
          sender_id: null, // Se puede obtener del usuario autenticado
          message_text: text,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.message) {
          setMessages((prev) => [...prev, data.message])
          loadConversations() // Actualizar last_message_at
        }
      } else {
        setMessageText(text)
        alert('Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      setMessageText(text)
      alert('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Ayer'
    } else if (days < 7) {
      return `${days} días`
    } else {
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/inmobiliaria-en-equipo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
          {/* Lista de conversaciones */}
          <Card className="p-0 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Conversaciones</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tenés conversaciones aún</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {((conv as any).item_image || conv.property_image) ? (
                          <SafeImage
                            src={(conv as any).item_image || conv.property_image}
                            alt={(conv as any).item_title || conv.property_title || ''}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold truncate">{conv.buyer_name}</p>
                            {conv.unread_count > 0 && (
                              <Badge variant="default" className="flex-shrink-0">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {(conv as any).item_title || conv.property_title || 'Sin título'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(conv.last_message_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2 p-0 flex flex-col h-[600px] lg:h-auto mt-4 lg:mt-0">
            {selectedConversation ? (
              <>
                <div className="p-3 sm:p-4 border-b flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {((selectedConversation as any).item_image || selectedConversation.property_image) ? (
                      <SafeImage
                        src={(selectedConversation as any).item_image || selectedConversation.property_image}
                        alt={(selectedConversation as any).item_title || selectedConversation.property_title || ''}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedConversation.buyer_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(selectedConversation as any).item_title || selectedConversation.property_title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender_type === 'seller' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`flex-1 ${message.sender_type === 'seller' ? 'text-right' : ''}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender_type === 'seller'
                              ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                              : 'bg-muted max-w-[80%]'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.message_text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border p-3 sm:p-4 flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      disabled={isSending}
                    />
                    <Button onClick={sendMessage} disabled={isSending || !messageText.trim()}>
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Seleccioná una conversación para comenzar</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

