'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface Reservation {
  id: string
  quantity: number
  user: {
    id: string
    nickname: string
  }
}

interface Gift {
  id: string
  name: string
  description: string | null
  links: string | null
  priority: string
  quantity: number
  reservations: Reservation[]
}

interface List {
  id: string
  title: string
  description: string | null
  deadline: string
  isPublic: boolean
  userId: string
  gifts: Gift[]
}

export default function PublicListPage({ params }: { params: { shareToken: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reserveQuantities, setReserveQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    if (status === 'authenticated') {
      loadList()
    } else if (status === 'unauthenticated') {
      // Allow unauthenticated users to see the list preview
      loadList()
    }
  }, [status, params.shareToken])

  const loadList = async () => {
    try {
      const res = await fetch(`/api/lists/public/${params.shareToken}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Liste non trouvée')
        setLoading(false)
        return
      }

      setList(data.list)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors du chargement')
      setLoading(false)
    }
  }

  const handleReserve = async (giftId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/gifts/${giftId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la réservation')
        return
      }

      alert('Réservation effectuée avec succès !')
      loadList()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réservation')
    }
  }

  const handleCancelReservation = async (giftId: string) => {
    if (!confirm('Annuler votre réservation ?')) return

    try {
      const res = await fetch(`/api/gifts/${giftId}/reserve`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Réservation annulée')
        loadList()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'FAIBLE': return 'bg-gray-100 text-gray-800'
      case 'MOYEN': return 'bg-blue-100 text-blue-800'
      case 'HAUT': return 'bg-orange-100 text-orange-800'
      case 'TRES_HAUT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'FAIBLE': return 'Faible'
      case 'MOYEN': return 'Moyen'
      case 'HAUT': return 'Haut'
      case 'TRES_HAUT': return 'Très haut'
      default: return priority
    }
  }

  if (loading || status === 'loading') {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!list) {
    return null
  }

  // If not authenticated, show invitation to create account
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        <div className="min-h-screen bg-black bg-opacity-20 dark:bg-opacity-40 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 relative">
            <div className="absolute top-4 right-4">
              <ThemeToggle />
            </div>
            
            <div className="text-center mb-6">
              <span className="text-6xl">🎁</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">ListKdo</h1>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{list.title}</h2>
              {list.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{list.description}</p>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300">
                📅 À offrir avant le : <strong>{new Date(list.deadline).toLocaleDateString('fr-FR')}</strong>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                🎁 <strong>{list.gifts.length}</strong> cadeau(x) dans cette liste
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Pour voir et réserver des cadeaux sur cette liste, vous devez créer un compte ou vous connecter.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/register"
                className="block w-full bg-indigo-600 dark:bg-indigo-500 text-white text-center px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-semibold"
              >
                Créer un compte gratuitement
              </Link>
              <Link
                href="/auth/login"
                className="block w-full bg-white dark:bg-gray-700 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 text-center px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition font-semibold"
              >
                J'ai déjà un compte
              </Link>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              C'est gratuit et ça prend moins d'une minute ! 🚀
            </p>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = session?.user?.id === list.userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-3xl">🎁</span>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ListKdo</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-gray-700 dark:text-gray-300">
              Bonjour,{' '}
              <Link 
                href="/profile" 
                className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
              >
                {session?.user?.name} 👤
              </Link>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* List Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{list.title}</h2>
          {list.description && (
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">{list.description}</p>
          )}
          <p className="text-gray-500 dark:text-gray-400">
            📅 À offrir avant le : {new Date(list.deadline).toLocaleDateString('fr-FR')}
          </p>
          
          {isOwner && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                ℹ️ Vous êtes le propriétaire de cette liste. Vous ne voyez pas qui a réservé quoi.
              </p>
            </div>
          )}
        </div>

        {/* Gifts */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Cadeaux disponibles ({list.gifts.length})</h3>

          {list.gifts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">Aucun cadeau dans cette liste pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {list.gifts.map((gift) => {
                const totalReserved = gift.reservations.reduce((sum, r) => sum + r.quantity, 0)
                const available = gift.quantity - totalReserved
                const myReservation = gift.reservations.find(r => r.user.id === session?.user?.id)
                const otherReservations = gift.reservations.filter(r => r.user.id !== session?.user?.id)

                return (
                  <div key={gift.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{gift.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(gift.priority)}`}>
                        {getPriorityLabel(gift.priority)}
                      </span>
                    </div>

                    {gift.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{gift.description}</p>
                    )}

                    {gift.links && (
                      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Où le trouver :</p>
                        {gift.links.split('\n').map((link, idx) => (
                          <div key={idx} className="text-sm">
                            {link.startsWith('http') ? (
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                              >
                                🔗 {link}
                              </a>
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300">📍 {link}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reservation Status - Hidden for owner */}
                    {!isOwner && (
                      <div className="mb-4">
                        {otherReservations.length > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Réservé par : {otherReservations.map(r => 
                              `${r.user.nickname} (${r.quantity})`
                            ).join(', ')}
                          </div>
                        )}
                        
                        {myReservation && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded mb-2">
                            <p className="text-green-800 dark:text-green-200 font-medium">
                              ✓ Vous avez réservé : {myReservation.quantity}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Available quantity */}
                    <div className="mb-4">
                      <span className={`font-semibold ${available > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {available > 0 ? `${available} disponible(s)` : 'Plus disponible'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                        (sur {gift.quantity})
                      </span>
                    </div>

                    {/* Actions */}
                    {!isOwner && (
                      <div>
                        {myReservation ? (
                          <button
                            onClick={() => handleCancelReservation(gift.id)}
                            className="w-full bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition"
                          >
                            Annuler ma réservation
                          </button>
                        ) : available > 0 ? (
                          <div className="space-y-2">
                            {gift.quantity > 1 && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité :</label>
                                <input
                                  type="number"
                                  min="1"
                                  max={available}
                                  value={reserveQuantities[gift.id] || 1}
                                  onChange={(e) => setReserveQuantities({
                                    ...reserveQuantities,
                                    [gift.id]: Math.min(Math.max(1, parseInt(e.target.value) || 1), available)
                                  })}
                                  className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                />
                              </div>
                            )}
                            <button
                              onClick={() => handleReserve(gift.id, reserveQuantities[gift.id] || 1)}
                              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                            >
                              Réserver {gift.quantity > 1 ? `(${reserveQuantities[gift.id] || 1})` : ''}
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
                          >
                            Indisponible
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
