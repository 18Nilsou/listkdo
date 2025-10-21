'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface Invitation {
  id: string
  email: string
  token: string
  secretSanta: {
    id: string
    title: string
    description: string | null
    deadline: string
    maxAmount: number | null
    creator: {
      nickname: string
    }
    _count: {
      participants: number
    }
  }
}

export default function JoinSecretSantaPage({ params }: { params: { token: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [params.token])

  const loadInvitation = async () => {
    try {
      const res = await fetch(`/api/secret-santa/join/${params.token}`)
      if (res.ok) {
        const data = await res.json()
        setInvitation(data.invitation)
      } else {
        const data = await res.json()
        setError(data.error || 'Invitation non valide')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (status !== 'authenticated') {
      // Rediriger vers la page de connexion
      router.push(`/auth/login?callbackUrl=/secret-santa/join/${params.token}`)
      return
    }

    setAccepting(true)

    try {
      const res = await fetch(`/api/secret-santa/join/${params.token}`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        // Petit délai pour s'assurer que la base de données est à jour
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push(`/secret-santa/${data.secretSantaId}`)
        router.refresh()
      } else {
        alert(`❌ Erreur: ${data.error}`)
        setAccepting(false)
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'acceptation')
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    if (!confirm('Refuser cette invitation ?')) {
      return
    }

    try {
      const res = await fetch(`/api/secret-santa/join/${params.token}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/secret-santa')
      } else {
        alert('❌ Erreur lors du refus')
      }
    } catch (error) {
      alert('❌ Erreur lors du refus')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-green-500 to-red-500 dark:from-red-900 dark:via-green-900 dark:to-red-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-green-500 to-red-500 dark:from-red-900 dark:via-green-900 dark:to-red-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          
          <div className="text-center">
            <span className="text-6xl mb-4 block">❌</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invitation non valide</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Link
              href="/secret-santa"
              className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-semibold"
            >
              Retour aux Secret Santas
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-green-500 to-red-500 dark:from-red-900 dark:via-green-900 dark:to-red-900">
      <div className="min-h-screen bg-black bg-opacity-20 dark:bg-opacity-40 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="text-center mb-6">
            <span className="text-6xl">🎅</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Invitation Secret Santa</h1>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-900/20 dark:to-green-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {invitation.secretSanta.title}
            </h2>
            
            {invitation.secretSanta.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {invitation.secretSanta.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                👤 Invité par <strong>{invitation.secretSanta.creator.nickname}</strong>
              </p>
              <p>
                📅 Date de l'échange : <strong>{new Date(invitation.secretSanta.deadline).toLocaleDateString('fr-FR')}</strong>
              </p>
              {invitation.secretSanta.maxAmount && (
                <p>
                  💰 Budget suggéré : <strong>{invitation.secretSanta.maxAmount}€</strong>
                </p>
              )}
              <p>
                👥 <strong>{invitation.secretSanta._count.participants}</strong> participant(s) déjà inscrit(s)
              </p>
            </div>
          </div>

          {status === 'unauthenticated' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 Vous devez créer un compte ou vous connecter pour participer
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting
                ? 'Acceptation...'
                : status === 'authenticated'
                ? '✓ Accepter l\'invitation'
                : '→ Se connecter pour accepter'}
            </button>
            
            {status === 'authenticated' && (
              <button
                onClick={handleDecline}
                className="w-full bg-white dark:bg-gray-700 border-2 border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 px-6 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-gray-600 transition font-semibold"
              >
                ✗ Refuser
              </button>
            )}

            {status === 'unauthenticated' && (
              <Link
                href="/auth/register"
                className="block w-full bg-white dark:bg-gray-700 border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 text-center px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition font-semibold"
              >
                Créer un compte gratuitement
              </Link>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            🎁 Participez à l'échange de cadeaux et découvrez à qui vous allez offrir !
          </p>
        </div>
      </div>
    </div>
  )
}
