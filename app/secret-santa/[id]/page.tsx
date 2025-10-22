'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface User {
  id: string
  nickname: string
  email: string
}

interface Participant {
  id: string
  joinedAt: string
  user: User
  assignedTo?: {
    user: User
  }
}

interface Invitation {
  id: string
  email: string
  status: string
  sentAt: string
}

interface SecretSanta {
  id: string
  title: string
  description: string | null
  deadline: string
  maxAmount: number | null
  status: string
  creator: User
  participants: Participant[]
  invitations: Invitation[]
}

export default function SecretSantaDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [secretSanta, setSecretSanta] = useState<SecretSanta | null>(null)
  const [isCreator, setIsCreator] = useState(false)
  const [myAssignment, setMyAssignment] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pour les invitations
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    loadSecretSanta()
  }, [params.id])

  const loadSecretSanta = async () => {
    try {
      const res = await fetch(`/api/secret-santa/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setSecretSanta(data.secretSanta)
        setIsCreator(data.isCreator)
        setMyAssignment(data.myAssignment)
      } else {
        setError('Secret Santa non trouvé')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleLaunch = async () => {
    if (!confirm('Lancer l\'attribution ? Cette action est irréversible !')) {
      return
    }

    try {
      const res = await fetch(`/api/secret-santa/${params.id}/launch`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('✅ Attribution lancée ! Tous les participants ont été notifiés.')
        loadSecretSanta()
      } else {
        alert(`❌ Erreur: ${data.error}`)
      }
    } catch (error) {
      alert('❌ Erreur lors du lancement')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)

    const emails = inviteEmails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    try {
      const res = await fetch(`/api/secret-santa/${params.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ ${data.message}`)
        setInviteEmails('')
        setShowInviteForm(false)
        loadSecretSanta()
      } else {
        alert(`❌ Erreur: ${data.error}`)
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi des invitations')
    } finally {
      setInviting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce Secret Santa ? Cette action est irréversible !')) {
      return
    }

    try {
      const res = await fetch(`/api/secret-santa/${params.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        alert('❌ Erreur lors de la suppression')
      }
    } catch (error) {
      alert('❌ Erreur lors de la suppression')
    }
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

  if (error || !secretSanta) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-3xl">🎅</span>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Secret Santa</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Infos principales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{secretSanta.title}</h2>
              {!isCreator && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Créé par <strong>{secretSanta.creator.nickname}</strong>
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${
                secretSanta.status === 'DRAFT'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                  : secretSanta.status === 'ACTIVE'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              {secretSanta.status === 'DRAFT' ? 'En préparation' : secretSanta.status === 'ACTIVE' ? 'Actif' : 'Terminé'}
            </span>
          </div>

          {secretSanta.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">{secretSanta.description}</p>
          )}

          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div>📅 Date de l'échange : <strong>{new Date(secretSanta.deadline).toLocaleDateString('fr-FR')}</strong></div>
            {secretSanta.maxAmount && (
              <div>💰 Budget suggéré : <strong>{secretSanta.maxAmount}€</strong></div>
            )}
            <div>👥 Participants : <strong>{secretSanta.participants.length}</strong></div>
          </div>
        </div>

        {/* Vue créateur - uniquement en mode DRAFT */}
        {isCreator && secretSanta.status === 'DRAFT' && (
          <>
            {/* Actions créateur */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                >
                  📧 Inviter des participants
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={secretSanta.participants.length < 3}
                  className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Lancer l'attribution
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition"
                >
                  🗑️ Supprimer
                </button>
              </div>

              {secretSanta.participants.length < 3 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
                  ⚠️ Il faut au moins 3 participants pour lancer l'attribution
                </p>
              )}
            </div>

            {/* Formulaire d'invitation */}
            {showInviteForm && secretSanta.status === 'DRAFT' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Inviter des participants</h3>
                <form onSubmit={handleInvite}>
                  <textarea
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    rows={4}
                    placeholder="Entrez les emails, séparés par des virgules ou des sauts de ligne&#10;exemple@email.com, autre@email.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-3"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={inviting}
                      className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50"
                    >
                      {inviting ? 'Envoi...' : 'Envoyer les invitations'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des participants (sans les attributions) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Participants ({secretSanta.participants.length})
              </h3>
              <div className="space-y-3">
                {secretSanta.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {participant.user.nickname}
                        {participant.user.id === secretSanta.creator.id && (
                          <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                            Créateur
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{participant.user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invitations en attente */}
            {secretSanta.invitations && secretSanta.invitations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Invitations en attente ({secretSanta.invitations.filter((i) => i.status === 'PENDING').length})
                </h3>
                <div className="space-y-2">
                  {secretSanta.invitations
                    .filter((i) => i.status === 'PENDING')
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                      >
                        <span className="text-gray-900 dark:text-white">{invitation.email}</span>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          Envoyé le {new Date(invitation.sentAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Vue participant (aussi pour le créateur une fois lancé) */}
        {(!isCreator || secretSanta.status === 'ACTIVE') && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Votre attribution</h3>
            
            {secretSanta.status === 'DRAFT' ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  ⏳ En attente du lancement de l'attribution
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Le créateur lancera l'attribution une fois tous les participants réunis
                </p>
              </div>
            ) : myAssignment ? (
              <div className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-6 text-center">
                <p className="text-2xl mb-3">🎁</p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">Vous offrez un cadeau à :</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {myAssignment.user.nickname}
                </p>
                {secretSanta.maxAmount && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                    💰 Budget suggéré : {secretSanta.maxAmount}€
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
                  🤫 Chut, c'est un secret !
                </p>
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                Aucune attribution pour le moment
              </p>
            )}

            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Participants :</strong> {secretSanta.participants.length} personne(s)
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
