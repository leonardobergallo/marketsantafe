// Panel de Administración
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Shield, Users, Home, Package, BarChart3, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    listings: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login?redirect=/admin')
          return
        }

        const data = await response.json()
        if (!data.user?.is_admin) {
          router.push('/')
          return
        }

        setIsAuthenticated(true)
        setIsAdmin(true)
        fetchStats()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        router.push('/login?redirect=/admin')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-6xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando permisos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">
                Gestioná usuarios, propiedades y productos
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.users}</p>
              </div>
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Propiedades</p>
                <p className="text-2xl font-bold">{stats.properties}</p>
              </div>
              <Home className="h-8 w-8 text-primary/50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Productos</p>
                <p className="text-2xl font-bold">{stats.listings}</p>
              </div>
              <Package className="h-8 w-8 text-primary/50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Usuarios Activos</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary/50" />
            </div>
          </Card>
        </div>

        {/* Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Link href="/admin/leads">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Bandeja de Leads</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestioná todas las consultas y mensajes
                  </p>
                </div>
              </div>
            </Link>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Usuarios</h2>
                <p className="text-sm text-muted-foreground">Gestionar usuarios</p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/usuarios">Ver Usuarios</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Propiedades</h2>
                <p className="text-sm text-muted-foreground">Gestionar propiedades</p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/propiedades">Ver Propiedades</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Productos</h2>
                <p className="text-sm text-muted-foreground">Gestionar productos</p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/productos">Ver Productos</Link>
            </Button>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

