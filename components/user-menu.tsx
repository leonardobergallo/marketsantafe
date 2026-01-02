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
import { LogOut, User, Store, CreditCard, Home, Package, Shield } from 'lucide-react'
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
  is_admin?: boolean
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
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 flex-col sm:flex-row">
        <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button 
          asChild 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 w-full sm:w-auto"
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
    <div className="flex items-center gap-2">
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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
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
          <Link href="/publicar" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Publicar</span>
          </Link>
        </DropdownMenuItem>
        {/* Mis Productos (individuales, sin tienda) */}
        <DropdownMenuItem asChild>
          <Link href="/mis-productos" className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            <span>Mis Productos</span>
          </Link>
        </DropdownMenuItem>
        {/* Mi Tienda (para productos con tienda) */}
        {user.is_business && (
          <DropdownMenuItem asChild>
            <Link href="/mi-tienda" className="cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              <span>Mi Tienda</span>
            </Link>
          </DropdownMenuItem>
        )}
        {/* Mis Propiedades (para inmobiliarias) */}
        <DropdownMenuItem asChild>
          <Link href="/inmobiliaria-en-equipo/mis-propiedades" className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            <span>Mis Propiedades</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mi-suscripcion" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Mi Suscripción</span>
          </Link>
        </DropdownMenuItem>
        {user.is_admin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Panel de Administración</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
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

