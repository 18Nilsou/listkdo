#!/bin/bash

# Script pour appliquer les migrations Prisma sur Neon
# Usage: ./migrate-neon.sh

echo "🚀 Application des migrations Prisma sur Neon..."
echo ""
echo "⚠️  Assurez-vous que DATABASE_URL pointe vers Neon dans votre .env ou en variable d'environnement"
echo ""

# Appliquer les migrations
docker compose exec app npx prisma migrate deploy

echo ""
echo "✅ Migrations appliquées avec succès !"
