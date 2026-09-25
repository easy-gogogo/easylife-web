# EasyLife Websites

Quelle für easylifevietnam.com (EN, /vi/, /ko/), einfachasien.com (DE) und hostelhoian.com (Weiterleitung).

- Texte: `src/_data/texts/<sprache>/*.yml`
- Kontakt, Social, Booking-Links: `src/_data/site.json`
- Verleih: `src/_data/rentals.json`, Reisetipps: `src/travel-tips/<sprache>/*.md`

Bauen: `npm install` und `npx @11ty/eleventy` → `_site/<domain>/`
Upload-Ordner: `python3 tools/package.py <ziel>` → `hochladen/` und `hochladen-offline/`
