# Guide de déploiement gratuit (Vercel + Neon)

Ce guide explique comment déployer votre projet Next.js/Prisma/PostgreSQL gratuitement sur Vercel avec une base de données Neon.

---

## 1. Prérequis
- Un compte GitHub (ou GitLab/Bitbucket)
- Un compte Vercel ([vercel.com](https://vercel.com))
- Un compte Neon ([neon.tech](https://neon.tech))

---

## 2. Préparer la base de données Neon

### Étape 1 : Créer le compte et le projet
1. Allez sur https://neon.tech et créez un compte
2. Créez un nouveau projet PostgreSQL
3. Sélectionnez la région la plus proche (par exemple : Europe - Frankfurt)

### Étape 2 : Récupérer l'URL de connexion
1. Dans votre projet Neon, cliquez sur "Connection Details"
2. Copiez la "Connection String" (elle ressemble à ceci) :
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
3. **Important** : Gardez cette URL en sécurité, vous en aurez besoin pour Vercel

### Étape 3 : Configuration Neon
- ❌ **Ne pas activer "Enable Neon Auth"** (vous utilisez NextAuth.js)
- ✅ Vous pouvez laisser les autres paramètres par défaut

---

## 3. Préparer le dépôt Git

1. **Poussez votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Préparation pour déploiement Vercel"
   git push origin main
   ```

2. **Vérifiez que votre code est à jour**
   - Le fichier `prisma/schema.prisma` doit avoir `provider = "postgresql"`
   - Le fichier `next.config.js` ne doit **pas** avoir `output: 'standalone'` (c'est pour Docker uniquement)

---

## 4. Déployer sur Vercel

### Étape 1 : Importer le projet
1. Connectez-vous sur https://vercel.com
2. Cliquez sur **"Add New Project"**
3. Sélectionnez **"Import Git Repository"**
4. Choisissez votre dépôt GitHub `listkdo`

### Étape 2 : Configurer les variables d'environnement
Avant de déployer, ajoutez ces variables d'environnement dans Vercel :

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `DATABASE_URL` | Votre URL Neon complète | `postgresql://neondb_owner:xxxxx@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | Clé secrète aléatoire | Générez avec `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL de votre app Vercel | `https://votre-projet.vercel.app` |

**Comment générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

### Étape 3 : Lancer le déploiement
1. Cliquez sur **"Deploy"**
2. Attendez que le build se termine (environ 2-3 minutes)
3. ✅ Votre application est maintenant en ligne !

---

## 5. Migrer la base de données

Une fois le déploiement terminé, vous devez appliquer les migrations Prisma sur Neon :

### Option 1 : Via le terminal Vercel (recommandé)
1. Dans votre projet Vercel, allez dans **"Settings" → "Functions"**
2. Ou utilisez la CLI Vercel :
   ```bash
   npx vercel env pull
   npx prisma migrate deploy
   ```

### Option 2 : En local avec l'URL Neon
```bash
# Créez un fichier .env.production avec DATABASE_URL de Neon
DATABASE_URL="postgresql://neondb_owner:xxxxx@..." npx prisma migrate deploy
```

---

## 6. (Optionnel) Configurer l'envoi d'emails

Pour la fonctionnalité "mot de passe oublié", configurez un service SMTP gratuit :

### Services SMTP gratuits recommandés :
- **Resend** : 3000 emails/mois gratuit (recommandé)
- **SendGrid** : 100 emails/jour gratuit
- **Mailgun** : 5000 emails/mois gratuit

### Variables d'environnement à ajouter dans Vercel :
```env
EMAIL_SERVER=smtp://user:password@smtp.example.com:587
EMAIL_FROM=noreply@votredomaine.com
```

---

## 7. Vérifications finales

### ✅ Checklist avant mise en production
- [ ] La base de données Neon est créée et accessible
- [ ] Les variables d'environnement sont configurées dans Vercel
- [ ] Les migrations Prisma sont appliquées (`prisma migrate deploy`)
- [ ] L'application se charge correctement sur l'URL Vercel
- [ ] La connexion/inscription fonctionne
- [ ] Le mode sombre fonctionne (ThemeToggle)

### 🔧 En cas d'erreur
- Vérifiez les logs dans Vercel → "Functions" → "Logs"
- Vérifiez que `DATABASE_URL` contient bien `?sslmode=require`
- Assurez-vous que les migrations sont appliquées

---

## 8. Commandes utiles

### Build local (pour tester avant déploiement)
```bash
npm run build
npm start
```

### Appliquer les migrations en production
```bash
npx prisma migrate deploy
```

### Voir la base de données Neon
```bash
npx prisma studio
```

---

## 🎉 C'est terminé !

Votre application est maintenant déployée gratuitement sur Vercel avec une base PostgreSQL Neon.

### Limites du plan gratuit :
- **Vercel** : Bande passante illimitée, 100 GB/mois
- **Neon** : 0.5 GB de stockage, connexions illimitées

### Pour aller plus loin :
- Ajoutez un domaine personnalisé dans Vercel (gratuit)
- Configurez les emails pour le reset password
- Activez les analytics Vercel (gratuit)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel
2. Vérifiez la connexion à Neon dans les variables d'environnement
3. Ouvrez une issue sur le repo GitHub
