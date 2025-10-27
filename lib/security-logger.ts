/**
 * Système de logging pour les événements de sécurité
 * En production, envoyer vers un service de monitoring (Sentry, Datadog, etc.)
 */

export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILURE = 'REGISTER_FAILURE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_INVALID_TOKEN = 'PASSWORD_RESET_INVALID_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
}

interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  details?: string
  timestamp: Date
}

class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxEvents = 1000 // Garder les 1000 derniers événements en mémoire

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    }

    // Log dans la console (en production, envoyer vers un service externe)
    const logLevel = this.getLogLevel(event.type)
    const message = this.formatEvent(fullEvent)

    if (logLevel === 'error') {
      console.error(`[SECURITY] ${message}`)
    } else if (logLevel === 'warn') {
      console.warn(`[SECURITY] ${message}`)
    } else {
      console.log(`[SECURITY] ${message}`)
    }

    // Stocker en mémoire
    this.events.push(fullEvent)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // En production, envoyer vers un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(fullEvent)
    }
  }

  private getLogLevel(type: SecurityEventType): 'info' | 'warn' | 'error' {
    const errorEvents = [
      SecurityEventType.PASSWORD_RESET_INVALID_TOKEN,
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.SQL_INJECTION_ATTEMPT,
    ]

    const warnEvents = [
      SecurityEventType.AUTH_FAILURE,
      SecurityEventType.REGISTER_FAILURE,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
    ]

    if (errorEvents.includes(type)) return 'error'
    if (warnEvents.includes(type)) return 'warn'
    return 'info'
  }

  private formatEvent(event: SecurityEvent): string {
    const parts = [
      event.type,
      event.email ? `email=${event.email}` : null,
      event.userId ? `userId=${event.userId}` : null,
      event.ip ? `ip=${event.ip}` : null,
      event.details ? `details=${event.details}` : null,
    ].filter(Boolean)

    return parts.join(' | ')
  }

  private sendToMonitoring(event: SecurityEvent): void {
    // TODO: Implémenter l'envoi vers Sentry, Datadog, etc.
    // Exemple avec Sentry :
    // Sentry.captureMessage(`Security Event: ${event.type}`, {
    //   level: this.getLogLevel(event.type),
    //   extra: event,
    // })
  }

  /**
   * Récupère les événements récents pour l'analyse
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Récupère les événements suspects récents
   */
  getSuspiciousEvents(): SecurityEvent[] {
    const suspiciousTypes = [
      SecurityEventType.PASSWORD_RESET_INVALID_TOKEN,
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.RATE_LIMIT_EXCEEDED,
    ]

    return this.events.filter(event => suspiciousTypes.includes(event.type))
  }
}

// Instance globale
export const securityLogger = new SecurityLogger()

// Helpers pour logger facilement
export const logSecurityEvent = {
  authSuccess: (email: string, ip?: string) => {
    securityLogger.log({
      type: SecurityEventType.AUTH_SUCCESS,
      email,
      ip,
    })
  },

  authFailure: (email: string, ip?: string, details?: string) => {
    securityLogger.log({
      type: SecurityEventType.AUTH_FAILURE,
      email,
      ip,
      details,
    })
  },

  registerSuccess: (email: string, userId: string, ip?: string) => {
    securityLogger.log({
      type: SecurityEventType.REGISTER_SUCCESS,
      email,
      userId,
      ip,
    })
  },

  passwordResetRequest: (email: string, ip?: string) => {
    securityLogger.log({
      type: SecurityEventType.PASSWORD_RESET_REQUEST,
      email,
      ip,
    })
  },

  passwordResetSuccess: (email: string, userId: string, ip?: string) => {
    securityLogger.log({
      type: SecurityEventType.PASSWORD_RESET_SUCCESS,
      email,
      userId,
      ip,
    })
  },

  invalidResetToken: (ip?: string) => {
    securityLogger.log({
      type: SecurityEventType.PASSWORD_RESET_INVALID_TOKEN,
      ip,
      details: 'Tentative avec un token invalide',
    })
  },

  rateLimitExceeded: (ip: string, endpoint: string) => {
    securityLogger.log({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ip,
      details: `Endpoint: ${endpoint}`,
    })
  },

  unauthorizedAccess: (userId?: string, ip?: string, details?: string) => {
    securityLogger.log({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      userId,
      ip,
      details,
    })
  },
}
