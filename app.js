/* Contacts Fournisseurs — application front (sans build) */
(() => {
"use strict";

const TABLE = "fournisseurs";
const LS_KEY = "contact_fournisseur_v1";
const FIELDS = ["entreprise","contact_nom","fonction","telephone","email","site_web",
                "adresse","ville","categorie","mots_cles","notes","date_rencontre"];

/* ── Couche de données : Supabase, ou navigateur si non configuré ── */
const cfg = window.APP_CONFIG || {};
const useSupabase = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
const sb = useSupabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const store = {
  async list() {
    if (!useSupabase) return readLocal();
    const { data, error } = await sb.from(TABLE).select("*");
    if (error) throw error;
    return data;
  },
  async save(rec) {
    if (!useSupabase) {
      const all = readLocal();
      if (rec.id) {
        const i = all.findIndex(r => r.id === rec.id);
        if (i >= 0) all[i] = { ...all[i], ...rec, updated_at: nowIso() };
      } else {
        all.push({ ...rec, id: uid(), created_at: nowIso(), updated_at: nowIso() });
      }
      writeLocal(all);
      return;
    }
    const payload = { ...rec, updated_at: nowIso() };
    if (!payload.id) delete payload.id;
    const { error } = await sb.from(TABLE).upsert(payload);
    if (error) throw error;
  },
  async remove(id) {
    if (!useSupabase) return writeLocal(readLocal().filter(r => r.id !== id));
    const { error } = await sb.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  },
  async saveMany(recs) {
    if (!useSupabase) {
      writeLocal(readLocal().concat(recs.map(r => ({ ...r, id: uid(), created_at: nowIso() }))));
      return;
    }
    const { error } = await sb.from(TABLE).insert(recs);
    if (error) throw error;
  },
};

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
}
function writeLocal(rows) { localStorage.setItem(LS_KEY, JSON.stringify(rows)); }
function uid() { return "loc-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function nowIso() { return new Date().toISOString(); }

/* ── État ── */
const state = { rows: [], q: "", cats: new Set(), tags: new Set(), sort: "entreprise" };

/* ── Raccourcis DOM ── */
const $ = sel => document.querySelector(sel);
const grid = $("#grid"), stateBox = $("#stateBox"), filters = $("#filters");
const dlg = $("#dlgForm"), form = $("#form");

/* ── Utilitaires texte ── */
const norm = s => (s ?? "").toString().toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "");
const esc = s => (s ?? "").toString()
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function haystack(r) {
  return norm([r.entreprise, r.contact_nom, r.fonction, r.telephone, r.email, r.site_web,
               r.adresse, r.ville, r.categorie, r.notes, (r.mots_cles || []).join(" ")].join(" "));
}
/** Surligne les termes de recherche dans un texte déjà échappé. */
function hl(text) {
  const out = esc(text);
  const terms = norm(state.q).split(/\s+/).filter(t => t.length > 1);
  if (!terms.length) return out;
  const plain = norm(out);
  const marks = [];
  for (const t of terms) {
    let i = plain.indexOf(t);
    while (i !== -1) { marks.push([i, i + t.length]); i = plain.indexOf(t, i + t.length); }
  }
  if (!marks.length) return out;
  marks.sort((a, b) => a[0] - b[0]);
  let res = "", cur = 0;
  for (const [s, e] of marks) {
    if (s < cur) continue;
    res += out.slice(cur, s) + "<mark>" + out.slice(s, e) + "</mark>";
    cur = e;
  }
  return res + out.slice(cur);
}

/* ── Filtrage & tri ── */
function visible() {
  const terms = norm(state.q).split(/\s+/).filter(Boolean);
  let rows = state.rows.filter(r => {
    if (state.cats.size && !state.cats.has(r.categorie || "—")) return false;
    if (state.tags.size && !(r.mots_cles || []).some(t => state.tags.has(t))) return false;
    if (!terms.length) return true;
    const h = haystack(r);
    return terms.every(t => h.includes(t));
  });
  const [key, dir] = state.sort.startsWith("-") ? [state.sort.slice(1), -1] : [state.sort, 1];
  rows.sort((a, b) => dir * String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "fr", { numeric: true }));
  return rows;
}

/* ── Rendu ── */
function render() {
  const rows = visible();
  const total = state.rows.length;
  $("#countLabel").textContent = total === 0 ? "Aucun fournisseur"
    : rows.length === total ? `${total} fournisseur${total > 1 ? "s" : ""}`
    : `${rows.length} / ${total} fournisseurs`;

  renderFilters();

  if (!total) {
    grid.innerHTML = "";
    stateBox.className = "state";
    stateBox.innerHTML = `<h2>Aucun fournisseur pour l'instant</h2>
      <p>Ajoute ton premier contact, ou importe un fichier CSV existant.</p>
      <button class="btn btn-primary" onclick="document.getElementById('btnNew').click()">+ Ajouter un fournisseur</button>`;
    return;
  }
  if (!rows.length) {
    grid.innerHTML = "";
    stateBox.className = "state";
    stateBox.innerHTML = `<h2>Aucun résultat</h2><p>Essaie un autre mot-clé ou retire les filtres.</p>`;
    return;
  }
  stateBox.innerHTML = "";
  grid.innerHTML = rows.map(cardHtml).join("");
}

function cardHtml(r) {
  const tel = (r.telephone || "").replace(/[^\d+]/g, "");
  const web = r.site_web ? (/^https?:\/\//i.test(r.site_web) ? r.site_web : "https://" + r.site_web) : "";
  const lieu = [r.adresse, r.ville].filter(Boolean).join(", ");
  const lines = [
    r.telephone && `<div class="line"><i>📞</i><a href="tel:${esc(tel)}">${hl(r.telephone)}</a></div>`,
    r.email     && `<div class="line"><i>✉️</i><a href="mailto:${esc(r.email)}">${hl(r.email)}</a></div>`,
    web         && `<div class="line"><i>🔗</i><a href="${esc(web)}" target="_blank" rel="noopener noreferrer">${hl(r.site_web)}</a></div>`,
    lieu        && `<div class="line"><i>📍</i><span>${hl(lieu)}</span></div>`,
    r.date_rencontre && `<div class="line"><i>📅</i><span>Rencontré le ${esc(frDate(r.date_rencontre))}</span></div>`,
  ].filter(Boolean).join("");

  const sub = [r.contact_nom, r.fonction].filter(Boolean).join(" · ");
  const cat = r.categorie
    ? `<button class="tag tag-cat" data-cardcat="${esc(r.categorie)}">${hl(r.categorie)}</button>` : "";
  const tags = cat + (r.mots_cles || []).map(t =>
    `<button class="tag" data-tag="${esc(t)}">${hl(t)}</button>`).join("");

  return `<article class="card">
    <div class="card-head">
      <div class="card-title">${hl(r.entreprise)}${sub ? `<div class="card-sub">${hl(sub)}</div>` : ""}</div>
      <button class="card-edit" data-edit="${esc(r.id)}" title="Modifier">✏️</button>
    </div>
    ${lines ? `<div class="card-lines">${lines}</div>` : ""}
    ${r.notes ? `<div class="card-notes">${hl(r.notes)}</div>` : ""}
    ${tags ? `<div class="card-tags">${tags}</div>` : ""}
  </article>`;
}

function frDate(d) {
  const t = new Date(d + "T00:00:00");
  return isNaN(t) ? d : t.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function renderFilters() {
  const cats = new Map(), tags = new Map();
  for (const r of state.rows) {
    if (r.categorie) cats.set(r.categorie, (cats.get(r.categorie) || 0) + 1);
    for (const t of r.mots_cles || []) tags.set(t, (tags.get(t) || 0) + 1);
  }
  const chip = (label, n, on, attr) =>
    `<button class="chip${on ? " on" : ""}" ${attr}="${esc(label)}">${esc(label)}<span class="n">${n}</span></button>`;

  const catHtml = [...cats].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0],"fr"))
    .map(([c,n]) => chip(c, n, state.cats.has(c), "data-cat")).join("");
  const tagHtml = [...tags].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0],"fr")).slice(0, 40)
    .map(([t,n]) => chip(t, n, state.tags.has(t), "data-filtertag")).join("");

  $("#catChips").innerHTML = catHtml;
  $("#tagChips").innerHTML = tagHtml;
  $("#catChips").parentElement.hidden = !catHtml;
  $("#tagChips").parentElement.hidden = !tagHtml;
  filters.hidden = !catHtml && !tagHtml;
}

/* ── Formulaire ── */
let editingId = null;

function openForm(rec) {
  editingId = rec?.id || null;
  $("#formTitle").textContent = editingId ? "Modifier le fournisseur" : "Nouveau fournisseur";
  $("#btnDelete").hidden = !editingId;
  form.reset();
  for (const f of FIELDS) {
    const el = form.elements[f];
    if (!el) continue;
    el.value = f === "mots_cles" ? (rec?.mots_cles || []).join(", ") : (rec?.[f] ?? "");
  }
  fillDatalists();
  renderTagSuggest();
  dlg.showModal();
  setTimeout(() => $("#f_entreprise").focus(), 30);
}

function fillDatalists() {
  const uniq = key => [...new Set(state.rows.map(r => r[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"fr"));
  $("#listVilles").innerHTML = uniq("ville").map(v => `<option value="${esc(v)}">`).join("");
  $("#listCategories").innerHTML = uniq("categorie").map(v => `<option value="${esc(v)}">`).join("");
}

function renderTagSuggest() {
  const counts = new Map();
  for (const r of state.rows) for (const t of r.mots_cles || []) counts.set(t, (counts.get(t)||0)+1);
  const top = [...counts].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([t]) => t);
  $("#tagSuggest").innerHTML = top.map(t => `<button type="button" class="chip" data-addtag="${esc(t)}">+ ${esc(t)}</button>`).join("");
}

function formToRecord() {
  const rec = {};
  for (const f of FIELDS) {
    const el = form.elements[f];
    if (!el) continue;
    let v = el.value.trim();
    if (f === "mots_cles") {
      rec[f] = [...new Set(v.split(",").map(s => s.trim()).filter(Boolean))];
    } else {
      rec[f] = v || null;
    }
  }
  if (editingId) rec.id = editingId;
  return rec;
}

/* ── CSV ── */
function toCsv(rows) {
  const cols = ["entreprise","contact_nom","fonction","telephone","email","site_web",
                "adresse","ville","categorie","mots_cles","notes","date_rencontre"];
  const cell = v => {
    const s = Array.isArray(v) ? v.join("; ") : (v ?? "");
    return /[";\n\r]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : s;
  };
  return "﻿" + [cols.join(";"), ...rows.map(r => cols.map(c => cell(r[c])).join(";"))].join("\r\n");
}

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const sep = (text.split("\n")[0].match(/;/g) || []).length >= (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let cur = [""], q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i+1] === '"') { cur[cur.length-1] += '"'; i++; }
      else if (c === '"') q = false;
      else cur[cur.length-1] += c;
    } else if (c === '"') q = true;
    else if (c === sep) cur.push("");
    else if (c === "\n") { rows.push(cur); cur = [""]; }
    else if (c !== "\r") cur[cur.length-1] += c;
  }
  if (cur.some(v => v !== "")) rows.push(cur);
  if (rows.length < 2) return [];

  const head = rows[0].map(h => norm(h).trim().replace(/\s+/g, "_"));
  const alias = {
    entreprise:"entreprise", societe:"entreprise", nom_entreprise:"entreprise", fournisseur:"entreprise",
    contact:"contact_nom", contact_nom:"contact_nom", nom:"contact_nom", nom_contact:"contact_nom",
    fonction:"fonction", poste:"fonction",
    telephone:"telephone", tel:"telephone", portable:"telephone", mobile:"telephone",
    email:"email", mail:"email", courriel:"email",
    site_web:"site_web", site:"site_web", web:"site_web",
    adresse:"adresse", ville:"ville", cp_ville:"ville",
    categorie:"categorie", type:"categorie", secteur:"categorie",
    mots_cles:"mots_cles", tags:"mots_cles", mot_cle:"mots_cles",
    notes:"notes", note:"notes", commentaire:"notes", remarques:"notes",
    date_rencontre:"date_rencontre", date:"date_rencontre",
  };
  const out = [];
  for (const raw of rows.slice(1)) {
    const rec = {};
    head.forEach((h, i) => {
      const key = alias[h];
      if (!key) return;
      const v = (raw[i] ?? "").trim();
      if (!v) return;
      rec[key] = key === "mots_cles" ? v.split(/[;,|]/).map(s => s.trim()).filter(Boolean) : v;
    });
    if (!rec.entreprise) continue;
    if (!rec.mots_cles) rec.mots_cles = [];
    if (rec.date_rencontre && !/^\d{4}-\d{2}-\d{2}$/.test(rec.date_rencontre)) {
      const m = rec.date_rencontre.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
      rec.date_rencontre = m ? `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}` : null;
    }
    out.push(rec);
  }
  return out;
}

/* ── Toast ── */
let toastTimer;
function toast(msg, isErr) {
  const el = $("#toast");
  el.textContent = msg;
  el.className = "toast" + (isErr ? " err" : "");
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, isErr ? 6000 : 2800);
}

/* ── Chargement ── */
async function refresh() {
  try {
    state.rows = (await store.list()).map(r => ({ ...r, mots_cles: r.mots_cles || [] }));
    render();
  } catch (e) {
    grid.innerHTML = "";
    stateBox.className = "state error";
    stateBox.innerHTML = `<h2>Connexion à la base impossible</h2>
      <p>${esc(e.message || e)}</p>
      <p style="margin-top:8px">Vérifie <code>config.js</code> et que la table <code>fournisseurs</code> existe (voir <code>schema.sql</code>).</p>`;
  }
}

/* ── Événements ── */
$("#search").addEventListener("input", e => {
  state.q = e.target.value;
  $("#clearSearch").hidden = !state.q;
  render();
});
$("#clearSearch").addEventListener("click", () => {
  state.q = ""; $("#search").value = ""; $("#clearSearch").hidden = true; render(); $("#search").focus();
});
$("#sortSelect").addEventListener("change", e => { state.sort = e.target.value; render(); });

filters.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.cat !== undefined) toggle(state.cats, b.dataset.cat);
  else if (b.dataset.filtertag !== undefined) toggle(state.tags, b.dataset.filtertag);
  else return;
  render();
});
function toggle(set, v) { set.has(v) ? set.delete(v) : set.add(v); }

grid.addEventListener("click", e => {
  const edit = e.target.closest("[data-edit]");
  if (edit) return openForm(state.rows.find(r => String(r.id) === edit.dataset.edit));
  const tag = e.target.closest("[data-tag]");
  if (tag) { toggle(state.tags, tag.dataset.tag); render(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  const cat = e.target.closest("[data-cardcat]");
  if (cat) { toggle(state.cats, cat.dataset.cardcat); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }
});

$("#btnNew").addEventListener("click", () => openForm(null));
dlg.addEventListener("click", e => { if (e.target.closest("[data-close]")) dlg.close(); });

$("#tagSuggest").addEventListener("click", e => {
  const b = e.target.closest("[data-addtag]");
  if (!b) return;
  const input = $("#f_mots_cles");
  const cur = input.value.split(",").map(s => s.trim()).filter(Boolean);
  if (!cur.includes(b.dataset.addtag)) cur.push(b.dataset.addtag);
  input.value = cur.join(", ");
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("#btnSave");
  btn.disabled = true;
  try {
    await store.save(formToRecord());
    dlg.close();
    await refresh();
    toast(editingId ? "Fournisseur mis à jour" : "Fournisseur ajouté");
  } catch (err) {
    toast("Erreur : " + (err.message || err), true);
  } finally {
    btn.disabled = false;
  }
});

$("#btnDelete").addEventListener("click", async () => {
  const rec = state.rows.find(r => r.id === editingId);
  if (!confirm(`Supprimer définitivement « ${rec?.entreprise ?? ""} » ?`)) return;
  try {
    await store.remove(editingId);
    dlg.close();
    await refresh();
    toast("Fournisseur supprimé");
  } catch (err) { toast("Erreur : " + (err.message || err), true); }
});

$("#btnExport").addEventListener("click", () => {
  if (!state.rows.length) return toast("Rien à exporter", true);
  const blob = new Blob([toCsv(visible())], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `fournisseurs-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$("#btnImport").addEventListener("click", () => $("#fileCsv").click());
$("#fileCsv").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";
  try {
    const recs = parseCsv(await file.text());
    if (!recs.length) return toast("Aucune ligne exploitable (colonne « entreprise » requise)", true);
    if (!confirm(`Importer ${recs.length} fournisseur(s) ?`)) return;
    await store.saveMany(recs);
    await refresh();
    toast(`${recs.length} fournisseur(s) importé(s)`);
  } catch (err) { toast("Import impossible : " + (err.message || err), true); }
});

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); $("#search").focus(); $("#search").select(); }
  if (e.key === "/" && document.activeElement === document.body) { e.preventDefault(); $("#search").focus(); }
});

/* ── Démarrage ── */
if (!useSupabase) {
  toast("Mode local : renseigne config.js pour synchroniser en ligne");
}
refresh();

})();
