'use client'

import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function ClientThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Éviter le rendu côté serveur
  if (!mounted) {
    return <div className="w-10 h-10" /> // Placeholder pour éviter le layout shift
  }

  return <ThemeToggle />
}
