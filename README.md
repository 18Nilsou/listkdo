# 🎁 ListKdo

Application web pour partager et gérer des listes de cadeaux.

#### Context

Test de création d'une application web en vidcoding.

## 🚀 Démarrage rapide avec Docker

### Prérequis
- Docker installé sur votre machine

### Installation et lancement

1. **Build et démarrer l'application**
```bash
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

- **VibeCoding** :Claude Sonnet 4.5
- **Frontend** : Next.js 14 (React) + TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : SQLite + Prisma ORM
- **Authentification** : NextAuth.js
- **Conteneurisation** : Docker

## 📁 Structure du projet

```
listkdo/
├── app/                      # Pages et layouts Next.js
│   ├── api/                  # API Routes (backend)
│   ├── auth/                 # Pages d'authentification (login, register)
│   ├── dashboard/            # Tableau de bord utilisateur
│   ├── list/                 # Pages de gestion des listes de cadeaux
│   └── page.tsx              # Page d'accueil principale
├── prisma/                   # Schéma et migrations de base de données Prisma
│   └── schema.prisma
├── lib/                      # Fonctions utilitaires et configuration globale
├── types/                    # Déclarations de types TypeScript
├── public/                   # Fichiers statiques (images, favicon, etc.)
├── styles/                   # Fichiers CSS/Tailwind personnalisés
├── .env                      # Variables d'environnement (local)
├── docker-compose.yml        # Configuration Docker
└── README.md                 # Documentation du projet
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

## 📝 Variables d'environnement

Les variables sont déjà configurées dans `docker-compose.yml` pour le développement.

Pour la production, modifiez :
- `NEXTAUTH_SECRET` : Utilisez `openssl rand -base64 32` pour générer une clé sécurisée
- `NEXTAUTH_URL` : URL de votre application en production

## 🎯 TODO

- [x] Dashboard complet
- [x] Gestion des listes (CRUD)
- [x] Système de réservation
- [x] Authentification (Email + Mot de passe)
- [x] Mot de pass oublié
- [x] Ajout de cadeaux (nom, description, lien, priorité, quantité)
- [x] Partage de listes (public/privé)
- [x] Réservation de cadeaux
- [x] Masquage des réservations pour le créateur
- [x] Suppression automatique après date limite
- [ ] Notifications
- [x] Mode sombre
- [ ] Ajout des tag sur les cadeaux
- [ ] Export PDF
- [ ] Secret Santa Mode
- [ ] Traduction en anglais

## 📄 Licence

Projet personnel - Tous droits réservés
