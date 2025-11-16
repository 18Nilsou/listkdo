'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import SearchBar from '@/components/SearchBar'

interface User {
  id: string
  nickname: string
  publicListsCount: number
}

export default function UsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs')
        }
        const data = await res.json()
        setUsers(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

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
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tous les utilisateurs</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Découvrez les profils des autres utilisateurs et leurs listes publiques
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">Aucun autre utilisateur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-3">
                    <span className="text-3xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.nickname}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="mr-2">🌍</span>
                  <span>
                    {user.publicListsCount} {user.publicListsCount > 1 ? 'listes publiques' : 'liste publique'}
                  </span>
                </div>
                
                <div className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  Voir le profil →
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
