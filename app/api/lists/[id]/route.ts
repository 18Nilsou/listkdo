import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const list = await prisma.list.findUnique({
      where: { id: params.id },
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

    // Vérifier que l'utilisateur est le propriétaire
    if (list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { title, description, deadline, isPublic } = await request.json()

    const existingList = await prisma.list.findUnique({
      where: { id: params.id }
    })

    if (!existingList) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 })
    }

    if (existingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const list = await prisma.list.update({
      where: { id: params.id },
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : undefined,
        isPublic,
      },
    })

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const existingList = await prisma.list.findUnique({
      where: { id: params.id }
    })

    if (!existingList) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 })
    }

    if (existingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await prisma.list.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Liste supprimée' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
