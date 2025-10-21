import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; giftId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que la liste appartient à l'utilisateur
    const list = await prisma.list.findUnique({
      where: { id: params.id }
    })

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { description, links, priority } = body

    const updatedGift = await prisma.gift.update({
      where: { id: params.giftId },
      data: {
        description: description || null,
        links: links || null,
        priority,
      }
    })

    return NextResponse.json({ gift: updatedGift })
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
  { params }: { params: { id: string; giftId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier que la liste appartient à l'utilisateur
    const list = await prisma.list.findUnique({
      where: { id: params.id }
    })

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await prisma.gift.delete({
      where: { id: params.giftId }
    })

    return NextResponse.json({ message: 'Cadeau supprimé' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
