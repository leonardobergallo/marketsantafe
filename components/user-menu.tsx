// Componente para mostrar menú de usuario
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Store, Package } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  is_business: boolean
  business_name: string | null
  avatar_url: string | null
  verified: boolean
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Sesión cerrada')
        setUser(null)
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Error en logout:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted animate-pulse ring-2 ring-muted" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button 
          asChild 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3 sm:px-4"
        >
          <Link href="/publicar">
            <span className="hidden sm:inline">Publicar gratis</span>
            <span className="sm:hidden">Publicar</span>
          </Link>
        </Button>
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Button
        asChild
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 hidden sm:inline-flex"
      >
        <Link href="/publicar">
          <span className="hidden sm:inline">Publicar gratis</span>
          <span className="sm:hidden">Publicar</span>
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 hover:bg-muted transition-colors"
          >
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm sm:text-base">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Indicador de estado online */}
            <span className="absolute bottom-0 right-0 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-green-500 border-2 border-background rounded-full"></span>
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.is_business && user.business_name && (
              <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 mt-1">
                <Store className="h-3 w-3" />
                {user.business_name}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/mis-ventas" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Mis ventas</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/publicar" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Publicar</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  )
}

