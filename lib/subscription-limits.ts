// Límites por tipo de plan
export const PLAN_LIMITS = {
  free: {
    listings: 5,
    properties: 3,
    store_products: 10,
    featured: false,
  },
  'individual-premium': {
    listings: -1, // ilimitado
    properties: 5,
    store_products: 0,
    featured: true,
  },
  'properties-premium': {
    listings: 5,
    properties: 10,
    store_products: 0,
    featured: true,
  },
  'business-basic': {
    listings: -1,
    properties: 0,
    store_products: 50,
    featured: false,
  },
  'business-pro': {
    listings: -1,
    properties: -1,
    store_products: -1,
    featured: true,
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

export function getPlanLimits(planType: string) {
  return PLAN_LIMITS[planType as PlanType] || PLAN_LIMITS.free
}

export function isUnlimited(value: number) {
  return value === -1
}




