import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les infos d'une invitation
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await prisma.secretSantaInvitation.findUnique({
      where: { token: params.token },
      include: {
        secretSanta: {
          include: {
            creator: {
              select: {
                nickname: true,
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation déjà utilisée' }, { status: 400 })
    }

    if (invitation.secretSanta.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Ce Secret Santa a déjà été lancé' }, { status: 400 })
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Accepter une invitation
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const invitation = await prisma.secretSantaInvitation.findUnique({
      where: { token: params.token },
      include: {
        secretSanta: true,
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation déjà utilisée' }, { status: 400 })
    }

    if (invitation.secretSanta.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Ce Secret Santa a déjà été lancé' }, { status: 400 })
    }

    // Vérifier si l'utilisateur est déjà participant
    const existingParticipant = await prisma.secretSantaParticipant.findUnique({
      where: {
        secretSantaId_userId: {
          secretSantaId: invitation.secretSantaId,
          userId: session.user.id,
        },
      },
    })

    if (existingParticipant) {
      return NextResponse.json({ error: 'Vous participez déjà à ce Secret Santa' }, { status: 400 })
    }

    // Transaction pour s'assurer que tout est bien enregistré
    await prisma.$transaction([
      // Créer le participant
      prisma.secretSantaParticipant.create({
        data: {
          secretSantaId: invitation.secretSantaId,
          userId: session.user.id,
        },
      }),
      // Mettre à jour l'invitation
      prisma.secretSantaInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          receiverId: session.user.id,
        },
      }),
    ])

    console.log('Participant créé avec succès:', {
      secretSantaId: invitation.secretSantaId,
      userId: session.user.id,
    })

    return NextResponse.json({
      message: 'Vous avez rejoint le Secret Santa !',
      secretSantaId: invitation.secretSantaId,
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Refuser une invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const invitation = await prisma.secretSantaInvitation.findUnique({
      where: { token: params.token },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation déjà utilisée' }, { status: 400 })
    }

    // Mettre à jour l'invitation
    await prisma.secretSantaInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Invitation refusée' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
