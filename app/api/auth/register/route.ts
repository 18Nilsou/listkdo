import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/password-validator'

export const dynamic = 'force-dynamic'

// Rate limiting simple pour les inscriptions
const registerAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRegisterRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = registerAttempts.get(ip)
  
  if (!attempt || now - attempt.resetAt > 3600000) { // 1 heure
    registerAttempts.set(ip, { count: 1, resetAt: now })
    return true
  }
  
  if (attempt.count >= 5) { // Max 5 inscriptions par heure par IP
    return false
  }
  
  attempt.count++
  return true
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRegisterRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de tentatives d\'inscription. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    const { email, password, nickname } = await request.json()

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
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

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
      }
    })

    // Log de sécurité
    console.log(`[SECURITY] New user registered: ${email} from IP: ${ip}`)

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
