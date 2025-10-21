# 🎁 ListKdo - Guide de Démarrage

## ✅ Application Complète Créée !

Toutes les fonctionnalités du MVP sont implémentées :

### Fonctionnalités Disponibles

#### 🔐 Authentification
- ✅ Inscription (email + mot de passe + pseudo)
- ✅ Connexion
- ✅ Déconnexion
- ✅ Protection des routes

#### 📝 Gestion des Listes
- ✅ Créer une liste avec titre, description, date limite
- ✅ Choisir si la liste est publique ou privée
- ✅ Modifier une liste
- ✅ Supprimer une liste (avec confirmation)
- ✅ Génération automatique d'un lien de partage unique
- ✅ Copier le lien de partage dans le presse-papier

#### 🎁 Gestion des Cadeaux
- ✅ Ajouter un cadeau avec :
  - Nom
  - Description
  - Liens/lieux (plusieurs possibles)
  - Priorité (Faible, Moyen, Haut, Très haut)
  - Quantité
- ✅ Supprimer un cadeau
- ✅ Voir les cadeaux d'une liste

#### 🎯 Système de Réservation
- ✅ Réserver un cadeau (quantité unitaire)
- ✅ Annuler une réservation
- ✅ Voir qui a réservé quoi (sauf pour le créateur)
- ✅ Le créateur de la liste ne voit PAS les réservations
- ✅ Gestion de la quantité disponible
- ✅ Impossible de réserver ses propres cadeaux

#### 🏠 Dashboard
- ✅ Vue d'ensemble de mes listes
- ✅ Mes réservations sur d'autres listes
- ✅ Accès rapide à toutes les fonctionnalités

#### 🔗 Partage
- ✅ Lien unique par liste
- ✅ Accès par lien (public/privé)
- ✅ Vue invité pour voir une liste
- ✅ Compte requis pour réserver

#### ⏰ Nettoyage Automatique
- ✅ API endpoint pour supprimer les listes expirées
- ✅ Peut être appelée par un cron externe

---

## 🚀 Démarrage de l'Application

### 1. Lancer Docker

```bash
cd /Users/nils/Desktop/Perso/info/pp/listkdo
docker compose up -d
```

### 2. Attendre que le conteneur soit prêt (10-15 secondes)

### 3. Initialiser la base de données

```bash
docker compose exec app npx prisma migrate dev --name init
```

### 4. Accéder à l'application

Ouvrez votre navigateur : **http://localhost:3000**

---

## 📂 Structure du Projet

```
listkdo/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/               # Authentification
│   │   ├── lists/              # Gestion des listes
│   │   ├── gifts/              # Gestion des cadeaux
│   │   ├── reservations/       # Réservations
│   │   └── cron/               # Nettoyage automatique
│   ├── auth/                   # Pages login/register
│   ├── dashboard/              # Dashboard + gestion listes
│   ├── list/[shareToken]/      # Vue publique d'une liste
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Page d'accueil
│   ├── providers.tsx           # Session provider
│   └── globals.css             # Styles globaux
├── prisma/
│   └── schema.prisma           # Schéma de base de données
├── lib/
│   └── prisma.ts               # Client Prisma
├── types/
│   └── next-auth.d.ts          # Types NextAuth
├── Dockerfile                   # Configuration Docker
├── docker-compose.yml           # Docker Compose
├── .env                         # Variables d'environnement
└── package.json                 # Dépendances

```

---

## 🛠️ Commandes Utiles

### Docker

```bash
# Démarrer
docker compose up -d

# Arrêter
docker compose down

# Voir les logs
docker compose logs -f app

# Reconstruire
docker compose up --build -d

# Shell dans le conteneur
docker compose exec app sh
```

### Prisma

```bash
# Créer une migration
docker compose exec app npx prisma migrate dev --name nom_migration

# Réinitialiser la DB
docker compose exec app npx prisma migrate reset

# Ouvrir Prisma Studio (interface graphique)
docker compose exec app npx prisma studio
# Puis ouvrir http://localhost:5555
```

---

## 🎯 Scénarios d'Utilisation

### Créer et partager une liste

1. S'inscrire / Se connecter
2. Cliquer sur "Nouvelle liste"
3. Remplir le formulaire (titre, description, date limite)
4. Ajouter des cadeaux avec le bouton "+ Ajouter un cadeau"
5. Cliquer sur "Partager" pour copier le lien
6. Envoyer le lien à vos amis/famille

### Réserver un cadeau

1. Recevoir un lien de liste
2. Se connecter (ou créer un compte)
3. Voir la liste des cadeaux disponibles
4. Cliquer sur "Réserver (1)" pour un cadeau
5. Le cadeau est marqué comme réservé par vous
6. Le créateur de la liste ne voit pas votre réservation !

### Annuler une réservation

1. Aller sur la liste
2. Trouver votre réservation (marquée en vert)
3. Cliquer sur "Annuler ma réservation"
4. Confirmer

---

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt
- ✅ Sessions sécurisées avec NextAuth
- ✅ Protection des routes avec middleware
- ✅ Validation des données côté serveur
- ✅ Vérification des autorisations (CRUD uniquement pour le propriétaire)

---

## 🐛 Dépannage

### Le conteneur ne démarre pas
```bash
docker compose down
docker compose up --build -d
```

### Erreur Prisma
```bash
docker compose exec app npx prisma generate
docker compose restart
```

### Port 3000 déjà utilisé
Modifier le port dans `docker-compose.yml` :
```yaml
ports:
  - "3001:3000"  # Utilise 3001 au lieu de 3000
```

### Voir les erreurs
```bash
docker compose logs -f app
```

---

## 🚀 Prochaines Améliorations Possibles

- [ ] Système d'invitations par email
- [ ] Notifications (email ou push)
- [ ] Photos de cadeaux
- [ ] Recherche de cadeaux
- [ ] Catégories/tags
- [ ] Export PDF de liste
- [ ] Mode sombre
- [ ] Multi-langues
- [ ] OAuth (Google, Facebook)
- [ ] Commentaires sur les cadeaux
- [ ] Historique des listes passées

---

## 📝 Notes Techniques

### Base de Données
- **SQLite** pour simplicité (dev)
- Peut être changée pour PostgreSQL/MySQL en prod
- Migrations Prisma pour versioning

### Architecture
- **Next.js 14** avec App Router
- **Server Components** pour performances
- **Client Components** pour interactivité
- **API Routes** pour le backend
- **TypeScript** pour typage fort

### Styling
- **Tailwind CSS** pour design minimaliste
- Responsive mobile-first
- Composants réutilisables

---

## 🎉 Bravo !

Votre application **ListKdo** est prête à l'emploi ! 

Toutes les fonctionnalités demandées sont implémentées et fonctionnelles.

**Bon développement ! 🚀**
