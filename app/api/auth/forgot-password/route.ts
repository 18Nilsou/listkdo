import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
    // On retourne toujours un succès
    if (user) {
      // Générer un token unique
      const resetToken = nanoid(32)
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

      // Sauvegarder le token dans la base de données
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      })

      // Envoyer l'email
      await sendPasswordResetEmail(email, resetToken)
    }

    // Toujours retourner un succès pour ne pas révéler si l'email existe
    return NextResponse.json({
      message: 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.'
    })
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    )
  }
}
