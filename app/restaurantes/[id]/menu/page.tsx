// Página para gestionar el menú de un restaurante
// URL: /restaurantes/[id]/menu

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/image-upload'
import { PriceInputWithCurrency } from '@/components/ui/price-input-with-currency'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2, UtensilsCrossed, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const menuItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().optional(),
  price: z.string().or(z.number()).transform((val) => {
    if (typeof val === 'string') {
      const num = parseFloat(val.replace(/[^\d.]/g, ''))
      return isNaN(num) ? 0 : num
    }
    return val
  }),
  image_url: z.string().optional(),
  available: z.boolean().default(true),
})

type MenuItemFormData = z.infer<typeof menuItemSchema>

interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
}

export default function GestionarMenuPage() {
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      available: true,
    },
  })

  const images = watch('image_url') ? [watch('image_url')] : []

  useEffect(() => {
    checkAuthAndLoadData()
  }, [restaurantId])

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar autenticación
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        router.push('/login?returnUrl=' + encodeURIComponent(`/restaurantes/${restaurantId}/menu`))
        return
      }
      setIsAuthenticated(true)

      // Cargar restaurante y menú
      const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}`)
      if (!restaurantResponse.ok) {
        toast.error('Restaurante no encontrado')
        router.push('/comer')
        return
      }

      const restaurantData = await restaurantResponse.json()
      setRestaurant(restaurantData.restaurant)

      // Cargar menú
      const menuResponse = await fetch(`/api/restaurants/${restaurantId}/menu`)
      if (menuResponse.ok) {
        const menuData = await menuResponse.json()
        setMenuItems(menuData.menu_items || [])
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: MenuItemFormData) => {
    setIsSubmitting(true)

    try {
      const url = editingItem
        ? `/api/restaurants/${restaurantId}/menu/${editingItem.id}`
        : `/api/restaurants/${restaurantId}/menu`

      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          price: typeof data.price === 'number' ? data.price : parseFloat(String(data.price)),
          image_url: data.image_url || null,
          available: data.available,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al guardar el plato')
        setIsSubmitting(false)
        return
      }

      toast.success(editingItem ? 'Plato actualizado' : 'Plato agregado')
      reset()
      setEditingItem(null)
      checkAuthAndLoadData()
    } catch (error) {
      console.error('Error guardando plato:', error)
      toast.error('Error al guardar el plato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setValue('name', item.name)
    setValue('description', item.description || '')
    setValue('price', item.price.toString())
    setValue('image_url', item.image_url || '')
    setValue('available', item.available)
  }

  const handleDelete = async (itemId: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar este plato?')) {
      return
    }

    setIsDeleting(itemId)

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Error al eliminar el plato')
        setIsDeleting(null)
        return
      }

      toast.success('Plato eliminado')
      checkAuthAndLoadData()
    } catch (error) {
      console.error('Error eliminando plato:', error)
      toast.error('Error al eliminar el plato')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCancel = () => {
    reset()
    setEditingItem(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || !restaurant) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/restaurantes/${restaurantId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al restaurante
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Gestionar Menú - {restaurant.name}
          </h1>
          <p className="text-muted-foreground">
            Agregá, editá o eliminá platos de tu menú
          </p>
        </div>

        {/* Formulario para agregar/editar plato */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Editar plato' : 'Agregar nuevo plato'}
            </CardTitle>
            <CardDescription>
              {editingItem ? 'Modificá los datos del plato' : 'Completá los datos del nuevo plato'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre del plato <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ej: Pizza Muzzarella"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    Precio <span className="text-destructive">*</span>
                  </Label>
                  <PriceInputWithCurrency
                    id="price"
                    value={watch('price')}
                    onChange={(value) => setValue('price', value)}
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descripción del plato (opcional)"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen del plato</Label>
                <ImageUpload
                  value={images}
                  onChange={(urls) => setValue('image_url', urls[0] || '')}
                  maxImages={1}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={watch('available')}
                  onCheckedChange={(checked) => setValue('available', checked === true)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="available" className="cursor-pointer">
                  Disponible
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      {editingItem ? (
                        <>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Actualizar plato
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar plato
                        </>
                      )}
                    </>
                  )}
                </Button>
                {editingItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de platos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Platos del Menú ({menuItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No tenés platos en el menú aún
                </p>
                <p className="text-sm text-muted-foreground">
                  Agregá tu primer plato usando el formulario de arriba
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image_url && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {!item.available && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                No disponible
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <p className="text-lg font-bold text-primary mb-3">
                            ${item.price.toLocaleString('es-AR')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              disabled={isDeleting === item.id}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                              disabled={isDeleting === item.id}
                            >
                              {isDeleting === item.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                              )}
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

