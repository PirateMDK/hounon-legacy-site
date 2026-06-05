# Supabase CLI et déploiement

## Objectif

Cette documentation explique comment installer et utiliser le CLI Supabase pour :

- se connecter au projet Supabase
- pousser les migrations
- lancer les seeds
- déployer la base vers le nouveau projet Supabase

## Scripts NPM disponibles

Dans `package.json`, les scripts suivants ont été ajoutés :

- `npm run supabase:install`
  - tente d’exécuter `npx supabase --version`
  - si cela échoue, installe globalement le CLI via `npm install -g supabase`
- `npm run supabase:login`
  - démarre l’authentification interactive avec Supabase
- `npm run supabase:push`
  - pousse les migrations vers le projet Supabase configuré
- `npm run supabase:seed`
  - exécute le seed configuré pour le projet
- `npm run supabase:migrate:new`
  - crée une nouvelle migration SQL
- `npm run supabase:setup`
  - exécute `supabase:install` puis `supabase:login`
- `npm run supabase:deploy`
  - exécute `supabase:push` puis `supabase:seed`

## Configuration du projet Supabase

Le fichier `supabase/config.toml` doit pointer sur le bon `project_id` :

```toml
project_id = "dvgqbffipykrflkzsezj"
```

## Exécution correcte

### 1. Installation CLI

```bash
npm run supabase:install
```

> Si ce script échoue sur Windows, utilise WSL ou installe le binaire Windows compatible manuellement depuis la page de releases Supabase.

### 2. Connexion au compte Supabase

```bash
npm run supabase:login
```

### 3. Pousser les migrations

```bash
npm run supabase:push
```

### 4. Lancer les seeds

```bash
npm run supabase:seed
```

> Note : avec la version actuelle du CLI, la commande de seed est limitée aux buckets de stockage.
> Si votre projet n’utilise pas de `storage.buckets`, ce script peut rester sans effet.

### 5. Tout faire d’un coup

```bash
npm run supabase:deploy
```

> `supabase:deploy` ne crée pas de nouvelle migration, il applique uniquement les migrations existantes puis les seeds.

## Notes importantes

- Cette app utilise Vite et conserve les variables frontend `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Les variables sensibles côté backend doivent être réglées dans ton environnement Vercel et ne jamais être mises en production dans un fichier commité.
- Pour Vercel, ajoute au minimum :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## En cas de problème sur Windows

Si le CLI lance une erreur de binaire `win32-x64`, utilise une des solutions suivantes :

1. Ouvrir WSL et exécuter les commandes depuis Linux.
2. Télécharger le binaire Windows compatible depuis les releases Supabase.
3. Si nécessaire, passer par `curl`/`wget` pour installer le CLI manuellement.

## Conseils pour les seeds

- Si tu n’as pas de dossier `supabase/seed`, crée une migration d’initialisation dans `supabase/migrations/` et ajoute les `INSERT INTO ...` nécessaires.
- Le code serveur existant contient déjà une fonction `ensureAdminSeeded` pour créer l’admin, mais ce n’est pas un seed CLI automatique.
