FROM node:20-alpine

# Installer les dépendances système requises pour Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances avec --legacy-peer-deps pour résoudre les conflits
RUN npm install --legacy-peer-deps

# Copier le reste du code
COPY . .

# Générer Prisma Client
RUN npx prisma generate

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application en mode dev
CMD ["npm", "run", "dev"]
