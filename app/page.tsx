'use client'

import Link from 'next/link'
import ClientThemeToggle from '@/components/ClientThemeToggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🎁</span>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ListKdo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ClientThemeToggle />
            <Link 
              href="/auth/login" 
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              Connexion
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Partagez vos envies,<br />
            <span className="text-indigo-600 dark:text-indigo-400">facilitez les surprises</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Créez vos listes de cadeaux et partagez-les avec vos proches. 
            Ils pourront réserver des cadeaux sans que vous le sachiez !
          </p>
          <Link 
            href="/auth/register"
            className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-lg"
          >
            Commencer gratuitement
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Créez vos listes
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ajoutez vos envies de cadeaux avec descriptions, liens et priorités. 
              Organisez tout en un seul endroit.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Partagez facilement
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Générez un lien unique pour chaque liste. Partagez-le avec qui vous voulez, 
              en privé ou en public.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Gardez la surprise
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Vos proches réservent des cadeaux sans que vous le sachiez. 
              La magie de la surprise préservée !
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Comment ça marche ?
          </h3>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Créez votre compte</h4>
                <p className="text-gray-600 dark:text-gray-300">Inscrivez-vous en quelques secondes avec votre email.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Ajoutez vos cadeaux</h4>
                <p className="text-gray-600 dark:text-gray-300">Créez une liste et ajoutez tous les cadeaux que vous souhaitez recevoir.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Partagez votre liste</h4>
                <p className="text-gray-600 dark:text-gray-300">Copiez le lien de votre liste et envoyez-le à vos amis et famille.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">Laissez la magie opérer</h4>
                <p className="text-gray-600 dark:text-gray-300">Vos proches réservent des cadeaux en toute discrétion. Vous ne verrez rien !</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-24 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 ListKdo - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
