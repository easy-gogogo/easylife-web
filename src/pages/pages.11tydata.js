// Gilt für alle Seiten in src/pages: Sprache, URL, Titel & Beschreibung aus den Texten
import fs from "node:fs";
import * as yaml from "js-yaml";
import { merge, outputPath } from "../_lib/helpers.js";

const load = (lang, file) => {
  const p = `src/_data/texts/${lang}/${file}.yml`;
  return fs.existsSync(p) ? yaml.load(fs.readFileSync(p, "utf8")) : {};
};
const Lof = (d) => d.L ?? d.R?.L;
const meta = (d) => {
  const lang = Lof(d)?.code;
  if (!lang || !d.contentFile) return {};
  const c = merge(load("en", d.contentFile), load(lang, d.contentFile));
  return d.R ? c.products?.[d.R.key]?.meta ?? {} : c.meta ?? {};
};

export default {
  layout: "base.njk",
  eleventyComputed: {
    lang: (d) => Lof(d)?.code ?? d.lang,
    pageKey: (d) => (d.R ? d.R.key : d.pageKey),
    title: (d) => meta(d).title ?? d.title,
    description: (d) => meta(d).description ?? d.description,
    permalink: (d) => {
      const key = d.R ? d.R.key : d.pageKey;
      return Lof(d) ? outputPath(key, Lof(d).code) : false;
    },
  },
};
