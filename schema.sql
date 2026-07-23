-- ══════════════════════════════════════════════════════════════
--  Contacts Fournisseurs — schéma Supabase
--  À coller dans Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════

create table if not exists public.fournisseurs (
  id              uuid primary key default gen_random_uuid(),
  entreprise      text not null,
  contact_nom     text,
  fonction        text,
  telephone       text,
  email           text,
  site_web        text,
  adresse         text,
  ville           text,
  categorie       text,
  mots_cles       text[] default '{}',
  notes           text,
  date_rencontre  date,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists fournisseurs_entreprise_idx on public.fournisseurs (entreprise);
create index if not exists fournisseurs_categorie_idx  on public.fournisseurs (categorie);
create index if not exists fournisseurs_mots_cles_idx  on public.fournisseurs using gin (mots_cles);

alter table public.fournisseurs enable row level security;

-- ── Accès ─────────────────────────────────────────────────────
-- OPTION A (par défaut) : site privé, lecture/écriture ouvertes à la clé anon.
-- Simple, mais toute personne connaissant l'URL du site peut lire et modifier.
drop policy if exists "acces_public" on public.fournisseurs;
create policy "acces_public" on public.fournisseurs
  for all using (true) with check (true);

-- OPTION B (recommandé si le site est public) : réservé aux utilisateurs connectés.
-- Supprime l'option A ci-dessus, décommente ci-dessous, puis crée ton compte
-- dans Supabase → Authentication → Users → Add user.
--
-- drop policy if exists "acces_public" on public.fournisseurs;
-- create policy "acces_connecte" on public.fournisseurs
--   for all to authenticated using (true) with check (true);

-- ── Mise à jour automatique de updated_at ─────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists fournisseurs_touch on public.fournisseurs;
create trigger fournisseurs_touch before update on public.fournisseurs
  for each row execute function public.touch_updated_at();
