import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Algorithme de Secret Santa - attribution aléatoire sans cycle
function assignSecretSanta(participantIds: string[]): Map<string, string> {
  const assignments = new Map<string, string>()
  
  // Créer une copie pour mélanger
  const receivers = [...participantIds]
  
  // Mélanger aléatoirement les receveurs
  for (let i = receivers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[receivers[i], receivers[j]] = [receivers[j], receivers[i]]
  }
  
  // Assigner chaque donneur à un receveur
  // En s'assurant qu'on ne s'assigne pas à soi-même
  for (let i = 0; i < participantIds.length; i++) {
    const giver = participantIds[i]
    let receiver = receivers[i]
    
    // Si on s'est assigné à soi-même, échanger avec le suivant
    if (giver === receiver) {
      const nextIndex = (i + 1) % participantIds.length
      ;[receivers[i], receivers[nextIndex]] = [receivers[nextIndex], receivers[i]]
      receiver = receivers[i]
    }
    
    assignments.set(giver, receiver)
  }
  
  return assignments
}

// POST - Lancer l'attribution Secret Santa
export async function POST(
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
        participants: true,
      },
    })

    if (!secretSanta) {
      return NextResponse.json({ error: 'Secret Santa non trouvé' }, { status: 404 })
    }

    if (secretSanta.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Seul le créateur peut lancer l\'attribution' }, { status: 403 })
    }

    if (secretSanta.status !== 'DRAFT') {
      return NextResponse.json({ error: 'L\'attribution a déjà été lancée' }, { status: 400 })
    }

    if (secretSanta.participants.length < 3) {
      return NextResponse.json({ error: 'Il faut au moins 3 participants' }, { status: 400 })
    }

    // Générer les attributions
    const participantIds = secretSanta.participants.map((p) => p.id)
    const assignments = assignSecretSanta(participantIds)

    // Mettre à jour la base de données avec les attributions
    const updatePromises = Array.from(assignments.entries()).map(([giverId, receiverId]) =>
      prisma.secretSantaParticipant.update({
        where: { id: giverId },
        data: { assignedToId: receiverId },
      })
    )

    await Promise.all(updatePromises)

    // Mettre à jour le statut du Secret Santa
    const updated = await prisma.secretSanta.update({
      where: { id: params.id },
      data: { status: 'ACTIVE' },
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
            assignedTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // TODO: Envoyer des emails de notification à tous les participants

    return NextResponse.json({
      message: 'Attribution lancée avec succès',
      secretSanta: updated,
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
