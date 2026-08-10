/* ────────────────────────────────────────────────────────────────
   Configuration — stockage des fiches
   ----------------------------------------------------------------
   Backend actif : GitHub. Les fiches sont enregistrées dans le
   fichier fournisseurs.json de ce dépôt.

   - La LECTURE est publique (aucune clé nécessaire).
   - La MODIFICATION nécessite une clé personnelle GitHub, que tu
     colles une seule fois par appareil via le bouton « Connexion »
     du site. Cette clé reste dans ton navigateur : elle n'est
     jamais enregistrée dans le dépôt.

   Comment obtenir la clé : voir README.md, section « Modifier depuis
   un appareil », ou le bouton Connexion du site.
──────────────────────────────────────────────────────────────── */

window.APP_CONFIG = {
  BACKEND: "github",              // "github" | "local"
  GITHUB: {
    owner:  "nicolas9696-admin",
    repo:   "Contact_Fournisseur",
    path:   "fournisseurs.json",
    branch: "main",
  },

  // Ancien backend Supabase (désactivé, conservé pour mémoire) :
  // SUPABASE_URL: "https://dnlnfxuemudpjikkeunz.supabase.co",
  // SUPABASE_ANON_KEY: "sb_publishable_UfPSVHFJgrJOhkGuSTxq9Q_3kl9WBsD",
};
