export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 12) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 12 caractères' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' }
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)' }
  }

  return { valid: true }
}

export function getPasswordRequirements(): string[] {
  return [
    'Au moins 12 caractères',
    'Au moins une majuscule (A-Z)',
    'Au moins une minuscule (a-z)',
    'Au moins un chiffre (0-9)',
    'Au moins un caractère spécial (!@#$%^&*...)'
  ]
}
