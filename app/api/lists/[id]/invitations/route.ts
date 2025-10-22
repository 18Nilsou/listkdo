import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET - Récupérer les invitations d'une liste
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const list = await prisma.list.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const invitations = await prisma.listInvitation.findMany({
      where: { listId: params.id },
      include: {
        receiver: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des invitations' },
      { status: 500 }
    )
  }
}

// POST - Envoyer des invitations
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { emails } = await request.json()

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Veuillez fournir au moins un email' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est bien le créateur de la liste
    const list = await prisma.list.findUnique({
      where: { id: params.id },
      select: { 
        userId: true,
        title: true,
      },
    })

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const invitations = []

    for (const email of emails) {
      // Vérifier si l'invitation existe déjà
      const existingInvitation = await prisma.listInvitation.findUnique({
        where: {
          listId_email: {
            listId: params.id,
            email: email.toLowerCase(),
          },
        },
      })

      if (existingInvitation) {
        continue // Ignorer si déjà invité
      }

      // Chercher si l'utilisateur existe
      const receiver = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      // Créer l'invitation
      const token = crypto.randomBytes(32).toString('hex')
      const invitation = await prisma.listInvitation.create({
        data: {
          email: email.toLowerCase(),
          token,
          listId: params.id,
          senderId: session.user.id,
          receiverId: receiver?.id,
        },
        include: {
          receiver: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
      })

      invitations.push(invitation)

      // TODO: Envoyer un email de notification
      // await sendEmail({
      //   to: email,
      //   subject: `Invitation à consulter la liste "${list.title}"`,
      //   html: `Vous avez été invité(e) à consulter une liste de cadeaux...`,
      // })
    }

    return NextResponse.json({
      message: `${invitations.length} invitation(s) envoyée(s)`,
      invitations,
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi des invitations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des invitations' },
      { status: 500 }
    )
  }
}
