'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function NewSecretSantaPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/secret-santa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          deadline,
          maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création')
        setLoading(false)
        return
      }

      router.push(`/secret-santa/${data.secretSanta.id}`)
    } catch (error) {
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  // Date minimum = aujourd'hui
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/secret-santa" className="flex items-center space-x-2">
            <span className="text-3xl">🎅</span>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Secret Santa</h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🎅 Créer un Secret Santa
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                placeholder="Ex: Secret Santa Noël 2025"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optionnel)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                placeholder="Quelques détails sur cet événement..."
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de l'échange *
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Date à laquelle vous échangerez les cadeaux
              </p>
            </div>

            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget maximum suggéré (€)
              </label>
              <input
                id="maxAmount"
                type="number"
                step="0.01"
                min="0"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                placeholder="Ex: 25.00"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Montant indicatif pour guider les participants
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">ℹ️ Comment ça marche ?</h3>
              <ul className="text-sm text-indigo-800 dark:text-indigo-300 space-y-1">
                <li>• Vous serez automatiquement ajouté comme participant</li>
                <li>• Invitez des amis par email (minimum 3 participants au total)</li>
                <li>• Une fois prêt, lancez l'attribution pour assigner les binômes</li>
                <li>• Chaque participant découvrira à qui il doit offrir un cadeau</li>
                <li>• Les attributions restent secrètes jusqu'au jour J ! 🎁</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer le Secret Santa'}
              </button>
              <Link
                href="/secret-santa"
                className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
