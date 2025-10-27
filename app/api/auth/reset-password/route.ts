import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { validatePassword } from '@/lib/password-validator'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    // Valider le mot de passe
    const validation = validatePassword(password)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Hacher le token reçu pour le comparer
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Trouver l'utilisateur avec ce token haché
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date() // Token non expiré
        }
      }
    })

    if (!user) {
      // Log de sécurité pour tentatives avec token invalide
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      console.log(`[SECURITY] Invalid reset token attempt from IP: ${ip}`)
      
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(password, 12)

    // Mettre à jour le mot de passe et INVALIDER le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })

    // Log de sécurité
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    console.log(`[SECURITY] Password successfully reset for user: ${user.email} from IP: ${ip}`)

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}
