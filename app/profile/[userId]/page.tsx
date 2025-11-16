'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import SearchBar from '@/components/SearchBar'

interface PublicList {
  id: string
  title: string
  description: string | null
  shareToken: string
}

interface UserProfile {
  nickname: string
  publicLists: PublicList[]
}

export default function PublicProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${params.userId}`)
        if (!res.ok) {
          throw new Error('Profil non trouvé')
        }
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [params.userId, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center gap-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="text-3xl">🎁</span>
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ListKdo</h1>
              </Link>
              
              {/* Barre de recherche */}
              <div className="flex-1 max-w-2xl">
                <SearchBar />
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300">
                  Bonjour,{' '}
                  <Link 
                    href="/profile" 
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {session?.user?.name} 👤
                  </Link>
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-3xl">🎁</span>
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ListKdo</h1>
            </Link>
            
            {/* Barre de recherche */}
            <div className="flex-1 max-w-2xl">
              <SearchBar />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Bonjour,{' '}
                <Link 
                  href="/profile" 
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {session?.user?.name} 👤
                </Link>
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-4">
              <span className="text-4xl">👤</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.nickname}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Profil public</p>
            </div>
          </div>
        </div>

        {/* Public Lists */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Listes publiques ({profile.publicLists.length})
          </h3>

          {profile.publicLists.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Cet utilisateur n'a pas encore de listes publiques.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.publicLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.shareToken}`}
                  className="block bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg hover:shadow-lg transition-shadow border border-indigo-200 dark:border-gray-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                      {list.title}
                    </h4>
                    <span className="text-2xl ml-2">🌍</span>
                  </div>
                  {list.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {list.description}
                    </p>
                  )}
                  <div className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                    Voir la liste →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            ← Retour
          </button>
        </div>
      </main>
    </div>
  )
}
