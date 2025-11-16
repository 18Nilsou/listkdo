'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MyList {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  deadline: string
  _count: { gifts: number }
}

interface PublicList {
  id: string
  title: string
  description: string | null
  shareToken: string
  deadline: string
  user: {
    id: string
    nickname: string
  }
  _count: { gifts: number }
}

interface User {
  id: string
  nickname: string
  _count: {
    lists: number
  }
}

interface SearchResults {
  myLists: MyList[]
  publicLists: PublicList[]
  users: User[]
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults(null)
        setIsOpen(false)
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Erreur de recherche:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const hasResults = results && (
    results.myLists.length > 0 || 
    results.publicLists.length > 0 || 
    results.users.length > 0
  )

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une liste ou un profil..."
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown de résultats */}
      {isOpen && results && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {!hasResults && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun résultat trouvé
            </div>
          )}

          {/* Mes listes */}
          {results.myLists.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase">
                Mes listes
              </div>
              {results.myLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/dashboard/lists/${list.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {list.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {list._count.gifts} cadeau(x) • {list.isPublic ? '🌍 Public' : '🔒 Privé'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Listes publiques */}
          {results.publicLists.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase">
                Listes publiques
              </div>
              {results.publicLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.shareToken}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {list.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Par {list.user.nickname} • {list._count.gifts} cadeau(x)
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Utilisateurs */}
          {results.users.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase">
                Utilisateurs
              </div>
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.nickname}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user._count.lists} liste(s) publique(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
