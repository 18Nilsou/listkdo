'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

interface SecretSanta {
  id: string
  title: string
  description: string | null
  deadline: string
  maxAmount: number | null
  status: string
  createdAt: string
  _count?: {
    participants: number
    invitations: number
  }
  creator?: {
    nickname: string
  }
}

interface Invitation {
  id: string
  token: string
  secretSanta: {
    id: string
    title: string
    description: string | null
    deadline: string
    creator: {
      nickname: string
    }
  }
}

export default function SecretSantaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [createdSecretSantas, setCreatedSecretSantas] = useState<SecretSanta[]>([])
  const [participatingSecretSantas, setParticipatingSecretSantas] = useState<SecretSanta[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      loadSecretSantas()
    }
  }, [status, router])

  const loadSecretSantas = async () => {
    try {
      const res = await fetch('/api/secret-santa')
      if (res.ok) {
        const data = await res.json()
        setCreatedSecretSantas(data.created)
        setParticipatingSecretSantas(data.participating)
        setInvitations(data.invitations)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">En attente</span>
      case 'ACTIVE':
        return <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">Actif</span>
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Terminé</span>
      default:
        return null
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-3xl">🎁</span>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ListKdo</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-gray-700 dark:text-gray-300">Bonjour, {session?.user?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🎅 Secret Santa</h2>
          <Link
            href="/secret-santa/new"
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-semibold"
          >
            + Créer un Secret Santa
          </Link>
        </div>

        {/* Invitations en attente */}
        {invitations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📬 Invitations en attente</h3>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{invitation.secretSanta.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Invité par <strong>{invitation.secretSanta.creator.nickname}</strong>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        📅 Date limite : {new Date(invitation.secretSanta.deadline).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Link
                      href={`/secret-santa/join/${invitation.token}`}
                      className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                    >
                      Voir l'invitation
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secret Santas créés */}
        {createdSecretSantas.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mes Secret Santas</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdSecretSantas.map((ss) => (
                <Link
                  key={ss.id}
                  href={`/secret-santa/${ss.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{ss.title}</h4>
                    {getStatusBadge(ss.status)}
                  </div>
                  {ss.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{ss.description}</p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>📅 {new Date(ss.deadline).toLocaleDateString('fr-FR')}</p>
                    {ss.maxAmount && <p>💰 Budget : {ss.maxAmount}€</p>}
                    <p>👥 {ss._count?.participants || 0} participant(s)</p>
                    {ss.status === 'DRAFT' && ss._count && ss._count.invitations > 0 && (
                      <p className="text-yellow-600 dark:text-yellow-400">
                        📬 {ss._count.invitations} invitation(s) en attente
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Secret Santas où je participe */}
        {participatingSecretSantas.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Je participe</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participatingSecretSantas.map((ss) => (
                <Link
                  key={ss.id}
                  href={`/secret-santa/${ss.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{ss.title}</h4>
                    {getStatusBadge(ss.status)}
                  </div>
                  {ss.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{ss.description}</p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>👤 Créé par {ss.creator?.nickname}</p>
                    <p>📅 {new Date(ss.deadline).toLocaleDateString('fr-FR')}</p>
                    {ss.maxAmount && <p>💰 Budget : {ss.maxAmount}€</p>}
                    <p>👥 {ss._count?.participants || 0} participant(s)</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Message si aucun Secret Santa */}
        {createdSecretSantas.length === 0 && participatingSecretSantas.length === 0 && invitations.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎅</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun Secret Santa pour le moment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Créez votre premier Secret Santa et invitez vos amis !
            </p>
            <Link
              href="/secret-santa/new"
              className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-semibold"
            >
              Créer un Secret Santa
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
