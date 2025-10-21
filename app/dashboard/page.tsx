'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface List {
  id: string
  title: string
  description: string | null
  deadline: string
  isPublic: boolean
  shareToken: string
  _count: {
    gifts: number
  }
}

interface Reservation {
  id: string
  quantity: number
  gift: {
    id: string
    name: string
    list: {
      id: string
      title: string
      shareToken: string
    }
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myLists, setMyLists] = useState<List[]>([])
  const [sharedLists, setSharedLists] = useState<List[]>([])
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])

  const loadData = async () => {
    try {
      // Charger mes listes
      const listsRes = await fetch('/api/lists/my-lists')
      if (listsRes.ok) {
        const data = await listsRes.json()
        setMyLists(data.lists || [])
      }

      // Charger mes réservations
      const reservationsRes = await fetch('/api/reservations/my-reservations')
      if (reservationsRes.ok) {
        const data = await reservationsRes.json()
        setMyReservations(data.reservations || [])
      }

      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setLoading(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      return
    }

    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMyLists(myLists.filter(list => list.id !== listId))
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const copyShareLink = (shareToken: string) => {
    const link = `${window.location.origin}/list/${shareToken}`
    navigator.clipboard.writeText(link)
    alert('Lien copié dans le presse-papier !')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-3xl">🎁</span>
              <h1 className="text-2xl font-bold text-indigo-600">ListKdo</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Bonjour, {session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mes Listes */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes listes</h2>
            <Link
              href="/dashboard/lists/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Nouvelle liste
            </Link>
          </div>

          {myLists.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">Vous n'avez pas encore créé de liste</p>
              <Link
                href="/dashboard/lists/new"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Créer ma première liste
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLists.map((list) => (
                <div key={list.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{list.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${list.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {list.isPublic ? 'Public' : 'Privé'}
                    </span>
                  </div>
                  
                  {list.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{list.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <p>📅 Expire le : {new Date(list.deadline).toLocaleDateString('fr-FR')}</p>
                    <p>🎁 {list._count.gifts} cadeau(x)</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/lists/${list.id}`}
                      className="flex-1 text-center bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition"
                    >
                      Gérer
                    </Link>
                    <button
                      onClick={() => copyShareLink(list.shareToken)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition"
                    >
                      Partager
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mes Réservations */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes réservations</h2>
          
          {myReservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">Vous n'avez pas encore réservé de cadeau</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadeau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liste</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.gift.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.gift.list.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/list/${reservation.gift.list.shareToken}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Voir la liste
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
