import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { userId } = params

    // Get user with their public lists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nickname: true,
        lists: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            shareToken: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      nickname: user.nickname,
      publicLists: user.lists,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement du profil' },
      { status: 500 }
    )
  }
}
