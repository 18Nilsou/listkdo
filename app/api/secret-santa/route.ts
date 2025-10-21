import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Liste des Secret Santa de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les Secret Santa créés par l'utilisateur
    const createdSecretSantas = await prisma.secretSanta.findMany({
      where: {
        creatorId: session.user.id,
      },
      include: {
        participants: {
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
        invitations: {
          where: {
            status: 'PENDING',
          },
        },
        _count: {
          select: {
            participants: true,
            invitations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Récupérer les Secret Santa auxquels l'utilisateur participe
    const participatingSecretSantas = await prisma.secretSanta.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
        creatorId: {
          not: session.user.id,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
          },
        },
        participants: {
          where: {
            userId: session.user.id,
          },
          include: {
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
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    })

    // Récupérer les invitations en attente
    const pendingInvitations = await prisma.secretSantaInvitation.findMany({
      where: {
        OR: [
          { email: session.user.email },
          { receiverId: session.user.id },
        ],
        status: 'PENDING',
      },
      include: {
        secretSanta: {
          include: {
            creator: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      created: createdSecretSantas,
      participating: participatingSecretSantas,
      invitations: pendingInvitations,
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau Secret Santa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, deadline, maxAmount } = body

    if (!title || !deadline) {
      return NextResponse.json(
        { error: 'Titre et date limite requis' },
        { status: 400 }
      )
    }

    const secretSanta = await prisma.secretSanta.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        creatorId: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    })

    // Ajouter automatiquement le créateur comme participant
    await prisma.secretSantaParticipant.create({
      data: {
        secretSantaId: secretSanta.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ secretSanta }, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
