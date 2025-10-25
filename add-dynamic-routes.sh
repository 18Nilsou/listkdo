#!/bin/bash

# Script pour ajouter export const dynamic = 'force-dynamic' aux routes API

echo "🔧 Ajout de 'export const dynamic = force-dynamic' aux routes API..."

# Liste des fichiers à modifier
files=(
  "app/api/lists/[id]/route.ts"
  "app/api/lists/[id]/gifts/route.ts"
  "app/api/lists/[id]/gifts/[giftId]/route.ts"
  "app/api/lists/[id]/invitations/route.ts"
  "app/api/lists/invitations/[token]/route.ts"
  "app/api/secret-santa/route.ts"
  "app/api/secret-santa/[id]/route.ts"
  "app/api/secret-santa/[id]/invite/route.ts"
  "app/api/secret-santa/[id]/launch/route.ts"
  "app/api/secret-santa/join/[token]/route.ts"
  "app/api/gifts/[giftId]/reserve/route.ts"
  "app/api/user/profile/route.ts"
  "app/api/user/password/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Vérifier si le fichier contient déjà la directive
    if ! grep -q "export const dynamic = 'force-dynamic'" "$file"; then
      echo "  ✓ Modification de $file"
      # Ajouter après les imports (après la dernière ligne qui commence par 'import')
      awk '/^import/ {imports = imports $0 "\n"; next} 
           !added && NF {print imports "\nexport const dynamic = '\''force-dynamic'\''\n"; added=1} 
           {print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    else
      echo "  → $file déjà configuré"
    fi
  fi
done

echo ""
echo "✅ Terminé !"
