// Mobiles Menü auf-/zuklappen
document.querySelectorAll(".nav-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const menu = btn.closest(".navmenu");
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
});

// Bildkarussell in Angebotskarten (Pfeile + Punkte, Wischen geht nativ)
document.querySelectorAll(".carousel").forEach((c) => {
  const track = c.querySelector(".carousel-track");
  const dots = [...c.querySelectorAll(".car-dots i")];
  const go = (dir) => {
    const w = track.clientWidth, max = track.scrollWidth - w;
    let x = track.scrollLeft + dir * w;
    if (x > max + 5) x = 0; else if (x < -5) x = max;
    track.scrollTo({ left: x, behavior: "smooth" });
  };
  c.querySelector(".prev")?.addEventListener("click", () => go(-1));
  c.querySelector(".next")?.addEventListener("click", () => go(1));
  const mark = () => { const i = Math.round(track.scrollLeft / track.clientWidth); dots.forEach((d, k) => d.classList.toggle("on", k === i)); };
  track.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true });
  mark();
});

// Teilen-Knopf: natives Teilen (Handy) oder Link kopieren (Desktop)
document.querySelectorAll(".share-btn").forEach((b) => {
  b.addEventListener("click", async (e) => {
    e.preventDefault(); e.stopPropagation();
    const t = b.dataset.share || "";
    const url = t.startsWith("#") ? location.origin + location.pathname + t : new URL(t, location.href).href;
    const title = b.dataset.title || document.title;
    if (navigator.share) { try { await navigator.share({ title, url }); return; } catch (err) { if (err.name === "AbortError") return; } }
    try { await navigator.clipboard.writeText(url); } catch (err) { window.prompt(title, url); return; }
    let toast = document.querySelector(".share-toast");
    if (!toast) { toast = document.createElement("div"); toast.className = "share-toast"; toast.setAttribute("role", "status"); document.body.appendChild(toast); }
    toast.textContent = b.dataset.copied || "Link copied";
    toast.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
  });
});
