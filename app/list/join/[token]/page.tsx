'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Invitation {
  id: string
  email: string
  status: string
  list: {
    id: string
    title: string
    description: string | null
    deadline: string
  }
  sender: {
    nickname: string
    email: string
  }
}

export default function JoinListPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadInvitation()
  }, [params.token])

  const loadInvitation = async () => {
    try {
      const res = await fetch(`/api/lists/invitations/${params.token}`)
      if (res.ok) {
        const data = await res.json()
        setInvitation(data.invitation)
      } else {
        setError('Invitation non trouvée')
      }
    } catch (err) {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (action: 'accept' | 'decline') => {
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=/list/join/${params.token}`)
      return
    }

    setProcessing(true)
    setError('')

    try {
      const res = await fetch(`/api/lists/invitations/${params.token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (res.ok) {
        if (action === 'accept') {
          // Rediriger vers la liste
          router.push(`/list/${data.invitation.list.shareToken}`)
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Erreur lors de la réponse')
      }
    } catch (err) {
      setError('Erreur lors de la réponse')
    } finally {
      setProcessing(false)
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

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400 text-xl mb-4">{error || 'Invitation non trouvée'}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  if (invitation.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-gray-700 dark:text-gray-300 text-xl mb-4">
            {invitation.status === 'ACCEPTED'
              ? 'Vous avez déjà accepté cette invitation'
              : 'Vous avez décliné cette invitation'}
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invitation à consulter une liste
          </h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              {invitation.list.title}
            </h2>
            {invitation.list.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-2">{invitation.list.description}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Invité par : {invitation.sender.nickname}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📅 À offrir avant le : {new Date(invitation.list.deadline).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              Vous devez être connecté pour accepter cette invitation
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/login?callbackUrl=/list/join/${params.token}`}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition text-center"
            >
              Se connecter
            </Link>
            <Link
              href={`/register?callbackUrl=/list/join/${params.token}`}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg transition text-center"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          📋 Invitation à consulter une liste
        </h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            {invitation.list.title}
          </h2>
          {invitation.list.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-3">{invitation.list.description}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Invité par : <strong>{invitation.sender.nickname}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            📅 À offrir avant le : {new Date(invitation.list.deadline).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => handleResponse('accept')}
            disabled={processing}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {processing ? 'Traitement...' : '✓ Accepter'}
          </button>
          <button
            onClick={() => handleResponse('decline')}
            disabled={processing}
            className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {processing ? 'Traitement...' : '✗ Refuser'}
          </button>
        </div>

        <Link
          href="/dashboard"
          className="block text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mt-6 transition"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
