'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Gift {
  id: string
  name: string
  description: string | null
  links: string | null
  priority: string
  quantity: number
  reservations: Array<{
    id: string
    quantity: number
    user: {
      nickname: string
    }
  }>
}

interface List {
  id: string
  title: string
  description: string | null
  deadline: string
  isPublic: boolean
  shareToken: string
  gifts: Gift[]
}

export default function ListDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGiftForm, setShowGiftForm] = useState(false)
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null)
  
  // Form state
  const [giftName, setGiftName] = useState('')
  const [giftDescription, setGiftDescription] = useState('')
  const [giftLinks, setGiftLinks] = useState('')
  const [giftPriority, setGiftPriority] = useState('MOYEN')
  const [giftQuantity, setGiftQuantity] = useState(1)

  useEffect(() => {
    loadList()
  }, [params.id])

  const loadList = async () => {
    try {
      const res = await fetch(`/api/lists/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setList(data.list)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`/api/lists/${params.id}/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: giftName,
          description: giftDescription,
          links: giftLinks,
          priority: giftPriority,
          quantity: giftQuantity,
        }),
      })

      if (res.ok) {
        // Reset form
        setGiftName('')
        setGiftDescription('')
        setGiftLinks('')
        setGiftPriority('MOYEN')
        setGiftQuantity(1)
        setShowGiftForm(false)
        
        // Reload list
        loadList()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleEditGift = (gift: Gift) => {
    setEditingGiftId(gift.id)
    setGiftName(gift.name)
    setGiftDescription(gift.description || '')
    setGiftLinks(gift.links || '')
    setGiftPriority(gift.priority)
    setGiftQuantity(gift.quantity)
    setShowGiftForm(true)
  }

  const handleUpdateGift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGiftId) return

    try {
      const res = await fetch(`/api/lists/${params.id}/gifts/${editingGiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: giftDescription,
          links: giftLinks,
          priority: giftPriority,
        }),
      })

      if (res.ok) {
        // Reset form
        setGiftName('')
        setGiftDescription('')
        setGiftLinks('')
        setGiftPriority('MOYEN')
        setGiftQuantity(1)
        setShowGiftForm(false)
        setEditingGiftId(null)
        
        // Reload list
        loadList()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleCancelEdit = () => {
    setGiftName('')
    setGiftDescription('')
    setGiftLinks('')
    setGiftPriority('MOYEN')
    setGiftQuantity(1)
    setShowGiftForm(false)
    setEditingGiftId(null)
  }

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Supprimer ce cadeau ?')) return

    try {
      const res = await fetch(`/api/lists/${params.id}/gifts/${giftId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        loadList()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const copyShareLink = () => {
    if (list) {
      const link = `${window.location.origin}/list/${list.shareToken}`
      navigator.clipboard.writeText(link)
      alert('Lien copié dans le presse-papier !')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!list) {
    return <div>Liste non trouvée</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-3xl">🎁</span>
            <h1 className="text-2xl font-bold text-indigo-600">ListKdo</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* List Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{list.title}</h2>
              {list.description && (
                <p className="text-gray-600 mt-2">{list.description}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded ${list.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {list.isPublic ? 'Public' : 'Privé'}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-gray-600 mb-4">
            <p>📅 Expire le : {new Date(list.deadline).toLocaleDateString('fr-FR')}</p>
            <p>🎁 {list.gifts.length} cadeau(x)</p>
          </div>

          <button
            onClick={copyShareLink}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            📋 Copier le lien de partage
          </button>
        </div>

        {/* Gifts Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Cadeaux</h3>
            {!showGiftForm && (
              <button
                onClick={() => setShowGiftForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                + Ajouter un cadeau
              </button>
            )}
          </div>

          {/* Add/Edit Gift Form */}
          {showGiftForm && (
            <form onSubmit={editingGiftId ? handleUpdateGift : handleAddGift} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-lg mb-4">
                {editingGiftId ? 'Modifier le cadeau' : 'Nouveau cadeau'}
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du cadeau *
                  </label>
                  <input
                    type="text"
                    value={giftName}
                    onChange={(e) => setGiftName(e.target.value)}
                    required
                    disabled={!!editingGiftId}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 ${editingGiftId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Ex: Livre Harry Potter"
                  />
                  {editingGiftId && (
                    <p className="text-xs text-gray-500 mt-1">Le nom ne peut pas être modifié</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={giftDescription}
                    onChange={(e) => setGiftDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Détails supplémentaires..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liens / Lieux (un par ligne)
                  </label>
                  <textarea
                    value={giftLinks}
                    onChange={(e) => setGiftLinks(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://amazon.fr/produit&#10;Fnac Centre-Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={giftPriority}
                    onChange={(e) => setGiftPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="FAIBLE">Faible</option>
                    <option value="MOYEN">Moyen</option>
                    <option value="HAUT">Haut</option>
                    <option value="TRES_HAUT">Très haut</option>
                  </select>
                </div>

                {!editingGiftId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      value={giftQuantity}
                      onChange={(e) => setGiftQuantity(parseInt(e.target.value))}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingGiftId ? 'Enregistrer' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Gifts List */}
          {list.gifts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Aucun cadeau pour le moment. Commencez par en ajouter un !
            </p>
          ) : (
            <div className="space-y-4">
              {list.gifts.map((gift) => {
                return (
                  <div key={gift.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{gift.name}</h4>
                      <div className="flex gap-2 items-center">
                        <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(gift.priority)}`}>
                          {getPriorityLabel(gift.priority)}
                        </span>
                        <button
                          onClick={() => handleEditGift(gift)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteGift(gift.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {gift.description && (
                      <p className="text-gray-600 text-sm mb-2">{gift.description}</p>
                    )}

                    {gift.links && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Où le trouver :</p>
                        {gift.links.split('\n').map((link, idx) => (
                          <div key={idx} className="text-sm text-indigo-600">
                            {link.startsWith('http') ? (
                              <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {link}
                              </a>
                            ) : (
                              <span>{link}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      Quantité : {gift.quantity}
                    </div>
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
