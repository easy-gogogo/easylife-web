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
