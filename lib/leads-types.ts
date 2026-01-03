// Tipos TypeScript para el sistema de leads/wizard

export type FlowType = 'ALQUILAR' | 'COMPRAR' | 'VENDER' | 'TASACION' | 'CONTACTO'
export type UserType = 'buyer' | 'seller'
export type LeadStatus = 'draft' | 'new' | 'contacted' | 'qualified' | 'closed' | 'discarded'
export type UserRole = 'market_admin' | 'tenant_admin' | 'tenant_agent' | 'user'
export type SourceType = 
  | 'web:home' 
  | 'web:property' 
  | 'web:landing' 
  | 'web:inmobiliaria'
  | 'ads' 
  | 'whatsapp'
  | 'other'

export interface Tenant {
  id: number
  name: string
  slug: string
  email?: string
  whatsapp?: string
  logo_url?: string
  domain?: string
  active: boolean
  created_at: Date
  updated_at: Date
}

export interface Lead {
  id: number
  tenant_id: number
  property_id?: number
  flow_type: FlowType
  user_type: UserType
  source: string
  status: LeadStatus
  
  // Contacto
  name?: string
  email?: string
  whatsapp?: string
  
  // Datos del formulario
  zone?: string
  property_type?: string
  budget_min?: number
  budget_max?: number
  budget?: number
  bedrooms?: number
  area_m2?: number
  condition?: string
  address?: string
  
  // Metadata
  assigned_to_user_id?: number
  created_at: Date
  updated_at: Date
  submitted_at?: Date
}

export interface LeadStep {
  id: number
  lead_id: number
  step_key: string
  value: string
  created_at: Date
  updated_at: Date
}

export interface Notification {
  id: number
  tenant_id: number
  user_id?: number
  type: string
  payload?: any
  read_at?: Date
  created_at: Date
}

export interface WizardStep {
  key: string
  label: string
  type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea'
  required?: boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  validation?: (value: any, formData?: any) => string | null
  conditional?: (formData: any) => boolean
}

export interface WizardFormData {
  [key: string]: any
}

export interface InitLeadRequest {
  tenant_id?: number
  property_id?: number
  flow_type: FlowType
  source: SourceType
}

export interface SaveStepRequest {
  step_key: string
  value: any
}

export interface SubmitLeadRequest {
  // Todos los datos del formulario
  [key: string]: any
}

