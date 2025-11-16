import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get all users except the current user, with count of their public lists
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
      },
      select: {
        id: true,
        nickname: true,
        _count: {
          select: {
            lists: {
              where: { isPublic: true },
            },
          },
        },
      },
      orderBy: { nickname: 'asc' },
    })

    // Transform the data to include publicListsCount
    const usersWithCount = users.map((user) => ({
      id: user.id,
      nickname: user.nickname,
      publicListsCount: user._count.lists,
    }))

    return NextResponse.json({ users: usersWithCount })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des utilisateurs' },
      { status: 500 }
    )
  }
}
