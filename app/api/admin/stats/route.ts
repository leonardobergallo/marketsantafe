// API route para obtener estadísticas del panel de administración
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requireAdmin, unauthorizedResponse, unauthenticatedResponse } from '@/lib/auth-admin'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    
    if (!admin) {
      return unauthorizedResponse()
    }

    // Obtener estadísticas
    const [usersResult, propertiesResult, listingsResult, activeUsersResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM properties WHERE active = true'),
      pool.query('SELECT COUNT(*) as count FROM listings WHERE active = true'),
      pool.query(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM (
          SELECT user_id FROM listings WHERE active = true
          UNION
          SELECT user_id FROM properties WHERE active = true
        ) active_content
      `),
    ])

    const stats = {
      users: parseInt(usersResult.rows[0]?.count || '0'),
      properties: parseInt(propertiesResult.rows[0]?.count || '0'),
      listings: parseInt(listingsResult.rows[0]?.count || '0'),
      activeUsers: parseInt(activeUsersResult.rows[0]?.count || '0'),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

