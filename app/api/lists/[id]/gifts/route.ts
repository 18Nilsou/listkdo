import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { name, description, links, priority, quantity } = await request.json()

    // Vérifier que la liste appartient à l'utilisateur
    const list = await prisma.list.findUnique({
      where: { id: params.id }
    })

    if (!list) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 })
    }

    if (list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const gift = await prisma.gift.create({
      data: {
        name,
        description,
        links,
        priority: priority || 'MOYEN',
        quantity: quantity || 1,
        listId: params.id,
      },
    })

    return NextResponse.json({ gift }, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du cadeau' },
      { status: 500 }
    )
  }
}
