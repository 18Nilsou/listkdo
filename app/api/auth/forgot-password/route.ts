import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Rate limiting simple (en mémoire, pour production utiliser Redis)
const resetAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = resetAttempts.get(ip)
  
  if (!attempt || now - attempt.resetAt > 3600000) { // 1 heure
    resetAttempts.set(ip, { count: 1, resetAt: now })
    return true
  }
  
  if (attempt.count >= 3) { // Max 3 tentatives par heure
    return false
  }
  
  attempt.count++
  return true
}

export async function POST(request: Request) {
  try {
    // Rate limiting basique
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 1 heure.' },
        { status: 429 }
      )
    }

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
      // Générer un token sécurisé et le hacher
      const resetToken = nanoid(32)
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

      // Sauvegarder le token haché dans la base de données
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: hashedToken, // Stocker le hash, pas le token en clair
          resetTokenExpiry,
        }
      })

      // Envoyer l'email avec le token non haché
      await sendPasswordResetEmail(email, resetToken)
      
      // Log de sécurité (à améliorer avec un vrai système de logging)
      console.log(`[SECURITY] Password reset requested for: ${email} from IP: ${ip}`)
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
