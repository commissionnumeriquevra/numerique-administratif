/* =========================================================
   Chapitres et leçons projetées
   - AN.chapters.register({ id, title, icon, ... , slides: [...] })
   - AN.lesson.open(id)  : projette la leçon (plein écran, flèches, télécommande)
   - AN.lesson.demo(id)  : projette le 1er exercice pour le faire avec le groupe
   Diapositive : { title, html, theme? }. Les éléments [data-reveal] apparaissent
   un par un (flèche droite / clic), les [data-flip] se retournent au clic.
   Aucune note formateur n'est affichée à l'écran.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const list = [];

  const chapters = {
    register(ch) { list.push(ch); },
    get all() { return list; },
    get: id => list.find(c => c.id === id)
  };

  let session = null; // { ch, i, overlay, onKey, cleanup }

  function overlay(cls) {
    const o = document.createElement("div");
    o.className = "lesson-overlay " + cls;
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    document.body.appendChild(o);
    document.documentElement.classList.add("projecting");
    return o;
  }

  function close() {
    if (!session) return;
    if (session.game?.running) session.game.stop();
    session.cleanup?.();
    try { session.unmount?.(); } catch (e) {}
    document.removeEventListener("keydown", session.onKey, true);
    session.overlay.remove();
    document.documentElement.classList.remove("projecting");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    const back = session.onClose; session = null; back?.();
  }
  const toggleFull = () => document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen?.().catch(() => {});

  /* ---------------- leçon ---------------- */
  /** Un chapitre peut contenir plusieurs leçons (ch.lessons) ; sinon ch.slides. */
  function lessonOf(ch, lessonId) {
    const l = (ch.lessons || []).find(x => x.id === lessonId) || (ch.lessons || [])[0];
    const src = l ? l.slides : ch.slides;
    return { lesson: l, slides: typeof src === "function" ? src() : src };
  }

  function open(id, { onDemo, onAssign, onClose, onGame, start = 0, lesson: lessonId } = {}) {
    const ch = chapters.get(id); if (!ch) return;
    close();
    const { lesson, slides } = lessonOf(ch, lessonId);
    const o = overlay("lesson");
    session = { ch, i: Math.min(start, slides.length - 1), overlay: o, onClose };

    const draw = () => {
      const s = slides[session.i];
      o.innerHTML = `<div class="lesson-stage" style="--ch:${ch.color || "#7050bf"}">
          <div class="lesson-slide ${s.theme || ""} ${s.game ? "game" : ""}" aria-live="polite">
            <div class="lesson-badge">${lesson?.icon || ch.icon} ${esc(lesson?.badge || ch.title)}</div>
            ${s.title ? `<h1>${s.title}</h1>` : ""}
            <div class="lesson-body">${s.game ? AN.games.slide(s.game) : s.html}</div>
          </div>
          <nav class="lesson-bar" aria-label="Navigation de la leçon">
            <button type="button" data-l="prev" aria-label="Diapositive précédente" ${session.i === 0 ? "disabled" : ""}>◀</button>
            <div class="lesson-dots">${slides.map((_, k) => `<button type="button" class="${k === session.i ? "on" : k < session.i ? "seen" : ""}" data-l="go" data-k="${k}" aria-label="Diapositive ${k + 1}"></button>`).join("")}</div>
            <span class="lesson-count">${session.i + 1} / ${slides.length}</span>
            <button type="button" data-l="next" aria-label="Suivant">▶</button>
            <button type="button" data-l="full" aria-label="Plein écran" title="Plein écran (F)">⛶</button>
            <button type="button" data-l="close" aria-label="Fermer la leçon" title="Fermer (Échap)">✕</button>
          </nav></div>`;
      o.querySelector('[data-l="next"]').focus({ preventScroll: true });
      // diapositive interactive (ex : simulateur projeté) : mount(el) peut renvoyer une fonction de nettoyage
      try { session.unmount?.(); } catch (e) {}
      session.unmount = !s.game && s.mount ? s.mount(o.querySelector(".lesson-body")) : null;
    };
    const pending = () => [...o.querySelectorAll(".lesson-slide [data-reveal]:not(.shown)")];
    const next = () => {
      const p = pending();
      if (p.length) {
        // data-reveal="3" : tous les éléments du groupe 3 apparaissent ensemble (pastille + explication),
        // et les groupes numérotés apparaissent dans l'ordre des numéros.
        const nums = p.map(e => Number(e.dataset.reveal)).filter(n => n > 0);
        if (Number(p[0].dataset.reveal) > 0 || (nums.length && !p.some(e => !(Number(e.dataset.reveal) > 0)))) {
          const g = String(Math.min(...nums));
          p.filter(e => e.dataset.reveal === g).forEach(e => e.classList.add("shown"));
        } else p[0].classList.add("shown");
        return;
      }
      if (session.i < slides.length - 1) { session.i++; draw(); }
    };
    const prev = () => { if (session.i > 0) { session.i--; draw(); o.querySelectorAll("[data-reveal]").forEach(e => e.classList.add("shown")); } };

    o.addEventListener("click", e => {
      const launch = e.target.closest("[data-game-launch]");
      if (launch) {
        if (!onGame) { AN.util.toast("Les jeux se lancent depuis l'espace formateur, avec un groupe actif.", "info", 5000); return; }
        const body = o.querySelector(".lesson-body");
        const ctl = onGame(launch.dataset.gameLaunch, body, () => { session.game = null; if (session.i < slides.length - 1) session.i++; draw(); });
        if (ctl) { session.game = ctl; o.querySelector(".lesson-bar")?.classList.add("locked"); }
        return;
      }
      const flip = e.target.closest("[data-flip]");
      if (flip) { flip.classList.toggle("flipped"); return; }
      const act = e.target.closest("[data-lesson-act]");
      if (act) { const a = act.dataset.lessonAct; if (a === "demo") { close(); onDemo?.(id, act.dataset.type); } else if (a === "assign") onAssign?.(id); return; }
      const b = e.target.closest("[data-l]");
      if (b && session.game?.running && b.dataset.l !== "close" && b.dataset.l !== "full") return;
      if (b) {
        const a = b.dataset.l;
        if (a === "next") next(); else if (a === "prev") prev(); else if (a === "close") close(); else if (a === "full") toggleFull();
        else if (a === "go") { session.i = Number(b.dataset.k); draw(); }
        return;
      }
      // clic dans la diapositive : révèle l'élément suivant (comme la télécommande)
      if (e.target.closest(".lesson-slide") && !e.target.closest("a,button,input,select,textarea,.fx")) { if (pending().length) next(); }
    });
    session.onKey = e => {
      if (e.target.closest?.("input,textarea,select,.fx") || document.querySelector("dialog[open]")) return;
      if (session.game?.running) return; // pendant un jeu, le clavier ne change pas de diapositive
      const k = e.key;
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); next(); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
      else if (k === "Home") { session.i = 0; draw(); }
      else if (k === "End") { session.i = slides.length - 1; draw(); }
      else if (k === "Escape" && !document.fullscreenElement) close();
      else if (k === "f" || k === "F") toggleFull();
    };
    document.addEventListener("keydown", session.onKey, true);
    draw();
  }

  /* ---------------- exercice collectif ---------------- */
  function demo(id, { onClose, onAssign, type } = {}) {
    const ch = chapters.get(id); if (!ch) return;
    close();
    const mtype = type || ch.demo;
    const o = overlay("demo");
    const levels = [["beginner", "Débutant"], ["intermediate", "Intermédiaire"], ["expert", "Expert"]];
    let level = "beginner", stop = null;
    session = { ch, overlay: o, onClose };
    o.innerHTML = `<div class="demo-shell" style="--ch:${ch.color || "#7050bf"}">
      <header class="demo-head"><div><span class="lesson-badge">${ch.icon} ${esc(ch.title)} · exercice collectif</span>
        <strong>${esc(AN.catalog.label(mtype))}</strong></div>
        <div class="demo-tools"><label>Niveau <select data-d="level">${levels.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select></label>
          <button type="button" data-d="restart">↺ Recommencer</button>
          ${onAssign ? `<button type="button" data-d="assign" class="demo-go">🚀 À vous ! Donner le chapitre au groupe</button>` : ""}
          <button type="button" data-d="full" title="Plein écran (F)">⛶</button><button type="button" data-d="close" title="Fermer">✕</button></div></header>
      <div class="demo-note">🎓 Mode projection : on fait l'exercice ensemble, rien n'est enregistré.</div>
      <div class="mission-shell demo-stage"><div class="demo-content"></div></div></div>`;
    let box = o.querySelector(".demo-content");
    const run = () => {
      stop?.();
      const fresh = document.createElement("div"); // élément neuf : pas d'écouteurs en double
      fresh.className = "demo-content";
      box.replaceWith(fresh); box = fresh;
      stop = AN.missions.openDemo(mtype, box, { level, onBack: close });
    };
    session.cleanup = () => stop?.();
    o.querySelector('[data-d="level"]').addEventListener("change", e => { level = e.target.value; run(); });
    o.addEventListener("click", e => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      const a = b.dataset.d;
      if (a === "restart") run(); else if (a === "close") close(); else if (a === "full") toggleFull(); else if (a === "assign") onAssign?.(id);
    });
    session.onKey = e => {
      if (e.target.closest?.("input,textarea,select") || document.querySelector("dialog[open]")) return;
      if (e.key === "Escape" && o.querySelector(".bk-fs")) return; // Échap sert à quitter la fausse alerte du navigateur simulé
      if (e.key === "Escape" && !document.fullscreenElement) close();
      else if ((e.key === "f" || e.key === "F") && !e.ctrlKey) toggleFull();
    };
    document.addEventListener("keydown", session.onKey, true);
    run();
  }

  AN.chapters = chapters;
  AN.lesson = { open, demo, close, get active() { return !!session; } };
})(window.AN);
