# Baut aus _site die Ordner "hochladen" und "hochladen-offline".
# Aufruf: python3 package.py <ziel-ordner>
import os, re, sys, shutil, base64, posixpath

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_site")
OUT = sys.argv[1]
UP, OFF = f"{OUT}/hochladen", f"{OUT}/hochladen-offline"
DOMAINS = ["easylifevietnam.com", "einfachasien.com"]

README_UP = """EasyLife Websites – so lädst du hoch
====================================

Jeder Ordner hier = eine Domain. Lade den INHALT des Ordners in das Hauptverzeichnis der Domain hoch
(per FTP, z. B. FileZilla, oder im Dateimanager deines Hosters):

  easylifevietnam.com\\   ->  easylifevietnam.com   (Englisch + /vi/ + /ko/)
  einfachasien.com\\      ->  einfachasien.com      (Deutsch)
  hostelhoian.com\\       ->  hostelhoian.com       (nur Weiterleitung auf die neue Hostel-Seite)

Wichtig: Die Datei ".htaccess" in jedem Ordner muss mit hoch (Weiterleitungen, https).
Unter Windows ist sie evtl. versteckt: Explorer > Ansicht > Ausgeblendete Elemente einblenden.

Diese Datei (LIESMICH.txt) selbst NICHT hochladen.

Per Doppelklick sehen die Seiten hier auf dem PC ohne Design aus – das ist normal.
Zum Anschauen auf dem PC gibt es den Ordner "hochladen-offline".

Änderungen (Preise, Texte, neue Produkte, neue Artikel):
Einfach Claude sagen, was sich ändern soll. Die Vorlage ("Werkstatt") ist im Claude-Projekt
"New Website" gespeichert (easylife-web-werkstatt-sicherung.txt). Claude baut daraus neu,
du lädst den neuen Ordner hoch.
"""
README_OFF = """Offline-Vorschau der EasyLife Websites
======================================

Zum Anschauen auf dem PC: Doppelklick auf
  easylifevietnam.com\\index.html   (Englisch, Vietnamesisch, Koreanisch)
  einfachasien.com\\index.html      (Deutsch)

Menü, Bilder und Sprachwechsel funktionieren offline.
WhatsApp-, Instagram-, Booking.com- und Google-Maps-Links brauchen Internet.

Diesen Ordner NICHT hochladen – auf den Server kommt nur der Ordner "hochladen".
"""

def prune_empty(root):
    for d, subs, files in sorted(os.walk(root), key=lambda x: -len(x[0])):
        if d != root and not os.listdir(d):
            os.rmdir(d)

for p in (UP, OFF):
    shutil.rmtree(p, ignore_errors=True)

# ---------- hochladen ----------
shutil.copytree(SITE, UP)
prune_empty(UP)
open(f"{UP}/LIESMICH.txt", "w", encoding="utf-8").write(README_UP)

# ---------- hochladen-offline ----------
def font_inline(css_path):
    base = os.path.dirname(css_path)
    css = open(css_path, encoding="utf-8").read()
    def rep(m):
        u = m.group(1)
        f = os.path.normpath(os.path.join(base, "../..", u.lstrip("/")) if u.startswith("/") else os.path.join(base, u))
        return "url(data:font/woff2;base64," + base64.b64encode(open(f, "rb").read()).decode() + ")"
    return re.sub(r"url\(['\"]?([^)'\"]+\.woff2)['\"]?\)", rep, css)

for dom in DOMAINS:
    dst = f"{OFF}/{dom}"
    shutil.copytree(f"{SITE}/{dom}", dst)
    for f in (".htaccess", "_redirects", "sitemap.xml", "robots.txt"):
        if os.path.exists(f"{dst}/{f}"):
            os.remove(f"{dst}/{f}")
    css = f"{dst}/assets/css/fonts.css"
    data = font_inline(css)
    open(css, "w", encoding="utf-8").write(data)
    shutil.rmtree(f"{dst}/assets/fonts", ignore_errors=True)

def rel(from_dir, target):
    return posixpath.relpath(target, from_dir) if target != from_dir else "."

for dom in DOMAINS:
    root = f"{OFF}/{dom}"
    for d, _, files in os.walk(root):
        for fn in files:
            if not fn.endswith(".html"):
                continue
            path = f"{d}/{fn}"
            here = "/" + os.path.relpath(d, root).replace(os.sep, "/").strip(".").strip("/")
            here = here.rstrip("/") or "/"
            s = open(path, encoding="utf-8").read()
            s = re.sub(r'<link rel="preload"[^>]*as="font"[^>]*>\n?', "", s)

            def fix(url, cross_dom=None):
                frag = ""
                if "#" in url:
                    url, frag = url.split("#", 1)
                    frag = "#" + frag
                if url.endswith("/"):
                    url += "index.html"
                target = url if cross_dom is None else f"/../{cross_dom}{url}"
                if cross_dom:
                    r = posixpath.relpath("/" + cross_dom + url, "/" + dom + here)
                else:
                    r = posixpath.relpath(url, here)
                return r + frag

            def attr(m):
                tag, name, q, url = m.group(1), m.group(2), m.group(3), m.group(4)
                if url.startswith("//"):
                    return m.group(0)
                if url.startswith("/"):
                    return f'{tag}{name}={q}{fix(url)}{q}'
                mm = re.match(r"https://(easylifevietnam\.com|einfachasien\.com)(/.*)?$", url)
                if mm and tag.lstrip().startswith("<a"):
                    return f'{tag}{name}={q}{fix(mm.group(2) or "/", mm.group(1))}{q}'
                return m.group(0)
            s = re.sub(r'(<(?:a|img|script|link rel="stylesheet"|link rel="icon")[^>]*?\s)(href|src)=(["\'])([^"\']*)\3', attr, s)
            # mehrere Attribute pro Tag: zweiter Durchlauf fängt weitere Treffer
            s = re.sub(r'(<(?:a|img|script|link rel="stylesheet"|link rel="icon")[^>]*?\s)(href|src)=(["\'])([^"\']*)\3', attr, s)
            open(path, "w", encoding="utf-8").write(s)

prune_empty(OFF)
open(f"{OFF}/LIESMICH.txt", "w", encoding="utf-8").write(README_OFF)
print("ok")
