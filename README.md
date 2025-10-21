# 🎁 ListKdo

Application web pour partager et gérer des listes de cadeaux.

## 🚀 Démarrage rapide avec Docker

### Prérequis
- Docker installé sur votre machine

### Installation et lancement

1. **Build et démarrer l'application**
```bash
cd listkdo
docker compose up --build
```

⏳ *Le premier build prend environ 2-3 minutes (installation des dépendances npm)*

2. **Dans un NOUVEAU terminal, initialiser la base de données**
```bash
docker compose exec app npx prisma migrate dev --name init
```

3. **Accéder à l'application**
Ouvrez votre navigateur sur : http://localhost:3000

## 📋 Fonctionnalités

### ✅ Version actuelle (MVP)
- 🔐 Authentification (Email + Mot de passe)
- 📝 Création de listes de cadeaux
- 🎁 Ajout de cadeaux avec :
  - Nom et description
  - Liens / lieux
  - Priorité (Faible, Moyen, Haut, Très haut)
  - Quantité
- 🔗 Partage de listes (public/privé)
- 🎯 Réservation de cadeaux
- 👻 Masquage des réservations pour le créateur
- ⏰ Suppression automatique après date limite

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 14 (React) + TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : SQLite + Prisma ORM
- **Authentification** : NextAuth.js
- **Conteneurisation** : Docker

## 📁 Structure du projet

```
listkdo/
├── app/                    # Pages et layouts Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Dashboard utilisateur
│   └── list/              # Pages des listes
├── prisma/                # Schéma de base de données
├── lib/                   # Utilitaires et configuration
├── types/                 # Types TypeScript
└── docker-compose.yml     # Configuration Docker
```

## 🔧 Commandes utiles

### Arrêter l'application
```bash
docker-compose down
```

### Voir les logs
```bash
docker-compose logs -f
```

### Reconstruire après modifications
```bash
docker-compose up --build
```

### Accéder au shell du conteneur
```bash
docker-compose exec app sh
```

### Réinitialiser la base de données
```bash
docker-compose exec app npx prisma migrate reset
```

### Visualiser la base de données
```bash
docker-compose exec app npx prisma studio
```
Puis ouvrir : http://localhost:5555

## 📝 Variables d'environnement

Les variables sont déjà configurées dans `docker-compose.yml` pour le développement.

Pour la production, modifiez :
- `NEXTAUTH_SECRET` : Utilisez `openssl rand -base64 32` pour générer une clé sécurisée
- `NEXTAUTH_URL` : URL de votre application en production

## 🎯 TODO (Prochaines fonctionnalités)

- [ ] Dashboard complet
- [ ] Gestion des listes (CRUD)
- [ ] Système de réservation
- [ ] Notifications (optionnel)
- [ ] Mode sombre
- [ ] Export PDF

## 📄 Licence

Projet personnel - Tous droits réservés
