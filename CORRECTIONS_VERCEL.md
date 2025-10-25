# Corrections pour le déploiement Vercel

## Problème rencontré
```
Error: useTheme must be used within a ThemeProvider
```

Cette erreur se produisait lors du build sur Vercel pour les pages :
- `/auth/login`
- `/auth/register`
- `/dashboard/lists/new`
- `/secret-santa/new`

---

## Cause
Le problème venait de l'utilisation de `useTheme()` dans le composant `ThemeToggle` qui tentait d'accéder à `localStorage` et `window` côté serveur pendant le build statique (SSG).

---

## Solutions appliquées

### 1. Modification de `contexts/ThemeContext.tsx`
- ✅ Ajout d'un état `mounted` dans le contexte
- ✅ Le `ThemeProvider` ne retourne plus un fragment vide avant le montage
- ✅ Export de `mounted` dans le contexte pour permettre aux composants de savoir s'ils sont côté client

### 2. Modification de `components/ThemeToggle.tsx`
- ✅ Ajout d'un placeholder pendant le chargement (avant montage côté client)
- ✅ Évite le "layout shift" en gardant la même taille
- ✅ Ne tente plus d'accéder à `theme` avant que le composant soit monté

### 3. Modification de `next.config.js`
- ✅ Suppression de `output: 'standalone'` qui est uniquement nécessaire pour Docker
- ✅ Cette option peut causer des problèmes avec le build Vercel

---

## Code modifié

### ThemeContext.tsx
```typescript
// Avant
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Après
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean  // ← Ajouté
}
```

### ThemeToggle.tsx
```typescript
// Avant
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return <button>...</button>
}

// Après
export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()
  
  if (!mounted) {
    return <div className="p-2 w-9 h-9" />  // Placeholder
  }
  
  return <button>...</button>
}
```

### next.config.js
```javascript
// Avant
const nextConfig = {
  output: 'standalone',
}

// Après
const nextConfig = {
  // output: 'standalone' uniquement pour Docker
}
```

---

## Vérification

Pour vérifier que tout fonctionne :

```bash
# Build local (dans Docker)
docker compose exec app npm run build

# Ou en local avec npm
npm run build
```

Si le build réussit sans l'erreur `useTheme must be used within a ThemeProvider`, c'est bon ! ✅

---

## Déploiement sur Vercel

Maintenant vous pouvez déployer en toute sécurité :

1. Push les changements sur GitHub
   ```bash
   git add .
   git commit -m "Fix ThemeProvider SSR issue for Vercel"
   git push origin main
   ```

2. Vercel redéploiera automatiquement (si configuré)
3. Ou redéployez manuellement depuis le dashboard Vercel

---

## Note importante

Ces modifications permettent au composant `ThemeToggle` de :
- ✅ Fonctionner correctement en SSR (Server-Side Rendering)
- ✅ S'afficher sans erreur pendant le build statique
- ✅ Éviter le flash de contenu lors du chargement
- ✅ Maintenir une expérience utilisateur fluide

Le mode sombre continue de fonctionner exactement comme avant ! 🌙
