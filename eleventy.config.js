// EasyLife Web – Eleventy-Konfiguration (normalerweise nicht bearbeiten)
// Ausgabe: _site/<domain>/...  (ein Unterordner je Domain)
import fs from "node:fs";
import * as yaml from "js-yaml";
import { merge, urlFor } from "./src/_lib/helpers.js";

export default function (eleventyConfig) {
  // Reste der ersten Version (nicht mehr benutzt)
  eleventyConfig.ignores.add("src/en/**");

  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Bilder, CSS, Schriften nach dem Bauen in jede Domain kopieren
  eleventyConfig.on("eleventy.after", () => {
    for (const domain of ["easylifevietnam.com", "einfachasien.com"]) {
      // Touren-Fotos (nur für die englische Aktivitäten-Seite) nur kopieren, wenn eine Seite der Domain sie nutzt
      const used = new Set();
      for (const f of fs.readdirSync(`_site/${domain}`, { recursive: true })) {
        if (String(f).endsWith(".html"))
          for (const m of fs.readFileSync(`_site/${domain}/${f}`, "utf8").matchAll(/\/images\/tours\/[^"')\s]+/g)) used.add("src" + m[0]);
      }
      fs.cpSync("src/images", `_site/${domain}/images`, {
        recursive: true,
        filter: (src) => !src.startsWith("src/images/tours/") || fs.statSync(src).isDirectory() || used.has(src),
      });
      fs.cpSync("src/assets", `_site/${domain}/assets`, { recursive: true });
    }
    fs.cpSync("redirects", "_site", { recursive: true });
  });
  eleventyConfig.addWatchTarget("src/assets/");
  eleventyConfig.addWatchTarget("src/_lib/");

  const lang = (ctx) => ctx.lang || "en";

  // Brotkrumen als schema.org-Liste
  eleventyConfig.addFilter("crumbList", function (crumbs) {
    const l = lang(this.ctx);
    const c = this.ctx.texts;
    const home = c[l]?.ui?.nav?.home ?? c.en.ui.nav.home;
    const items = [["home", home], ...(crumbs || [])];
    return items.map(([key, name], i) => ({ "@type": "ListItem", position: i + 1, name, item: urlFor(key, l) }));
  });
  // "villa" | link  -> URL der Seite in der aktuellen Sprache;  "villa" | link("de") -> andere Sprache
  eleventyConfig.addFilter("link", function (key, target) {
    // gibt es die Seite in dieser Sprache nicht, wird auf die englische verlinkt
    return urlFor(key, target || lang(this.ctx), lang(this.ctx)) || urlFor(key, "en", lang(this.ctx)) || "#";
  });
  // absolute URL (canonical, hreflang, schema)
  eleventyConfig.addFilter("abs", (key, l) => urlFor(key, l));

  // Texte der aktuellen Sprache (fehlende Felder -> Englisch)
  eleventyConfig.addFilter("cx", function (file) {
    const c = this.ctx.texts;
    return merge(c.en?.[file] ?? {}, c[lang(this.ctx)]?.[file]);
  });
  // "nav.stay" | t  -> Menü-/Button-Text
  eleventyConfig.addFilter("t", function (p) {
    const c = this.ctx.texts;
    const get = (d) => p.split(".").reduce((o, k) => (o ? o[k] : undefined), d);
    return get(c[lang(this.ctx)]?.ui) ?? get(c.en?.ui) ?? p;
  });
  // 200000 -> "200K"
  eleventyConfig.addFilter("vndShort", (n) => (n >= 1000000 ? n / 1000000 + "M" : n / 1000 + "K"));
  eleventyConfig.addFilter("wa", function (text) {
    return `${this.ctx.site.whatsapp}?text=${encodeURIComponent(text)}`;
  });
  eleventyConfig.addFilter("zipGallery", (srcs, alts) => (srcs || []).map((src, i) => ({ src, alt: (alts || [])[i] || "" })));
  eleventyConfig.addFilter("offerList", (cats, base) => {
    let n = 0; const out = [];
    for (const c of cats || []) for (const i of c.items) out.push({ "@type": "ListItem", position: ++n, name: i.title, url: base + "#" + i.id });
    return out;
  });
  eleventyConfig.addFilter("faqSchema", (faq) => (faq || []).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })));
  eleventyConfig.addFilter("offers", (prices, url, labels) =>
    (prices || []).map((p) => ({ "@type": "Offer", name: labels?.[p.id] ?? p.id, price: p.vnd, priceCurrency: "VND", url, availability: "https://schema.org/InStock" })));
  // Reisetipps, die auf ein Produkt/eine Seite verlinken (Frontmatter "related")
  eleventyConfig.addFilter("relatedTo", (arts, key) => (arts || []).filter((a) => (a.related || []).includes(key)));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("pluck", (arr, k) => (arr || []).map((x) => x[k]));
  eleventyConfig.addFilter("find", (arr, key, val) => (arr || []).find((x) => x[key] === val));
  eleventyConfig.addFilter("where", (arr, key, val) => (arr || []).filter((x) => x[key] === val));
  eleventyConfig.addFilter("isoDate", (d) => (d ? new Date(d).toISOString().slice(0, 10) : ""));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
