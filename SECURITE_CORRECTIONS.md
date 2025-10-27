# Corrections de Sécurité Appliquées

## 🔴 HAUTE PRIORITÉ

### ✅ 1. Gestion des sessions / cookies (NextAuth)
**Fichier:** `lib/auth.ts`

**Corrections appliquées:**
- ✅ Cookies sécurisés avec `secure: true` en production
- ✅ `SameSite=Lax` pour protection CSRF
- ✅ `httpOnly: true` pour empêcher accès JavaScript
- ✅ Durée de session limitée à 30 jours
- ✅ Mise à jour de session toutes les 24h
- ✅ Horodatage `iat` dans les JWT pour rotation
- ✅ `useSecureCookies` activé en production

### ✅ 2. Flows de réinitialisation de mot de passe
**Fichiers:** `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`

**Corrections appliquées:**
- ✅ Tokens hashés avec SHA-256 avant stockage (pas en clair)
- ✅ Expiration courte (1 heure)
- ✅ Invalidation immédiate après utilisation
- ✅ Rate limiting (3 tentatives/heure par IP)
- ✅ Logging des tentatives suspectes
- ✅ Messages génériques (ne révèlent pas si email existe)
- ✅ Détection des tokens invalides

### ✅ 3. Rate Limiting & Anti-brute force
**Fichier:** `lib/rate-limit.ts`

**Corrections appliquées:**
- ✅ Système de rate limiting global
- ✅ Limites spécifiques :
  - Login : 5 tentatives / 15 minutes
  - Register : 3 inscriptions / heure
  - Reset password : 3 tentatives / heure
  - API générale : 100 requêtes / minute
  - Mutations : 30 / minute
- ✅ Nettoyage automatique des entrées expirées

### ✅ 4. Headers de Sécurité
**Fichier:** `middleware.ts`

**Corrections appliquées:**
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY (anti-clickjacking)
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Strict-Transport-Security (HSTS) en production
- ✅ Permissions-Policy (désactive caméra, micro, géoloc)

### ✅ 5. Sanitization XSS
**Fichier:** `lib/sanitize.ts`

**Fonctions créées:**
- ✅ `escapeHtml()` - Échappe les caractères HTML
- ✅ `sanitizeUrl()` - Bloque javascript:, data:, etc.
- ✅ `sanitizeText()` - Limite longueur et supprime caractères de contrôle
- ✅ `sanitizeUrls()` - Valide et nettoie les tableaux d'URLs
- ✅ `sanitizeGiftData()` - Sanitize les données de cadeaux
- ✅ `sanitizeListData()` - Sanitize les données de listes

### ✅ 6. Logging de Sécurité
**Fichier:** `lib/security-logger.ts`

**Événements tracés:**
- ✅ Authentifications (succès/échecs)
- ✅ Inscriptions
- ✅ Réinitialisations de mot de passe
- ✅ Tentatives avec tokens invalides
- ✅ Rate limit dépassé
- ✅ Accès non autorisés
- ✅ Activités suspectes
- ✅ Tentatives XSS/SQL injection

---

## 🟡 MOYENNE PRIORITÉ

### ✅ 7. Protection CSRF
**Fichier:** `lib/auth.ts`, `middleware.ts`

**Corrections appliquées:**
- ✅ SameSite=Lax sur les cookies
- ✅ NextAuth gère CSRF automatiquement
- ✅ Vérification des tokens CSRF intégrée

---

## 🟢 À IMPLÉMENTER (Prochaines étapes)

### 📋 8. Contrôle d'accès / Autorisation
**À faire:**
- [ ] Auditer toutes les routes API pour vérifier owner checks
- [ ] Ajouter vérifications dans routes de modification/suppression
- [ ] Tester accès horizontal (utilisateur A accède aux ressources de B)

**Routes à vérifier prioritairement:**
- `app/api/lists/[id]/route.ts` (GET, PATCH, DELETE)
- `app/api/lists/[id]/gifts/[giftId]/route.ts` (PATCH, DELETE)
- `app/api/secret-santa/[id]/route.ts`

### 📋 9. Utiliser les fonctions de sanitization
**À faire:**
- [ ] Intégrer `sanitizeGiftData()` dans `POST /api/lists/[id]/gifts`
- [ ] Intégrer `sanitizeListData()` dans `POST /api/lists`
- [ ] Ajouter validation des URLs avant affichage
- [ ] Échapper les descriptions dans l'UI

### 📋 10. Migration PostgreSQL (si pas déjà fait)
**À faire:**
- [ ] Remplacer SQLite par PostgreSQL (Neon déjà configuré)
- [ ] Vérifier que `DATABASE_URL` pointe vers Neon
- [ ] S'assurer que le fichier SQLite n'est pas exposé

---

## 🔧 Configuration Production

### Variables d'environnement Vercel
```env
# Obligatoires
DATABASE_URL=postgresql://...@neon.tech/...?sslmode=require
NEXTAUTH_SECRET=<clé générée avec openssl rand -base64 32>
NEXTAUTH_URL=https://votre-app.vercel.app

# Optionnelles (emails)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=...
```

---

## 📊 Tests de Sécurité à Effectuer

### Tests manuels
1. **XSS** : Injecter `<script>alert('XSS')</script>` dans descriptions
2. **Accès horizontal** : Tenter d'accéder aux listes d'un autre utilisateur
3. **Rate limiting** : Faire 10 tentatives de login rapides
4. **Token invalide** : Utiliser un ancien token de reset password
5. **URLs malveillantes** : Tenter `javascript:alert(1)` dans liens

### Tests automatisés (à ajouter)
```bash
npm install --save-dev @testing-library/react jest
# Créer tests pour sanitization, rate limiting, etc.
```

---

## 🚀 Déploiement

1. Commit et push des modifications :
```bash
git add .
git commit -m "security: Corrections majeures de sécurité (CSRF, XSS, rate limiting, headers)"
git push origin main
```

2. Vérifier le build Vercel

3. Tester en production :
   - Inscription
   - Connexion
   - Reset password
   - Création de listes
   - Ajout de cadeaux avec URLs

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

---

## ⚠️ Notes Importantes

**Rate Limiting en mémoire** : La solution actuelle stocke les tentatives en mémoire. En production avec plusieurs instances Vercel, utiliser **Vercel KV (Redis)** ou **Upstash Redis**.

**Logging** : Les logs sont actuellement en console. Pour la production, intégrer **Sentry**, **Datadog** ou **LogRocket**.

**Sanitization** : Les fonctions sont créées mais doivent être **intégrées dans les routes API** pour être effectives.

**Audits réguliers** : Exécuter `npm audit` régulièrement et mettre à jour les dépendances.
