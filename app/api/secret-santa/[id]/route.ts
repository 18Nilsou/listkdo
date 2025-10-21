import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Détails d'un Secret Santa
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const secretSanta = await prisma.secretSanta.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                email: true,
              },
            },
            assignedTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        invitations: true,
      },
    })

    if (!secretSanta) {
      return NextResponse.json({ error: 'Secret Santa non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est soit le créateur, soit un participant
    const isCreator = secretSanta.creatorId === session.user.id
    const isParticipant = secretSanta.participants.some(
      (p) => p.userId === session.user.id
    )

    console.log('Secret Santa access check:', {
      secretSantaId: params.id,
      userId: session.user.id,
      isCreator,
      isParticipant,
      participantIds: secretSanta.participants.map(p => p.userId),
    })

    if (!isCreator && !isParticipant) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Si le Secret Santa est actif (attribution lancée), tous les participants (y compris le créateur)
    // ne voient que leur propre attribution
    if (secretSanta.status === 'ACTIVE') {
      const myParticipation = secretSanta.participants.find(
        (p) => p.userId === session.user.id
      )

      return NextResponse.json({
        secretSanta: {
          ...secretSanta,
          participants: secretSanta.participants.map((p) => ({
            ...p,
            assignedTo: p.id === myParticipation?.id ? p.assignedTo : null,
          })),
          invitations: [], // Les participants ne voient pas les invitations
        },
        isCreator,
        myAssignment: myParticipation?.assignedTo,
      })
    }

    // Si le Secret Santa est en brouillon, seul le créateur voit tout
    return NextResponse.json({
      secretSanta,
      isCreator,
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Mettre à jour un Secret Santa
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const secretSanta = await prisma.secretSanta.findUnique({
      where: { id: params.id },
    })

    if (!secretSanta) {
      return NextResponse.json({ error: 'Secret Santa non trouvé' }, { status: 404 })
    }

    if (secretSanta.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Seul le créateur peut modifier' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, deadline, maxAmount } = body

    const updated = await prisma.secretSanta.update({
      where: { id: params.id },
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : undefined,
        maxAmount: maxAmount !== undefined ? (maxAmount ? parseFloat(maxAmount) : null) : undefined,
      },
      include: {
        creator: true,
        participants: {
          include: {
            user: true,
          },
        },
        invitations: true,
      },
    })

    return NextResponse.json({ secretSanta: updated })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un Secret Santa
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const secretSanta = await prisma.secretSanta.findUnique({
      where: { id: params.id },
    })

    if (!secretSanta) {
      return NextResponse.json({ error: 'Secret Santa non trouvé' }, { status: 404 })
    }

    if (secretSanta.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Seul le créateur peut supprimer' }, { status: 403 })
    }

    await prisma.secretSanta.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Secret Santa supprimé' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
