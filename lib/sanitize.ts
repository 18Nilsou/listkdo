/**
 * Utilitaires de sanitization pour prévenir les attaques XSS
 */

/**
 * Échappe les caractères HTML dangereux
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitize une URL pour éviter les injections javascript:
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  // Supprimer les espaces
  const trimmed = url.trim()
  
  // Bloquer les schémas dangereux
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lower = trimmed.toLowerCase()
  
  for (const protocol of dangerousProtocols) {
    if (lower.startsWith(protocol)) {
      return ''
    }
  }
  
  // Autoriser seulement http, https et les URLs relatives
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed
  }
  
  // Si pas de protocole, ajouter https://
  if (!trimmed.includes('://')) {
    return 'https://' + trimmed
  }
  
  return ''
}

/**
 * Sanitize du texte pour éviter les injections
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (!text) return ''
  
  // Limiter la longueur
  const truncated = text.slice(0, maxLength)
  
  // Supprimer les caractères de contrôle
  return truncated.replace(/[\x00-\x1F\x7F]/g, '')
}

/**
 * Valider et sanitizer un array d'URLs (pour les liens de cadeaux)
 */
export function sanitizeUrls(urls: string[]): string[] {
  if (!Array.isArray(urls)) return []
  
  return urls
    .filter(url => typeof url === 'string')
    .map(url => sanitizeUrl(url))
    .filter(url => url !== '')
    .slice(0, 10) // Max 10 URLs par cadeau
}

/**
 * Sanitize les données d'un cadeau
 */
export function sanitizeGiftData(data: any) {
  return {
    name: sanitizeText(data.name || '', 200),
    description: sanitizeText(data.description || '', 2000),
    links: sanitizeUrls(data.links || []),
    priority: ['FAIBLE', 'MOYEN', 'HAUT', 'TRES_HAUT'].includes(data.priority) 
      ? data.priority 
      : 'MOYEN',
    quantity: Math.max(1, Math.min(100, parseInt(data.quantity) || 1))
  }
}

/**
 * Sanitize les données d'une liste
 */
export function sanitizeListData(data: any) {
  return {
    title: sanitizeText(data.title || '', 200),
    description: sanitizeText(data.description || '', 2000),
    isPublic: Boolean(data.isPublic)
  }
}
