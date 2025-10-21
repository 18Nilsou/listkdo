# Configuration du mot de passe oublié

## Fonctionnalités ajoutées

✅ Validation renforcée des mots de passe :
- Minimum 12 caractères
- Au moins une majuscule (A-Z)
- Au moins une minuscule (a-z)  
- Au moins un chiffre (0-9)
- Au moins un caractère spécial (!@#$%^&*...)

✅ Système de réinitialisation de mot de passe :
- Page "Mot de passe oublié" accessible depuis la connexion
- Envoi d'email avec lien de réinitialisation
- Token sécurisé valide pendant 1 heure
- Ne révèle pas si l'email existe (sécurité)

## Configuration SMTP

Pour que l'envoi d'emails fonctionne, vous devez configurer un service SMTP.

### Option 1 : Gmail (Développement)

1. Allez dans votre compte Google : https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Générez un "Mot de passe d'application" :
   - Allez dans "Mots de passe d'application"
   - Sélectionnez "Autre" et donnez un nom
   - Copiez le mot de passe généré (16 caractères)

4. Modifiez le fichier `.env` :
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="mot-de-passe-application-16-caractères"
SMTP_FROM="ListKdo <votre-email@gmail.com>"
```

### Option 2 : Mailtrap (Développement/Test)

Mailtrap intercepte les emails sans les envoyer réellement (parfait pour le développement).

1. Créez un compte sur https://mailtrap.io
2. Créez une inbox
3. Copiez les identifiants SMTP

4. Modifiez le fichier `.env` :
```env
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="votre-username-mailtrap"
SMTP_PASSWORD="votre-password-mailtrap"
SMTP_FROM="ListKdo <noreply@listkdo.com>"
```

### Option 3 : SendGrid (Production)

Pour la production, utilisez un service professionnel comme SendGrid :

1. Créez un compte sur https://sendgrid.com
2. Créez une clé API
3. Configurez dans `.env` :

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="votre-clé-api-sendgrid"
SMTP_FROM="ListKdo <noreply@votredomaine.com>"
```

## Migration de la base de données

Les nouveaux champs ont été ajoutés au modèle User. Vous devez exécuter une migration :

```bash
# Dans le conteneur Docker
docker compose exec app npx prisma migrate dev --name add_password_reset

# Ou si vous utilisez npm localement
npm run postinstall
npx prisma migrate dev --name add_password_reset
```

## Installation des dépendances

Les nouvelles dépendances ont été ajoutées à `package.json`. Reconstruisez le conteneur Docker :

```bash
docker compose down
docker compose up --build -d
```

## Tester la fonctionnalité

1. Allez sur http://localhost:3000/auth/login
2. Cliquez sur "Mot de passe oublié ?"
3. Entrez votre email
4. Vérifiez votre boîte mail (ou Mailtrap si en dev)
5. Cliquez sur le lien de réinitialisation
6. Entrez un nouveau mot de passe (qui respecte les exigences)

## Sécurité

- ✅ Les mots de passe sont hashés avec bcrypt (12 rounds)
- ✅ Les tokens de réinitialisation expirent après 1 heure
- ✅ Les tokens sont supprimés après utilisation
- ✅ L'existence d'un email n'est jamais révélée
- ✅ Validation stricte des mots de passe côté serveur
- ✅ Affichage des exigences côté client

## API Endpoints

### POST /api/auth/forgot-password
Demande un lien de réinitialisation.
```json
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password
Réinitialise le mot de passe avec un token.
```json
{
  "token": "token-from-email",
  "password": "NewSecureP@ssw0rd123"
}
```
