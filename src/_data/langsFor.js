// Für jede Seite: in welchen (aktiven) Sprachen es sie gibt
import { routes, liveLanguages } from "../_lib/helpers.js";
export default () => {
  const r = routes(), out = {};
  for (const [key, byLang] of Object.entries(r)) out[key] = liveLanguages().filter((l) => byLang[l.code] !== undefined);
  return out;
};
