# EasyLife Websites

Quelle für easylifevietnam.com (EN, /vi/, /ko/, /fr/, /zh/), einfachasien.com (DE) und hostelhoian.com (Weiterleitung).

- Texte: `src/_data/texts/<sprache>/*.yml` – fehlende Texte fallen auf Englisch zurück. In Listen mit `id` (Aktivitäten, Transfers) stehen Bilder und Links nur in der englischen Datei.
- Preise: Aktivitäten- und Transfer-Preise stehen im Text jeder Sprache (en, de, vi, ko, fr, zh) – bei Änderungen überall anpassen. Busfahrpläne nur in `texts/en/transport.yml` (`bus.north/south.rows`).
- Kontakt, Social, Booking-Links: `src/_data/site.json`
- Verleih: `src/_data/rentals.json`, Reisetipps: `src/travel-tips/<sprache>/*.md`

Bauen: `npm install` und `npx @11ty/eleventy` → `_site/<domain>/`
Upload-Ordner: `python3 tools/package.py <ziel>` → `hochladen/` und `hochladen-offline/`
