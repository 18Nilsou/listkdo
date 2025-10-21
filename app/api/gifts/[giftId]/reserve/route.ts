import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { giftId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
    }

    // Vérifier que le cadeau existe
    const gift = await prisma.gift.findUnique({
      where: { id: params.giftId },
      include: {
        list: true,
        reservations: true
      }
    })

    if (!gift) {
      return NextResponse.json({ error: 'Cadeau non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire de la liste
    if (gift.list.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas réserver vos propres cadeaux' },
        { status: 403 }
      )
    }

    // Vérifier la disponibilité
    const totalReserved = gift.reservations.reduce((sum, r) => sum + r.quantity, 0)
    const available = gift.quantity - totalReserved

    if (quantity > available) {
      return NextResponse.json(
        { error: `Seulement ${available} disponible(s)` },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà réservé ce cadeau
    const existingReservation = gift.reservations.find(r => r.userId === session.user.id)

    if (existingReservation) {
      // Mettre à jour la réservation existante
      const reservation = await prisma.reservation.update({
        where: { id: existingReservation.id },
        data: {
          quantity: existingReservation.quantity + quantity
        }
      })
      return NextResponse.json({ reservation })
    }

    // Créer une nouvelle réservation
    const reservation = await prisma.reservation.create({
      data: {
        quantity,
        giftId: params.giftId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réservation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { giftId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Trouver et supprimer la réservation
    const reservation = await prisma.reservation.findFirst({
      where: {
        giftId: params.giftId,
        userId: session.user.id
      }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Aucune réservation trouvée' },
        { status: 404 }
      )
    }

    await prisma.reservation.delete({
      where: { id: reservation.id }
    })

    return NextResponse.json({ message: 'Réservation annulée' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    )
  }
}
