// Reisetipps: Sprache = Ordnername, URL aus urls.json ("tips") + Dateiname
import { outputPath } from "../_lib/helpers.js";
export default {
  layout: "article.njk",
  eleventyComputed: {
    lang: (d) => d.page.inputPath.split("/").slice(-2, -1)[0],
    tipKey: (d) => d.key,
    pageKey: (d) => "tip:" + d.key,
    permalink: (d) => (d.draft ? false : outputPath("tip:" + d.key, d.page.inputPath.split("/").slice(-2, -1)[0])),
  },
};
