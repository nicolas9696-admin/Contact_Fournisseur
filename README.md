# Contacts Fournisseurs

Répertoire dynamique des fournisseurs rencontrés : fiche complète, recherche instantanée
multi-mots (entreprise, contact, mot-clé, ville, téléphone…), filtres par catégorie et
mots-clés, import/export CSV.

Site statique (HTML/CSS/JS, aucun build) + base Supabase.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page |
| `styles.css` | Mise en forme (clair/sombre automatique, mobile) |
| `app.js` | Logique : recherche, filtres, CRUD, CSV |
| `config.js` | **Tes clés Supabase** (à remplir) |
| `schema.sql` | Table à créer dans Supabase |

## Essayer tout de suite (mode local)

Ouvre `index.html` dans un navigateur. Sans clés Supabase, les données sont stockées
dans le navigateur — pratique pour tester l'interface, mais liées à cet appareil.

## Mise en ligne (5–10 min)

### 1. Base de données
1. Crée un compte gratuit sur <https://supabase.com> puis un nouveau projet.
2. Onglet **SQL Editor** → colle le contenu de `schema.sql` → **Run**.
3. **Project Settings → API** : copie *Project URL* et la clé *anon public*.
4. Colle les deux valeurs dans `config.js`.

### 2. Hébergement — GitHub Pages

Le dépôt Git est déjà initialisé et le premier commit est fait.

1. Crée un dépôt vide sur <https://github.com/new> — nom `contact-fournisseur`,
   **sans** README ni .gitignore (le dossier en contient déjà).
   Le dépôt doit être **public** : GitHub Pages sur dépôt privé demande un compte payant.
2. Relie et envoie :
   ```bash
   git remote add origin https://github.com/<ton-pseudo>/contact-fournisseur.git
   git push -u origin main
   ```
3. Dépôt → **Settings → Pages** → *Source* : `Deploy from a branch`,
   *Branch* : `main` / `/ (root)` → **Save**.
4. Au bout d'une minute, le site est en ligne sur
   `https://<ton-pseudo>.github.io/contact-fournisseur/`

Mises à jour suivantes :
```bash
git add -A
git commit -m "Mise à jour"
git push
```

> Le dépôt étant public, `config.js` (donc ta clé Supabase *anon*) y sera visible.
> C'est prévu par Supabase — mais lis la section Sécurité ci-dessous avant de publier.

## Sécurité — à lire

Sur GitHub Pages, l'URL du site est publique et le code (donc la clé *anon*) est lisible
par tous. Avec l'option A du `schema.sql`, **n'importe qui pourrait lire et modifier tes
fiches fournisseurs**. Applique l'**option B** (accès réservé aux utilisateurs connectés)
avant de publier — dis-le moi et j'ajoute l'écran de connexion au site.

Le fichier `.gitignore` exclut déjà `a-importer.csv` et les photos : les coordonnées
de tes contacts ne partent pas sur GitHub.

La clé *anon* est faite pour être publique : c'est la politique RLS ci-dessus qui protège
réellement les données, pas la clé.

## Import CSV

Colonnes reconnues (insensibles aux accents/majuscules) :
`entreprise` (obligatoire), `contact`, `fonction`, `telephone`, `email`, `site`,
`adresse`, `ville`, `categorie`, `mots_cles` (ou `tags`, séparés par `;`),
`notes`, `date`. Séparateur `;` ou `,`.

## Raccourcis

- `Ctrl+K` ou `/` : aller à la recherche
- Clic sur un mot-clé d'une fiche : filtrer dessus
