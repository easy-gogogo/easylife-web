// Hilfsfunktionen für Sprachen, URLs und Texte (normalerweise nicht bearbeiten)
import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

const ROOT = path.resolve("src");
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

export const languages = () => readJSON("_data/languages.json");
export const liveLanguages = () => languages().filter((l) => l.live);

// Tiefe Zusammenführung: fehlende Übersetzungen fallen auf Englisch zurück
export function merge(base, over) {
  if (Array.isArray(over)) return over;
  if (over === undefined || over === null) return base;
  if (typeof base !== "object" || typeof over !== "object" || Array.isArray(base)) return over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = merge(base?.[k], over[k]);
  return out;
}

// Reisetipps-Artikel einlesen (Frontmatter aus src/travel-tips/<sprache>/<datei>.md)
export function articles() {
  const dir = path.join(ROOT, "travel-tips");
  const list = [];
  if (!fs.existsSync(dir)) return list;
  for (const lang of fs.readdirSync(dir)) {
    const ldir = path.join(dir, lang);
    if (!fs.statSync(ldir).isDirectory()) continue;
    for (const file of fs.readdirSync(ldir)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(ldir, file), "utf8");
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      const fm = m ? yaml.load(m[1]) : {};
      if (fm.draft) continue;
      list.push({ lang, slug: file.replace(/\.md$/, ""), ...fm });
    }
  }
  return list;
}

// Alle URLs: statische Seiten + Verleih-Produkte + Reisetipps
let _cache = null, _stamp = 0;
export function resetCache() { _cache = null; }
export function routes() {
  if (_cache && Date.now() - _stamp < 3000) return _cache;
  const urls = readJSON("_data/urls.json");
  const rentals = readJSON("_data/rentals.json");
  const r = JSON.parse(JSON.stringify(urls));
  delete r._hinweis;
  for (const p of rentals) if (!p.hidden) r[p.key] = p.slug;
  for (const a of articles()) {
    const base = urls.tips?.[a.lang];
    if (!base) continue;
    (r["tip:" + a.key] ??= {})[a.lang] = `${base}${a.slug}/`;
  }
  _cache = r; _stamp = Date.now();
  return r;
}

export function urlFor(key, lang, fromLang) {
  const langs = languages();
  const r = routes()[key];
  if (!r || r[lang] === undefined) return null;
  const target = langs.find((l) => l.code === lang);
  const p = (target.pathPrefix || "") + r[lang];
  if (!fromLang) return `https://${target.domain}${p}`;
  const own = langs.find((l) => l.code === fromLang);
  return own && own.domain === target.domain ? p : `https://${target.domain}${p}`;
}

export function outputPath(key, lang) {
  const l = languages().find((x) => x.code === lang);
  return `/${l.domain}${l.pathPrefix || ""}${routes()[key][lang]}index.html`;
}
