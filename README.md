# Contacts Fournisseurs

Répertoire dynamique des fournisseurs rencontrés : fiche complète, recherche instantanée
multi-mots (entreprise, contact, mot-clé, ville, téléphone…), filtres par catégorie et
mots-clés, import/export CSV.

Site statique (HTML/CSS/JS, aucun build) hébergé sur **GitHub Pages**. Les fiches sont
stockées dans le fichier `fournisseurs.json` du dépôt — pas de serveur, rien qui se met
en pause.

**Site en ligne :** <https://nicolas9696-admin.github.io/Contact_Fournisseur/>

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page |
| `styles.css` | Mise en forme (clair/sombre automatique, mobile) |
| `app.js` | Logique : recherche, filtres, CRUD, CSV, connexion GitHub |
| `config.js` | Nom du dépôt qui sert de base (aucune clé secrète) |
| `fournisseurs.json` | **La base de données** : une entrée par fournisseur |
| `schema.sql` | Ancien schéma Supabase — conservé pour mémoire, plus utilisé |

## Comment ça marche

- **Lecture** : le site lit `fournisseurs.json` via l'API GitHub. Public, aucune clé
  nécessaire — le répertoire s'affiche pour quiconque ouvre l'URL.
- **Écriture** (ajout / modification / suppression / import) : nécessite une clé
  personnelle GitHub, collée une fois par appareil via le bouton **Connexion**. Chaque
  enregistrement crée un commit dans le dépôt. La clé reste dans le navigateur
  (`localStorage`) et n'est **jamais** publiée dans le dépôt.

## Modifier depuis un appareil (obtenir la clé)

À faire une seule fois par appareil (PC, téléphone…). Le site te guide aussi via le
bouton **Connexion**.

1. Ouvre <https://github.com/settings/personal-access-tokens/new> (connecte-toi si besoin).
2. *Token name* : par ex. `Contacts Fournisseurs`.
3. *Expiration* : **No expiration** (pour ne jamais être coupé).
4. *Repository access* → **Only select repositories** → coche `Contact_Fournisseur`.
5. *Permissions* → *Repository permissions* → **Contents** → **Read and write**.
6. **Generate token**, copie la clé (`github_pat_…`), puis colle-la dans le site via
   **Connexion → Se connecter**.

La clé donne uniquement le droit d'écrire dans ce dépôt. En cas de perte du téléphone,
tu peux la révoquer depuis les réglages GitHub sans rien casser d'autre.

## Sécurité

Le dépôt est public : **le contenu de `fournisseurs.json` est lisible par toute personne
qui trouve le dépôt ou l'URL du site**. C'est le choix assumé (accès ouvert en lecture).
Seule la modification est protégée par la clé.

Pour rendre les données privées il faudrait un dépôt privé (GitHub Pages privé = compte
payant) ou un autre hébergement. À demander si besoin.

Le `.gitignore` exclut `a-importer.csv`, les exports CSV et les photos : ces fichiers de
travail ne partent pas sur GitHub.

## Développer / tester en local

Ouvre `index.html` dans un navigateur. Pour tester sans toucher à la base GitHub, mets
`BACKEND: "local"` dans `config.js` : les fiches sont alors stockées dans le navigateur.

## Import CSV

Colonnes reconnues (insensibles aux accents/majuscules) :
`entreprise` (obligatoire), `contact`, `fonction`, `telephone`, `email`, `site`,
`adresse`, `ville`, `categorie`, `mots_cles` (ou `tags`, séparés par `;`),
`notes`, `date`. Séparateur `;` ou `,`.

## Raccourcis

- `Ctrl+K` ou `/` : aller à la recherche
- Clic sur un mot-clé ou une catégorie d'une fiche : filtrer dessus
