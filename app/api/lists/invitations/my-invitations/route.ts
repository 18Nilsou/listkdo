import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer mes invitations en attente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const invitations = await prisma.listInvitation.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING',
      },
      select: {
        id: true,
        token: true,
        list: {
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
          },
        },
        sender: {
          select: {
            nickname: true,
            email: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    )
  }
}
