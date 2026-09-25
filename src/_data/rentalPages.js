// Eine Seite pro Verleih-Produkt und Sprache
import fs from "node:fs";
import { liveLanguages } from "../_lib/helpers.js";
export default () => {
  const rentals = JSON.parse(fs.readFileSync("src/_data/rentals.json", "utf8"));
  const out = [];
  for (const r of rentals) if (!r.hidden) for (const L of liveLanguages()) if (r.slug[L.code]) out.push({ key: r.key, L });
  return out;
};
