import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/lib/email'

// POST - Envoyer des invitations
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
        creator: true,
      },
    })

    if (!secretSanta) {
      return NextResponse.json({ error: 'Secret Santa non trouvé' }, { status: 404 })
    }

    if (secretSanta.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Seul le créateur peut envoyer des invitations' }, { status: 403 })
    }

    if (secretSanta.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Impossible d\'inviter après le lancement' }, { status: 400 })
    }

    const body = await req.json()
    const { emails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Liste d\'emails requise' }, { status: 400 })
    }

    const invitations = []

    for (const email of emails) {
      // Vérifier si l'utilisateur existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      // Vérifier si déjà participant
      if (existingUser) {
        const alreadyParticipant = await prisma.secretSantaParticipant.findUnique({
          where: {
            secretSantaId_userId: {
              secretSantaId: params.id,
              userId: existingUser.id,
            },
          },
        })

        if (alreadyParticipant) {
          continue // Passer au suivant
        }
      }

      // Vérifier si invitation déjà envoyée
      const existingInvitation = await prisma.secretSantaInvitation.findUnique({
        where: {
          secretSantaId_email: {
            secretSantaId: params.id,
            email,
          },
        },
      })

      if (existingInvitation && existingInvitation.status === 'PENDING') {
        continue // Passer au suivant
      }

      // Créer l'invitation
      const token = nanoid(32)
      const invitation = await prisma.secretSantaInvitation.create({
        data: {
          email,
          token,
          secretSantaId: params.id,
          senderId: session.user.id,
          receiverId: existingUser?.id,
        },
      })

      invitations.push(invitation)

      // Envoyer l'email
      const joinUrl = `${process.env.NEXTAUTH_URL}/secret-santa/join/${token}`
      
      await sendEmail({
        to: email,
        subject: `🎅 Invitation Secret Santa : ${secretSanta.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">🎅 Invitation Secret Santa</h2>
            <p>Bonjour !</p>
            <p><strong>${secretSanta.creator.nickname}</strong> vous invite à participer au Secret Santa <strong>"${secretSanta.title}"</strong>.</p>
            
            ${secretSanta.description ? `<p>${secretSanta.description}</p>` : ''}
            
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>📅 Date limite :</strong> ${new Date(secretSanta.deadline).toLocaleDateString('fr-FR')}</p>
              ${secretSanta.maxAmount ? `<p style="margin: 5px 0;"><strong>💰 Budget suggéré :</strong> ${secretSanta.maxAmount}€</p>` : ''}
            </div>

            <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${joinUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;
                        font-weight: bold;">
                Rejoindre le Secret Santa
              </a>
            </div>

            ${!existingUser ? `
              <p style="color: #6B7280; font-size: 14px;">
                💡 Vous devrez créer un compte (gratuit) pour participer.
              </p>
            ` : ''}

            <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <a href="${joinUrl}" style="color: #4F46E5;">${joinUrl}</a>
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({
      message: `${invitations.length} invitation(s) envoyée(s)`,
      invitations,
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
