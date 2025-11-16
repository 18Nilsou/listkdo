import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    // Validation des données
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom du cadeau est requis' }, { status: 400 })
    }

    if (name.length > 200) {
      return NextResponse.json({ error: 'Le nom ne peut pas dépasser 200 caractères' }, { status: 400 })
    }

    if (description && description.length > 2000) {
      return NextResponse.json({ error: 'La description ne peut pas dépasser 2000 caractères' }, { status: 400 })
    }

    const quantityValue = parseInt(quantity) || 1
    if (quantityValue < 1) {
      return NextResponse.json({ error: 'La quantité doit être d\'au moins 1' }, { status: 400 })
    }

    if (quantityValue > 100) {
      return NextResponse.json({ error: 'La quantité ne peut pas dépasser 100' }, { status: 400 })
    }

    const validPriorities = ['FAIBLE', 'MOYEN', 'HAUT', 'TRES_HAUT']
    const priorityValue = validPriorities.includes(priority) ? priority : 'MOYEN'

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
        name: name.trim(),
        description: description?.trim() || null,
        links,
        priority: priorityValue,
        quantity: quantityValue,
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
