'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { FlowType, SourceType, WizardFormData } from '@/lib/leads-types'
import { getWizardSteps } from '@/lib/wizard-config-simple'
import { zones } from '@/lib/zones'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LeadsWizardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: number
  propertyId?: number
  flowType: FlowType
  source: SourceType
}

export function LeadsWizardForm({
  open,
  onOpenChange,
  tenantId,
  propertyId,
  flowType,
  source,
}: LeadsWizardFormProps) {
  const [leadId, setLeadId] = useState<number | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<WizardFormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = getWizardSteps(flowType)
  
  // Cargar zonas para selects
  const zoneOptions = [
    ...zones.map(z => ({ label: z.name, value: z.name })),
    { label: 'Otro', value: 'otro' },
  ]

  // Resetear cuando se cierra el wizard
  useEffect(() => {
    if (!open) {
      setLeadId(null)
      setCurrentStep(0)
      setFormData({})
      setErrors({})
    }
  }, [open])

  // Inicializar lead al abrir
  useEffect(() => {
    if (open && !leadId) {
      initializeLead()
    }
  }, [open, leadId])

  // Cargar estado guardado si existe leadId
  useEffect(() => {
    if (leadId) {
      loadLeadState()
    }
  }, [leadId])

  const initializeLead = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/leads/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          property_id: propertyId,
          flow_type: flowType,
          source,
        }),
      })

      const data = await response.json()
      if (data.success && data.lead) {
        setLeadId(data.lead.id)
      } else {
        toast.error('Error al inicializar formulario')
      }
    } catch (error) {
      console.error('Error inicializando lead:', error)
      toast.error('Error al inicializar formulario')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLeadState = async () => {
    if (!leadId) return

    try {
      const response = await fetch(`/api/leads/${leadId}/resume`)
      const data = await response.json()

      if (data.success) {
        // Restaurar datos del formulario
        const restoredData: WizardFormData = {}
        if (data.steps) {
          Object.assign(restoredData, data.steps)
        }
        // También cargar desde el lead directamente
        if (data.lead) {
          if (data.lead.name) restoredData.nombre = data.lead.name
          if (data.lead.email) restoredData.email = data.lead.email
          if (data.lead.whatsapp) restoredData.telefono = data.lead.whatsapp
          if (data.lead.zone) restoredData.zona = data.lead.zone
          if (data.lead.property_type) restoredData.tipo = data.lead.property_type
          if (data.lead.budget) restoredData.presupuesto = data.lead.budget.toString()
          if (data.lead.budget_min) restoredData.presupuesto_min = data.lead.budget_min.toString()
          if (data.lead.budget_max) restoredData.presupuesto_max = data.lead.budget_max.toString()
          if (data.lead.bedrooms) restoredData.dormitorios = data.lead.bedrooms.toString()
          if (data.lead.area_m2) restoredData.m2 = data.lead.area_m2.toString()
          if (data.lead.condition) restoredData.estado = data.lead.condition
          if (data.lead.address) restoredData.direccion = data.lead.address
        }
        
        setFormData(restoredData)
        
        // Encontrar el último paso completado
        const completedSteps = Object.keys(restoredData).filter(key => {
          const step = steps.find(s => s.key === key)
          return step && restoredData[key] !== undefined && restoredData[key] !== ''
        })
        if (completedSteps.length > 0) {
          const lastCompletedIndex = steps.findIndex(s => completedSteps.includes(s.key))
          if (lastCompletedIndex >= 0) {
            setCurrentStep(lastCompletedIndex + 1)
          }
        }
      }
    } catch (error) {
      console.error('Error cargando estado:', error)
    }
  }

  const saveStep = useCallback(async (stepKey: string, value: any) => {
    if (!leadId) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/leads/${leadId}/step`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_key: stepKey, value }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error guardando paso:', response.status, errorData)
        // No mostrar error al usuario en autosave para no interrumpir
      }
    } catch (error) {
      console.error('Error guardando paso:', error)
      // No mostrar error al usuario en autosave para no interrumpir
    } finally {
      setIsSaving(false)
    }
  }, [leadId])

  const handleFieldChange = (stepKey: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [stepKey]: value }
      
      // Autosave
      saveStep(stepKey, value)
      
      // Limpiar error del campo
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors }
        delete newErrors[stepKey]
        return newErrors
      })
      
      return updated
    })
  }

  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step) return false

    // Verificar si el paso debe mostrarse
    if (step.conditional && !step.conditional(formData)) {
      return true // Paso condicional no visible, considerar válido
    }

    const value = formData[step.key]

    // Validar required
    if (step.required && (!value || value.toString().trim() === '')) {
      setErrors(prev => ({ ...prev, [step.key]: 'Este campo es requerido' }))
      return false
    }

    // Validación personalizada
    if (step.validation && value) {
      const error = step.validation(value, formData)
      if (error) {
        setErrors(prev => ({ ...prev, [step.key]: error }))
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Validar todos los pasos
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        toast.error('Por favor completa todos los campos requeridos')
        return
      }
    }

    if (!leadId) {
      toast.error('Error: Lead no inicializado')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/leads/${leadId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('¡Lead enviado exitosamente!')
        onOpenChange(false)
        // Resetear estado
        setLeadId(null)
        setCurrentStep(0)
        setFormData({})
        setErrors({})
      } else {
        toast.error(data.error || 'Error al enviar lead')
      }
    } catch (error) {
      console.error('Error enviando lead:', error)
      toast.error('Error al enviar lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar pasos visibles según condiciones
  const visibleSteps = steps.filter((step, index) => {
    if (!step.conditional) return true
    return step.conditional(formData)
  })

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1

  // Obtener opciones del step (con zonas si aplica)
  const getStepOptions = () => {
    if (currentStepData.key === 'zona') {
      return zoneOptions
    }
    return currentStepData.options || []
  }

  // Determinar título según flowType
  const getTitle = () => {
    switch (flowType) {
      case 'ALQUILAR':
        return 'Buscar Alquiler'
      case 'COMPRAR':
        return 'Buscar Compra'
      case 'VENDER':
        return 'Vender Propiedad'
      case 'TASACION':
        return 'Solicitar Tasación'
      case 'CONTACTO':
        return 'Contacto'
      default:
        return 'Consulta'
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* Barra de progreso */}
        <div className="space-y-2 py-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Paso {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Formulario del paso actual */}
        {currentStepData && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={currentStepData.key}>
                {currentStepData.label}
                {currentStepData.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {currentStepData.type === 'select' && (
                <Select
                  value={formData[currentStepData.key]?.toString() || ''}
                  onValueChange={(value) => handleFieldChange(currentStepData.key, value)}
                >
                  <SelectTrigger id={currentStepData.key}>
                    <SelectValue placeholder={`Selecciona ${currentStepData.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getStepOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {currentStepData.type === 'text' && (
                <Input
                  id={currentStepData.key}
                  type="text"
                  value={formData[currentStepData.key]?.toString() || ''}
                  onChange={(e) => handleFieldChange(currentStepData.key, e.target.value)}
                  placeholder={currentStepData.placeholder}
                  aria-invalid={!!errors[currentStepData.key]}
                />
              )}

              {currentStepData.type === 'number' && (
                <Input
                  id={currentStepData.key}
                  type="number"
                  value={formData[currentStepData.key]?.toString() || ''}
                  onChange={(e) => handleFieldChange(currentStepData.key, e.target.value)}
                  placeholder={currentStepData.placeholder}
                  aria-invalid={!!errors[currentStepData.key]}
                />
              )}

              {currentStepData.type === 'email' && (
                <Input
                  id={currentStepData.key}
                  type="email"
                  value={formData[currentStepData.key]?.toString() || ''}
                  onChange={(e) => handleFieldChange(currentStepData.key, e.target.value)}
                  placeholder={currentStepData.placeholder}
                  aria-invalid={!!errors[currentStepData.key]}
                />
              )}

              {currentStepData.type === 'tel' && (
                <Input
                  id={currentStepData.key}
                  type="tel"
                  value={formData[currentStepData.key]?.toString() || ''}
                  onChange={(e) => handleFieldChange(currentStepData.key, e.target.value)}
                  placeholder={currentStepData.placeholder}
                  aria-invalid={!!errors[currentStepData.key]}
                />
              )}

              {currentStepData.type === 'textarea' && (
                <Textarea
                  id={currentStepData.key}
                  value={formData[currentStepData.key]?.toString() || ''}
                  onChange={(e) => handleFieldChange(currentStepData.key, e.target.value)}
                  placeholder={currentStepData.placeholder}
                  rows={4}
                  aria-invalid={!!errors[currentStepData.key]}
                />
              )}

              {errors[currentStepData.key] && (
                <p className="text-sm text-destructive">{errors[currentStepData.key]}</p>
              )}
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Atrás
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {isSaving && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Guardando...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


