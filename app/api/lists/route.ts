import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { title, description, deadline, isPublic } = await request.json()

    if (!title || !deadline) {
      return NextResponse.json(
        { error: 'Titre et date limite requis' },
        { status: 400 }
      )
    }

    const list = await prisma.list.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        isPublic: isPublic || false,
        shareToken: nanoid(10),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ list }, { status: 201 })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la liste' },
      { status: 500 }
    )
  }
}
