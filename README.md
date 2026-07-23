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

### 2. Hébergement
Le plus simple, **Netlify Drop** : va sur <https://app.netlify.com/drop> et glisse
le dossier `Contact_Fournisseur` dans la page. Tu obtiens une URL publique immédiate,
utilisable sur téléphone. (Alternatives : Vercel, Cloudflare Pages, GitHub Pages.)

Pour mettre à jour le site plus tard : re-glisse le dossier modifié.

## Sécurité — à lire

Par défaut (`schema.sql`, option A), toute personne connaissant l'URL du site peut lire
et modifier les fiches. Acceptable pour une URL non partagée ; à éviter si tu diffuses
le lien. Pour restreindre l'accès, applique l'**option B** du `schema.sql` (accès réservé
aux utilisateurs connectés) — dis-le moi et j'ajoute l'écran de connexion.

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
