'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

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

interface SecretSanta {
  id: string
  title: string
  deadline: string
  status: string
  _count: {
    participants: number
  }
}

interface SecretSantaInvitation {
  id: string
  secretSanta: {
    id: string
    title: string
    deadline: string
  }
}

interface ListInvitation {
  id: string
  token: string
  list: {
    id: string
    title: string
    deadline: string
    shareToken: string
  }
  sender: {
    nickname: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myLists, setMyLists] = useState<List[]>([])
  const [sharedLists, setSharedLists] = useState<List[]>([])
  const [myReservations, setMyReservations] = useState<Reservation[]>([])
  const [secretSantas, setSecretSantas] = useState<SecretSanta[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<SecretSantaInvitation[]>([])
  const [listInvitations, setListInvitations] = useState<ListInvitation[]>([])
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

      // Charger mes Secret Santas
      const secretSantaRes = await fetch('/api/secret-santa')
      if (secretSantaRes.ok) {
        const data = await secretSantaRes.json()
        setSecretSantas([...data.created, ...data.participating])
        setPendingInvitations(data.invitations || [])
      }

      // Charger mes invitations de listes
      const listInvitationsRes = await fetch('/api/lists/invitations/my-invitations')
      if (listInvitationsRes.ok) {
        const data = await listInvitationsRes.json()
        setListInvitations(data.invitations || [])
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

  if (loading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-3xl">🎁</span>
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ListKdo</h1>
            </Link>
          </div>
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
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mes listes</h2>
            <Link
              href="/dashboard/lists/new"
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
            >
              + Nouvelle liste
            </Link>
          </div>

          {myLists.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Vous n'avez pas encore créé de liste</p>
              <Link
                href="/dashboard/lists/new"
                className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
              >
                Créer ma première liste
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLists.map((list) => (
                <div key={list.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{list.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${list.isPublic ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                      {list.isPublic ? 'Public' : 'Privé'}
                    </span>
                  </div>
                  
                  {list.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{list.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <p>📅 Expire le : {new Date(list.deadline).toLocaleDateString('fr-FR')}</p>
                    <p>🎁 {list._count.gifts} cadeau(x)</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/lists/${list.id}`}
                      className="flex-1 text-center bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                    >
                      Gérer
                    </Link>
                    <button
                      onClick={() => copyShareLink(list.shareToken)}
                      className="flex-1 bg-green-600 dark:bg-green-700 text-white px-3 py-2 rounded text-sm hover:bg-green-700 dark:hover:bg-green-600 transition"
                    >
                      Partager
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="bg-red-600 dark:bg-red-700 text-white px-3 py-2 rounded text-sm hover:bg-red-700 dark:hover:bg-red-600 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invitations de Listes en attente */}
        {listInvitations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Invitations de listes en attente ({listInvitations.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6 border-2 border-blue-200 dark:border-blue-700">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      📋 {invitation.list.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Invité par : <strong>{invitation.sender.nickname}</strong>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      📅 Expire le : {new Date(invitation.list.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Link
                    href={`/list/join/${invitation.token}`}
                    className="block w-full bg-blue-600 dark:bg-blue-500 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                  >
                    Voir l'invitation
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mes Réservations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mes réservations</h2>
          
          {myReservations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300">Vous n'avez pas encore réservé de cadeau</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cadeau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Liste</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {myReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {reservation.gift.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {reservation.gift.list.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {reservation.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/list/${reservation.gift.list.shareToken}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
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

        {/* Secret Santa */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Secret Santa 🎅</h2>
            <Link
              href="/secret-santa/new"
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
            >
              + Nouveau Secret Santa
            </Link>
          </div>

          {secretSantas.length === 0 && pendingInvitations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Vous n'avez pas encore créé de Secret Santa</p>
              <Link
                href="/secret-santa/new"
                className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
              >
                Créer mon premier Secret Santa
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Invitations en attente */}
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{invitation.secretSanta.title}</h3>
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                      Invitation
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <p>📅 {new Date(invitation.secretSanta.deadline).toLocaleDateString('fr-FR')}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/secret-santa/${invitation.secretSanta.id}`}
                      className="flex-1 text-center bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                    >
                      Répondre
                    </Link>
                  </div>
                </div>
              ))}

              {/* Secret Santas actifs */}
              {secretSantas
                .filter(ss => ss.status === 'ACTIVE')
                .map((ss) => {
                  const daysUntilDeadline = Math.ceil((new Date(ss.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={ss.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{ss.title}</h3>
                        <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                          Actif
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <p>📅 {new Date(ss.deadline).toLocaleDateString('fr-FR')}</p>
                        <p>👥 {ss._count.participants} participant(s)</p>
                        {daysUntilDeadline <= 7 && (
                          <p className="text-red-600 dark:text-red-400 font-bold mt-1">
                            ⏰ {daysUntilDeadline > 0 ? `Dans ${daysUntilDeadline} jour(s)` : 'Aujourd\'hui !'}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/secret-santa/${ss.id}`}
                          className="flex-1 text-center bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  )
                })}

              {/* Secret Santas en draft */}
              {secretSantas
                .filter(ss => ss.status === 'DRAFT')
                .map((ss) => (
                  <div key={ss.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{ss.title}</h3>
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        Brouillon
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <p>� {new Date(ss.deadline).toLocaleDateString('fr-FR')}</p>
                      <p>� {ss._count.participants} participant(s)</p>
                      {ss._count.participants < 3 && (
                        <p className="text-orange-600 dark:text-orange-400 mt-1">
                          ⚠️ Min. 3 participants requis
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/secret-santa/${ss.id}`}
                        className="flex-1 text-center bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                      >
                        Configurer
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
