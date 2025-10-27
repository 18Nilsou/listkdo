/**
 * Système de rate limiting simple
 * Pour la production, utiliser Redis ou une solution dédiée
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Nettoyer les entrées expirées toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Vérifie si une requête est autorisée
   * @param key Identifiant unique (IP, userId, etc.)
   * @param limit Nombre maximum de requêtes
   * @param windowMs Fenêtre de temps en millisecondes
   */
  check(key: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry || now - entry.resetAt > windowMs) {
      this.requests.set(key, { count: 1, resetAt: now })
      return true
    }

    if (entry.count >= limit) {
      return false
    }

    entry.count++
    return true
  }

  /**
   * Réinitialise le compteur pour une clé
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 heure

    for (const [key, entry] of this.requests.entries()) {
      if (now - entry.resetAt > maxAge) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Retourne le nombre de requêtes restantes
   */
  remaining(key: string, limit: number = 100): number {
    const entry = this.requests.get(key)
    if (!entry) return limit
    return Math.max(0, limit - entry.count)
  }
}

// Instance globale
export const rateLimiter = new RateLimiter()

/**
 * Rate limiters spécifiques pour différentes actions
 */
export const authRateLimiter = {
  login: (ip: string) => rateLimiter.check(`login:${ip}`, 5, 15 * 60 * 1000), // 5 tentatives / 15min
  register: (ip: string) => rateLimiter.check(`register:${ip}`, 3, 60 * 60 * 1000), // 3 inscriptions / heure
  resetPassword: (ip: string) => rateLimiter.check(`reset:${ip}`, 3, 60 * 60 * 1000), // 3 resets / heure
}

export const apiRateLimiter = {
  general: (ip: string) => rateLimiter.check(`api:${ip}`, 100, 60 * 1000), // 100 requêtes / minute
  mutation: (userId: string) => rateLimiter.check(`mutation:${userId}`, 30, 60 * 1000), // 30 mutations / minute
}
