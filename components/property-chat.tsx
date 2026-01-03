'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Message {
  id: number
  conversation_id: number
  sender_type: 'buyer' | 'seller'
  sender_id: number | null
  message_text: string
  read_at: string | null
  created_at: string
}

interface PropertyChatProps {
  propertyId?: number
  listingId?: number
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyChat({ propertyId, listingId, title, open, onOpenChange }: PropertyChatProps) {
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerWhatsapp, setBuyerWhatsapp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [needsInitialInfo, setNeedsInitialInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && conversationId) {
      loadMessages()
      // Polling para nuevos mensajes cada 3 segundos
      const interval = setInterval(loadMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [open, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages || [])
        }
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
    }
  }

  const initConversation = async () => {
    if (!buyerName.trim()) {
      alert('Por favor, ingresá tu nombre')
      return
    }

    if (!propertyId && !listingId) {
      alert('Error: falta propertyId o listingId')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId || null,
          listing_id: listingId || null,
          buyer_name: buyerName,
          buyer_email: buyerEmail || null,
          buyer_whatsapp: buyerWhatsapp || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.conversation) {
          setConversationId(data.conversation.id)
          setNeedsInitialInfo(false)
          // Cargar mensajes existentes
          await loadMessages()
        }
      }
    } catch (error) {
      console.error('Error inicializando conversación:', error)
      alert('Error al iniciar la conversación')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    const text = messageText.trim()
    
    if (!text) {
      console.log('sendMessage: texto vacío')
      return
    }
    
    if (!conversationId) {
      console.log('sendMessage: no hay conversationId')
      alert('Error: No hay conversación activa')
      return
    }
    
    if (isSending) {
      console.log('sendMessage: ya está enviando')
      return
    }

    console.log('Enviando mensaje:', { text, conversationId })
    setMessageText('')
    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: 'buyer',
          sender_id: null,
          message_text: text,
        }),
      })

      const data = await response.json()
      console.log('Response:', { status: response.status, data })

      if (response.ok && data.success) {
        // Recargar mensajes para asegurar que se muestre correctamente
        await loadMessages()
      } else {
        setMessageText(text) // Restaurar el texto si falla
        alert(data.error || 'Error al enviar el mensaje')
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      setMessageText(text) // Restaurar el texto si falla
      alert('Error al enviar el mensaje. Ver consola para más detalles.')
    } finally {
      setIsSending(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Resetear cuando se cierra
      setConversationId(null)
      setMessages([])
      setMessageText('')
      setNeedsInitialInfo(false)
    } else {
      // Al abrir, verificar si necesita info inicial
      setNeedsInitialInfo(true)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] max-h-[600px] flex flex-col p-0 sm:h-[600px]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat sobre: {title}
          </DialogTitle>
        </DialogHeader>

        {needsInitialInfo && !conversationId ? (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-md space-y-4">
              <h3 className="text-lg font-semibold">Iniciar conversación</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Tu nombre"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">WhatsApp</label>
                  <Input
                    value={buyerWhatsapp}
                    onChange={(e) => setBuyerWhatsapp(e.target.value)}
                    placeholder="+54 9 342 123 4567"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={initConversation}
                  disabled={isLoading || !buyerName.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    'Iniciar conversación'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No hay mensajes aún. Enviá el primer mensaje.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender_type === 'buyer' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`flex-1 ${message.sender_type === 'buyer' ? 'text-right' : ''}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender_type === 'buyer'
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
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
                <Button 
                  type="button"
                  onClick={() => {
                    console.log('Botón clickeado, enviando mensaje...')
                    sendMessage()
                  }} 
                  disabled={isSending || !messageText.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

