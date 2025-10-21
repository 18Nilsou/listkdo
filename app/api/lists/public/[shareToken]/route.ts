import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const list = await prisma.list.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        gifts: {
          include: {
            reservations: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!list) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 })
    }

    // Vérifier si la liste est publique ou si l'utilisateur y a accès
    if (!list.isPublic && list.userId !== session.user.id) {
      // Pour le MVP, on accepte tout utilisateur authentifié
      // Dans une version future, on pourrait vérifier une table d'invitations
    }

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
