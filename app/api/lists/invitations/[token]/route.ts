import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les détails d'une invitation
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await prisma.listInvitation.findUnique({
      where: { token: params.token },
      include: {
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
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'invitation' },
      { status: 500 }
    )
  }
}

// PATCH - Accepter ou refuser une invitation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { action } = await request.json()

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      )
    }

    const invitation = await prisma.listInvitation.findUnique({
      where: { token: params.token },
      include: {
        list: true,
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation non trouvée' },
        { status: 404 }
      )
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette invitation a déjà été traitée' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur connecté est bien le destinataire
    if (invitation.receiverId !== session.user.id) {
      // Si pas encore assigné, l'assigner
      if (!invitation.receiverId) {
        await prisma.listInvitation.update({
          where: { id: invitation.id },
          data: { receiverId: session.user.id },
        })
      } else {
        return NextResponse.json(
          { error: 'Cette invitation ne vous est pas destinée' },
          { status: 403 }
        )
      }
    }

    const updatedInvitation = await prisma.listInvitation.update({
      where: { id: invitation.id },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        respondedAt: new Date(),
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            shareToken: true,
          },
        },
      },
    })

    return NextResponse.json({
      message:
        action === 'accept'
          ? 'Invitation acceptée'
          : 'Invitation refusée',
      invitation: updatedInvitation,
    })
  } catch (error) {
    console.error('Erreur lors de la réponse à l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réponse à l\'invitation' },
      { status: 500 }
    )
  }
}
