// Configuración simplificada de pasos del wizard (sin async para options)
import { WizardStep, FlowType } from './leads-types'

const propertyTypes = [
  { label: 'Casa', value: 'casa' },
  { label: 'Departamento', value: 'departamento' },
  { label: 'Terreno', value: 'terreno' },
  { label: 'Local comercial', value: 'local' },
  { label: 'Otro', value: 'otro' },
]

const conditions = [
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Usado', value: 'usado' },
  { label: 'A refaccionar', value: 'refaccionar' },
]

// Las zonas se cargarán dinámicamente en el componente
export function getWizardSteps(flowType: FlowType): WizardStep[] {
  switch (flowType) {
    case 'ALQUILAR':
      return [
        {
          key: 'zona',
          label: '¿En qué zona buscas?',
          type: 'select',
          required: true,
          options: [], // Se carga dinámicamente
        },
        {
          key: 'zona_otro',
          label: 'Especifica la zona',
          type: 'text',
          required: true,
          conditional: (data) => data.zona === 'otro',
        },
        {
          key: 'tipo',
          label: '¿Qué tipo de propiedad?',
          type: 'select',
          required: true,
          options: propertyTypes,
        },
        {
          key: 'presupuesto',
          label: 'Presupuesto mensual (ARS)',
          type: 'number',
          required: true,
          placeholder: 'Ej: 50000',
          validation: (value) => {
            const num = parseFloat(value)
            if (isNaN(num) || num <= 0) return 'El presupuesto debe ser mayor a 0'
            return null
          },
        },
        {
          key: 'dormitorios',
          label: '¿Cuántos dormitorios?',
          type: 'select',
          required: false,
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4+', value: '4' },
            { label: 'No importa', value: '0' },
          ],
        },
        {
          key: 'nombre',
          label: 'Tu nombre',
          type: 'text',
          required: true,
          placeholder: 'Ej: Juan Pérez',
        },
        {
          key: 'telefono',
          label: 'WhatsApp',
          type: 'tel',
          required: true,
          placeholder: 'Ej: 3425123456',
          validation: (value) => {
            if (!/^\d{10,15}$/.test(value.replace(/\s/g, ''))) {
              return 'Ingresa un número de teléfono válido'
            }
            return null
          },
        },
        {
          key: 'email',
          label: 'Email (opcional)',
          type: 'email',
          required: false,
          placeholder: 'tu@email.com',
        },
      ]

    case 'COMPRAR':
      return [
        {
          key: 'zona',
          label: '¿En qué zona buscas?',
          type: 'select',
          required: true,
          options: [], // Se carga dinámicamente
        },
        {
          key: 'zona_otro',
          label: 'Especifica la zona',
          type: 'text',
          required: true,
          conditional: (data) => data.zona === 'otro',
        },
        {
          key: 'tipo',
          label: '¿Qué tipo de propiedad?',
          type: 'select',
          required: true,
          options: propertyTypes,
        },
        {
          key: 'presupuesto_min',
          label: 'Presupuesto mínimo (ARS)',
          type: 'number',
          required: true,
          placeholder: 'Ej: 50000',
        },
        {
          key: 'presupuesto_max',
          label: 'Presupuesto máximo (ARS)',
          type: 'number',
          required: true,
          placeholder: 'Ej: 100000',
          validation: (value, formData) => {
            const min = parseFloat(formData.presupuesto_min || '0')
            const max = parseFloat(value || '0')
            if (max < min) return 'El máximo debe ser mayor al mínimo'
            return null
          },
        },
        {
          key: 'dormitorios',
          label: '¿Cuántos dormitorios?',
          type: 'select',
          required: false,
          options: [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4+', value: '4' },
            { label: 'No importa', value: '0' },
          ],
        },
        {
          key: 'nombre',
          label: 'Tu nombre',
          type: 'text',
          required: true,
          placeholder: 'Ej: Juan Pérez',
        },
        {
          key: 'telefono',
          label: 'WhatsApp',
          type: 'tel',
          required: true,
          placeholder: 'Ej: 3425123456',
        },
        {
          key: 'email',
          label: 'Email (opcional)',
          type: 'email',
          required: false,
          placeholder: 'tu@email.com',
        },
      ]

    case 'VENDER':
    case 'TASACION':
      return [
        {
          key: 'direccion',
          label: 'Dirección de la propiedad',
          type: 'text',
          required: true,
          placeholder: 'Ej: San Martín 1234',
        },
        {
          key: 'tipo',
          label: 'Tipo de propiedad',
          type: 'select',
          required: true,
          options: propertyTypes,
        },
        {
          key: 'm2',
          label: 'Metros cuadrados',
          type: 'number',
          required: false,
          placeholder: 'Ej: 80',
        },
        {
          key: 'estado',
          label: 'Estado de la propiedad',
          type: 'select',
          required: true,
          options: conditions,
        },
        {
          key: 'nombre',
          label: 'Tu nombre',
          type: 'text',
          required: true,
          placeholder: 'Ej: Juan Pérez',
        },
        {
          key: 'telefono',
          label: 'WhatsApp',
          type: 'tel',
          required: true,
          placeholder: 'Ej: 3425123456',
        },
        {
          key: 'email',
          label: 'Email (opcional)',
          type: 'email',
          required: false,
          placeholder: 'tu@email.com',
        },
      ]

    case 'CONTACTO':
      return [
        {
          key: 'nombre',
          label: 'Tu nombre',
          type: 'text',
          required: true,
          placeholder: 'Ej: Juan Pérez',
        },
        {
          key: 'telefono',
          label: 'WhatsApp',
          type: 'tel',
          required: true,
          placeholder: 'Ej: 3425123456',
        },
        {
          key: 'mensaje',
          label: 'Mensaje (opcional)',
          type: 'textarea',
          required: false,
          placeholder: '¿En qué podemos ayudarte?',
        },
      ]

    default:
      return []
  }
}


