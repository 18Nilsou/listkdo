import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        myLists: [],
        publicLists: [],
        users: []
      })
    }

    const searchTerm = query.trim().toLowerCase()

    // Rechercher mes propres listes
    const myLists = await prisma.list.findMany({
      where: {
        userId: session.user.id,
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        deadline: true,
        _count: {
          select: { gifts: true }
        }
      },
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Rechercher les listes publiques des autres utilisateurs
    const publicLists = await prisma.list.findMany({
      where: {
        userId: { not: session.user.id },
        isPublic: true,
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        shareToken: true,
        deadline: true,
        user: {
          select: {
            id: true,
            nickname: true
          }
        },
        _count: {
          select: { gifts: true }
        }
      },
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Rechercher les utilisateurs par pseudo
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        nickname: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nickname: true,
        _count: {
          select: {
            lists: {
              where: { isPublic: true }
            }
          }
        }
      },
      take: 5,
      orderBy: {
        nickname: 'asc'
      }
    })

    return NextResponse.json({
      myLists,
      publicLists,
      users
    })
  } catch (error) {
    console.error('Erreur de recherche:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
