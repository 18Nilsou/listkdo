import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cette route peut être appelée par un cron job externe
// Ou configurée avec Vercel Cron / AWS EventBridge
export async function GET() {
  try {
    const now = new Date()

    const result = await prisma.list.deleteMany({
      where: {
        deadline: {
          lt: now
        }
      }
    })

    return NextResponse.json({
      message: 'Nettoyage effectué',
      deleted: result.count
    })
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error)
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage' },
      { status: 500 }
    )
  }
}
