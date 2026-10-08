/* =========================================================
   Chapitre « Souris et clavier » (esprit Clic Master / Clavinator)
   8 niveaux progressifs, note /20 à la fin de chacun :
   1 Le réveil des bulles (viser, cliquer) · 2 Le menu secret (clic droit)
   3 Le double-clic · 4 Le grand ménage (glisser-déposer, molette)
   5 Les lettres et « lire avant d'agir » · 6 Accents, circonflexes, @
   7 Le curseur, Effacer, Entrée, Ctrl + Z · 8 Mission réelle
   Principe : on peut toujours continuer après une erreur, et chaque
   erreur reçoit un « petit rappel bienveillant ».
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "Souris et clavier", ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const listen = (ctx, target, type, fn, opt) => { target.addEventListener(type, fn, opt); ctx.onCleanup(() => target.removeEventListener(type, fn, opt)); };
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const kindly = h => `<div class="alert sc-kind"><b>🫶 Un petit rappel bienveillant</b><br>${h}</div>`;
  const good = h => `<div class="alert good">${h}</div>`;

  function tasker(panel, tasks, { head = "" } = {}) {
    let note = "";
    const draw = () => {
      const cur = tasks.find(t => !t.done);
      panel.innerHTML = head + tasksHTML(tasks.map(t => ({ done: t.done, label: t === cur ? `<b>👉</b> ${t.label}` : t.label }))) + `<div class="mk-fb">${note}</div><div class="mk-q-slot"></div>`;
    };
    draw();
    return {
      tasks, draw,
      done(k) { const t = tasks.find(t => t.k === k); if (!t || t.done) return false; t.done = true; note = ""; draw(); return true; },
      is: k => !!tasks.find(t => t.k === k)?.done,
      get all() { return tasks.every(t => t.done); },
      get next() { return tasks.find(t => !t.done); },
      note(h) { note = h; const e = panel.querySelector(".mk-fb"); if (e) e.innerHTML = h; },
      slot: () => panel.querySelector(".mk-q-slot")
    };
  }

  /* ---------- le « menu secret » (clic droit) ---------- */
  function ctxMenu(ctx, stage, e, items, onPick) {
    stage.querySelector(".sc-ctx")?.remove();
    const r = stage.getBoundingClientRect();
    const m = document.createElement("div"); m.className = "sc-ctx"; m.setAttribute("role", "menu");
    m.style.left = Math.min(e.clientX - r.left, r.width - 230) + "px"; m.style.top = Math.min(e.clientY - r.top, r.height - 40 * items.length - 16) + "px";
    m.innerHTML = items.map((x, i) => `<button type="button" role="menuitem" data-i="${i}">${x}</button>`).join("");
    stage.appendChild(m);
    const close = how => { m.remove(); document.removeEventListener("keydown", key, true); stage.removeEventListener("pointerdown", out, true); onPick(null, how); };
    const key = ev => { if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); close("esc"); } };
    const out = ev => { if (!m.contains(ev.target)) close("outside"); };
    m.addEventListener("click", ev => { const b = ev.target.closest("[data-i]"); if (!b) return; m.remove(); document.removeEventListener("keydown", key, true); stage.removeEventListener("pointerdown", out, true); onPick(Number(b.dataset.i)); });
    setTimeout(() => { if (m.isConnected) { document.addEventListener("keydown", key, true); stage.addEventListener("pointerdown", out, true); } }, 0);
    ctx.onCleanup(() => { document.removeEventListener("keydown", key, true); stage.removeEventListener("pointerdown", out, true); });
    return m;
  }

  /* ---------- glisser-déposer (à la souris ou au doigt) ---------- */
  function dragify(el, { zones, onDrop, onMiss }) {
    let d = null;
    const zoneAt = (x, y) => zones().find(z => { const b = z.getBoundingClientRect(); return x > b.left && x < b.right && y > b.top && y < b.bottom; });
    el.addEventListener("pointerdown", e => {
      if (e.button !== 0) return; e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      const r = el.getBoundingClientRect();
      d = { dx: e.clientX - r.left, dy: e.clientY - r.top, ph: document.createElement("div"), moved: false };
      d.ph.className = "sc-ph"; d.ph.style.cssText = `width:${r.width}px;height:${r.height}px`; el.after(d.ph);
      Object.assign(el.style, { width: r.width + "px", position: "fixed", zIndex: 60, left: r.left + "px", top: r.top + "px" });
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", e => {
      if (!d) return; d.moved = true;
      el.style.left = (e.clientX - d.dx) + "px"; el.style.top = (e.clientY - d.dy) + "px";
      const z = zoneAt(e.clientX, e.clientY); zones().forEach(x => x.classList.toggle("over", x === z));
    });
    const up = e => {
      if (!d) return; const ph = d.ph; d = null;
      zones().forEach(x => x.classList.remove("over"));
      const z = zoneAt(e.clientX, e.clientY);
      Object.assign(el.style, { position: "", left: "", top: "", zIndex: "", width: "" }); el.classList.remove("dragging"); ph.remove();
      if (z) onDrop(z, el); else onMiss?.(el);
    };
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  }

  /* =========================================================
     NIVEAU 1 — Le réveil des bulles : viser, cliquer, lire
     ========================================================= */
  R("sc_bulles", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 1, title: "Le réveil des bulles : viser et cliquer", step: 0, noClient: true,
        consigne: "Les bulles dorment 😴. Approchez la flèche de la souris pour les réveiller, puis cliquez dessus. Prenez votre temps : ici, rien ne peut se casser.",
        help: "Posez la main sur la souris <b>sans serrer</b>, le poignet sur la table. L'<b>index</b> sur le bouton de gauche, le <b>majeur</b> sur celui de droite. Au bord du tapis ? On soulève la souris, et on la repose plus loin." });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div class="sc-stage"></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "wake", label: "<b>Viser</b> : passez la flèche sur chacune des 5 bulles, <b>sans cliquer</b>, pour les réveiller." },
        { k: "pop", label: "<b>Cliquer</b> : une bulle apparaît à la fois. Cliquez dessus avec le bouton de <b>gauche</b>. Elles rapetissent !" },
        { k: "read", label: "<b>Lire avant de cliquer</b> : cliquez seulement sur le bouton demandé." }
      ]);
      const S = f.panel.querySelector(".sc-stage");
      const next = () => { const k = T.next?.k; if (!k) return end(); stages[k](); };
      const stages = {
        wake() {
          let awake = 0, early = 0;
          const pos = [[14, 30], [38, 68], [56, 26], [76, 62], [90, 30]];
          S.innerHTML = pos.map(([x, y], i) => `<span class="sc-bub b${i}" style="left:${x}%;top:${y}%" data-b="${i}"><span>😴</span></span>`).join("") + `<div class="sc-stage-note">💤 Passez simplement la flèche dessus…</div>`;
          S.querySelectorAll("[data-b]").forEach(b => b.addEventListener("pointerenter", () => {
            if (b.classList.contains("awake")) return; b.classList.add("awake"); b.firstChild.textContent = "😊";
            if (++awake === 5 && T.done("wake")) { (early > 2 ? G.ko : G.ok)("wake", "Viser sans cliquer", "Pour viser, on déplace seulement la souris : pas besoin de cliquer."); T.note(good("✅ Toutes les bulles sont réveillées ! La flèche suit votre main.")); later(ctx, next, 1100); }
          }));
          S.onclick = () => { if (T.is("wake")) return; early++; if (early === 2) T.note(kindly("Pas besoin de cliquer pour l'instant : on <b>vise</b> seulement, en faisant glisser la souris sur la table.")); };
        },
        pop() {
          S.onclick = null;
          const n = ctx.byLevel({ beginner: 8, intermediate: 10, expert: 12 }), min = ctx.byLevel({ beginner: 46, intermediate: 38, expert: 30 });
          let k = 0, miss = 0;
          const show = () => {
            if (k >= n) {
              S.innerHTML = `<div class="sc-stage-msg">🎉 ${n} bulles réveillées${miss ? ` (${miss} clic${miss > 1 ? "s" : ""} à côté)` : ", sans un clic à côté"} !</div>`;
              if (T.done("pop")) (miss <= Math.ceil(n / 3) ? G.ok : G.ko)("pop", "Cliquer sur une cible", "Je vise d'abord, je clique ensuite, sans bouger la souris pendant le clic.");
              return later(ctx, next, 1300);
            }
            const s = Math.round(120 - (120 - min) * (k / (n - 1)));
            S.innerHTML = `<button type="button" class="sc-bub awake pop b${k % 5}" style="left:${10 + Math.random() * 80}%;top:${18 + Math.random() * 64}%;width:${s}px;height:${s}px" aria-label="Bulle ${k + 1} sur ${n}"><span>😊</span></button><div class="sc-stage-note">Bulle ${k + 1} / ${n}</div>`;
          };
          S.onpointerdown = e => {
            if (e.button !== 0) { if (e.button === 2) T.note(kindly("Ça, c'était le bouton de <b>droite</b>. Pour éclater la bulle, c'est le bouton de <b>gauche</b>, sous l'index.")); return; }
            if (e.target.closest(".sc-bub")) { k++; show(); }
            else { miss++; if (miss === 3) T.note(kindly("Prenez le temps de <b>poser la flèche sur la bulle</b> avant de cliquer. Et on ne bouge plus la souris pendant le clic.")); }
          };
          S.oncontextmenu = e => e.preventDefault();
          show();
        },
        read() {
          S.onpointerdown = null;
          const rounds = [["Suivant", ["Annuler", "Suivant", "Fermer"]], ["Non", ["Oui", "Non", "Plus tard"]], ["Valider", ["Valider", "Effacer", "Retour"]]];
          let i = 0, err = 0;
          const show = () => {
            if (i >= rounds.length) { S.innerHTML = `<div class="sc-stage-msg">👀 Bien lu !</div>`; if (T.done("read")) (err ? G.ko : G.ok)("read", "Lire le bouton avant de cliquer", "Avant chaque clic, on lit le mot écrit sur le bouton."); return later(ctx, next, 900); }
            const [want, list] = rounds[i];
            S.innerHTML = `<div class="sc-ask">Cliquez sur le bouton <b>« ${want} »</b></div><div class="sc-btns">${shuffle(list).map(x => `<button type="button" class="sc-btn" data-v="${x}">${x}</button>`).join("")}</div>`;
            S.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
              if (b.dataset.v === want) { i++; T.note(""); show(); }
              else { err++; b.classList.add("ko"); T.note(kindly(`Vous avez cliqué sur « ${esc(b.dataset.v)} ». Avant de cliquer, on <b>lit</b> le mot écrit sur le bouton.`)); }
            }));
          };
          show();
        }
      };
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q1", questions: [
          { q: "Pour bien tenir la souris :", choices: ["La main posée dessus, sans serrer, l'index sur le bouton de gauche", "Du bout des doigts, en serrant fort"], ok: 0, why: "La main repose sur la souris, détendue. L'index clique à gauche, le majeur à droite." },
          { q: "La souris arrive au bord du tapis. Que faire ?", choices: ["Je la soulève et je la repose plus loin", "Je tire très fort", "J'abandonne"], ok: 0, why: "En l'air, la souris ne bouge pas la flèche : on la repose plus loin, et on continue." },
          { q: "Pendant que je clique, la souris doit…", choices: ["Rester immobile", "Bouger un peu"], ok: 0, why: "Si la souris bouge pendant le clic, on peut rater la cible… ou déplacer un objet sans le vouloir." }
        ], onDone: () => finish(ctx, G, { key: "sc_bulles", label: "Je sais viser et cliquer", intro: "Viser, cliquer, lire le bouton avant de cliquer : les bases de la souris sont là." }) });
      }
      next();
    }
  });

  /* =========================================================
     NIVEAU 2 — Le menu secret : agir (clic gauche) ou explorer (clic droit)
     ========================================================= */
  R("sc_menu", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 2, title: "Le menu secret : le clic droit", step: 0, noClient: true,
        consigne: "Le <b>clic gauche agit</b> (il ouvre, il valide). Le <b>clic droit explore</b> : il montre un menu avec toutes les actions possibles. Avant chaque clic, une seconde : est-ce que je veux <b>agir</b>, ou <b>voir les options</b> ?",
        help: "Le <b>clic droit</b> est sous votre <b>majeur</b>, à droite de la molette. Il ne fait rien de grave : il ouvre seulement un menu. Pour le refermer sans rien choisir : la touche <b>Échap</b>, ou un clic à côté." });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div class="sc-stage sc-objs">
          <div class="sc-obj" data-o="door"><span class="sc-ico">🚪</span><b>La porte</b></div>
          <div class="sc-obj" data-o="box"><span class="sc-ico">📦</span><b>Le colis</b></div>
          <div class="sc-obj" data-o="photo"><span class="sc-ico sc-rot" style="--r:180deg">👵</span><b>photo_mamie.jpg</b></div>
          <div class="sc-said" aria-live="polite"></div></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "door", label: "<b>Agir</b> : ouvrez la porte 🚪. Un simple clic, bouton de <b>gauche</b>." },
        { k: "shake", label: "<b>Explorer</b> : secouez le colis 📦 pour deviner ce qu'il contient. « Secouer » est caché dans le <b>menu secret</b> : clic <b>droit</b> sur le colis." },
        { k: "rotate", label: "La photo de mamie est à l'envers ! Clic <b>droit</b> sur la photo › <b>Faire pivoter à droite</b>… autant de fois qu'il faut." },
        { k: "esc", label: "Ouvrez le menu secret de la porte, puis refermez-le <b>sans rien choisir</b> : touche <b>Échap</b> (en haut à gauche du clavier), ou un clic à côté." },
        { k: "open", label: "<b>Agir</b> : ouvrez enfin le colis 📦 (clic gauche) !" }
      ]);
      const S = f.panel.querySelector(".sc-stage"), said = S.querySelector(".sc-said");
      const say = h => { said.innerHTML = h; };
      const O = k => S.querySelector(`[data-o="${k}"]`);
      const st = { door: false, box: false, rot: 180 }, errs = {};
      const err = k => { errs[k] = (errs[k] || 0) + 1; };
      const done = (k, label, tip) => { if (T.done(k)) (errs[k] ? G.ko : G.ok)(k, label, tip); if (T.all) end(); };
      const MENUS = {
        door: ["🚪 Ouvrir", "👂 Écouter", "🧽 Nettoyer"],
        box: ["📂 Ouvrir", "🫨 Secouer", "🎀 Décorer"],
        photo: ["🖼️ Ouvrir", "↻ Faire pivoter à droite", "↺ Faire pivoter à gauche", "🖨️ Imprimer"]
      };
      const act = (o, what) => { // ce qui se passe vraiment
        const cur = T.next?.k;
        if (o === "door" && what === "open") { st.door = true; O("door").querySelector(".sc-ico").textContent = "🚪✨"; say("🚪 La porte s'ouvre… il y a un joli jardin 🌷"); if (cur === "door") done("door", "Agir avec le clic gauche", "Le clic gauche agit : il ouvre, il valide."); return; }
        if (o === "box" && what === "shake") { O("box").classList.remove("shake"); void O("box").offsetWidth; O("box").classList.add("shake"); say("🫨 Gling-gling… On dirait quelque chose de fragile !"); if (cur === "shake") done("shake", "Trouver une action dans le menu du clic droit", "« Secouer » n'existe que dans le menu du clic droit : il montre toutes les options."); return; }
        if (o === "box" && what === "open") {
          if (cur !== "open") { err(cur); say("📦 Pas encore ! Le colis s'ouvrira à la fin. Suivez la consigne en bleu 👉"); return; }
          st.box = true; O("box").querySelector(".sc-ico").textContent = "🎁"; say("🎁 Surprise : un livre de la médiathèque, et un mot : « Bravo ! »"); done("open", "Agir avec le clic gauche", "Le clic gauche agit : il ouvre, il valide."); return;
        }
        if (o === "photo" && (what === "right" || what === "left")) {
          st.rot += what === "right" ? 90 : -90; O("photo").querySelector(".sc-ico").style.setProperty("--r", st.rot + "deg");
          if (cur !== "rotate") return say("↻ La photo a tourné.");
          if (st.rot % 360 === 0) { say("🙂 Mamie est à l'endroit !"); done("rotate", "Faire pivoter une photo (clic droit)", "Clic droit sur la photo › Faire pivoter : on la redresse."); }
          else say("↻ Elle a tourné d'un quart de tour… pas encore à l'endroit : encore une fois !");
          return;
        }
        if (o === "door" && what === "listen") return say("👂 On entend… des oiseaux 🐦");
        if (o === "door" && what === "clean") return say("🧽 La porte brille ✨");
        if (o === "box" && what === "deco") return say("🎀 Un joli ruban sur le colis !");
        if (o === "photo" && what === "open") return say("🖼️ La photo s'ouvre en grand… mamie a la tête en bas ! Redressons-la.");
        if (o === "photo" && what === "print") return say("🖨️ (Simulation : rien n'est imprimé.)");
      };
      const KEYS = { door: ["open", "listen", "clean"], box: ["open", "shake", "deco"], photo: ["open", "right", "left", "print"] };
      S.querySelectorAll("[data-o]").forEach(el => {
        const o = el.dataset.o;
        el.addEventListener("click", () => {
          const cur = T.next?.k;
          if (cur === "shake" && o === "box" || cur === "rotate" && o === "photo" || cur === "esc" && o === "door") {
            err(cur); T.note(kindly("Le clic <b>gauche</b> agit tout de suite. Pour voir les <b>options</b>, c'est le bouton de <b>droite</b>, sous le majeur 🖱️➡️"));
            if (o === "photo") return act("photo", "open");
            if (o === "door") return say("🚪 La porte est déjà ouverte.");
            return;
          }
          if (o === "door") { if (cur === "door") return act("door", "open"); return say("🚪 La porte est déjà ouverte."); }
          if (o === "box") return act("box", "open");
          if (o === "photo") return act("photo", "open");
        });
        el.addEventListener("contextmenu", e => {
          e.preventDefault();
          const cur = T.next?.k;
          if (cur === "door" || cur === "open") { T.note(kindly(`Ici, on veut simplement <b>agir</b> : un clic <b>gauche</b> suffit. Mais le menu ne casse rien : choisissez « Ouvrir », ou fermez-le avec Échap.`)); }
          ctxMenu(ctx, S, e, MENUS[o], (i, how) => {
            if (i == null) { if (T.next?.k === "esc") { T.note(good(`✅ Menu refermé ${how === "esc" ? "avec Échap" : "d'un clic à côté"} : rien n'a changé.`)); done("esc", "Refermer un menu sans rien choisir", "La touche Échap (ou un clic à côté) referme un menu sans rien faire."); } return; }
            const what = KEYS[o][i];
            if (T.next?.k === "esc") { err("esc"); T.note(kindly("Vous avez choisi une action. Cette fois, on referme le menu <b>sans rien choisir</b> : touche <b>Échap</b>, ou un clic à côté du menu.")); }
            if (what === "open" && o === "door") { act("door", "open"); return; }
            act(o, what);
          });
        });
      });
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q2", questions: [
          { q: "Je veux <b>voir toutes les actions possibles</b> sur un fichier. Je fais…", choices: ["Un clic gauche", "Un clic droit"], ok: 1, label: "Clic droit = voir les options", why: "Le clic droit explore : il affiche un menu avec les actions possibles." },
          { q: "Un menu s'est ouvert par erreur. Comment le refermer sans rien faire ?", choices: ["Touche Échap, ou un clic à côté", "J'éteins l'ordinateur"], ok: 0, why: "Échap (en haut à gauche du clavier) ou un clic ailleurs : le menu disparaît, rien n'est changé." },
          { q: "Le clic droit peut-il abîmer quelque chose ?", choices: ["Non : il montre seulement un menu", "Oui, il efface"], ok: 0, why: "Le clic droit ne fait qu'ouvrir un menu. Ce qui compte, c'est l'action qu'on choisit ensuite." }
        ], onDone: () => finish(ctx, G, { key: "sc_menu", label: "Je sais agir (clic gauche) et explorer (clic droit)", intro: "Clic gauche pour agir, clic droit pour explorer les options, Échap pour refermer : le menu secret n'a plus de secret." }) });
      }
    }
  });

  /* =========================================================
     NIVEAU 3 — Le double-clic : le rythme, les dossiers… et Internet
     ========================================================= */
  const TREE = {
    name: "Bureau", kids: [
      { name: "Mes documents", ico: "📁", kids: [{ name: "Photos", ico: "📁", kids: [{ name: "vacances.jpg", ico: "🏖️" }, { name: "anniversaire.jpg", ico: "🎂", goal: true }, { name: "jardin.jpg", ico: "🌻" }] }, { name: "Brouillon.docx", ico: "📝" }, { name: "Courrier", ico: "📁", kids: [{ name: "lettre_caf.pdf", ico: "📕" }] }] },
      { name: "Mes sauvegardes", ico: "📁", kids: [{ name: "sauvegarde_2025.zip", ico: "🗜️" }] },
      { name: "Mes téléchargements", ico: "📁", kids: [{ name: "recette_tarte.pdf", ico: "📕" }, { name: "horaires.pdf", ico: "📕" }] }
    ]
  };
  R("sc_double", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 3, title: "Le double-clic : toc-toc !", step: 0, noClient: true,
        consigne: "Sur l'ordinateur, on <b>ouvre</b> un dossier ou un fichier avec un <b>double-clic</b> : deux clics très rapprochés, sans bouger la souris. Un seul clic, lui, <b>sélectionne</b> (l'objet devient bleu).",
        help: "Le double-clic n'est pas une question de force : c'est une question de <b>rythme</b>. « Toc-toc », comme quand on frappe à une porte. La souris reste immobile." });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div class="sc-stage"></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "rhythm", label: "<b>Le rythme</b> : double-cliquez 3 fois sur l'étoile ⭐. Toc-toc !" },
        { k: "folders", label: "<b>Les dossiers</b> : ouvrez <b>Mes documents</b>, puis <b>Photos</b>, puis la photo <b>anniversaire.jpg</b>, en double-cliquant." },
        { k: "web", label: "<b>Sur Internet, c'est différent</b> : ouvrez la page « Horaires » du site de la médiathèque." }
      ]);
      const S = f.panel.querySelector(".sc-stage");
      const next = () => { const k = T.next?.k; if (!k) return end(); stages[k](); };
      const stages = {
        rhythm() {
          let n = 0, slow = 0, lastClick = 0;
          S.innerHTML = `<div class="sc-star" tabindex="0" role="button" aria-label="Étoile"><span>⭐</span></div><div class="sc-stage-note"><b class="sc-n">0</b> / 3 double-clics</div>`;
          const star = S.querySelector(".sc-star");
          star.addEventListener("click", () => { const now = Date.now(), gap = now - lastClick; lastClick = now; if (gap > 550 && gap < 1600) { slow++; T.note(kindly("Presque ! Les deux clics doivent être <b>plus rapprochés</b> : toc-toc, sans pause entre les deux.")); } });
          star.addEventListener("dblclick", () => {
            n++; S.querySelector(".sc-n").textContent = n;
            const ring = document.createElement("span"); ring.className = "sc-ring"; star.appendChild(ring); setTimeout(() => ring.remove(), 700);
            if (n === 3 && T.done("rhythm")) { (slow > 2 ? G.ko : G.ok)("rhythm", "Faire un double-clic", "Deux clics très rapprochés, sans bouger la souris : toc-toc."); T.note(good("✅ Trois double-clics réussis : vous avez le rythme !")); later(ctx, next, 1000); }
          });
        },
        folders() {
          const path = [TREE]; let wrong = 0, singles = 0, sel = null;
          const draw = () => {
            const cur = path[path.length - 1];
            S.innerHTML = `<div class="sc-win"><div class="sc-win-bar"><button type="button" class="sc-back" ${path.length > 1 ? "" : "disabled"} title="Revenir au dossier précédent">⬅ Retour</button><span>📂 ${path.map(p => esc(p.name)).join(" › ")}</span></div>
              <div class="sc-win-body">${cur.kids.map((k, i) => `<div class="sc-item" tabindex="0" data-i="${i}"><span>${k.ico}</span>${esc(k.name)}</div>`).join("")}</div></div>`;
            S.querySelector(".sc-back").addEventListener("click", () => { path.pop(); draw(); });
            S.querySelectorAll("[data-i]").forEach(el => {
              const k = cur.kids[Number(el.dataset.i)];
              el.addEventListener("click", () => { S.querySelectorAll(".sc-item").forEach(x => x.classList.remove("sel")); el.classList.add("sel"); if (sel === el && ++singles === 3) T.note(kindly("Un clic <b>sélectionne</b> (l'objet devient bleu). Pour <b>ouvrir</b>, deux clics très rapprochés : toc-toc !")); sel = el; });
              el.addEventListener("dblclick", () => {
                if (k.kids) {
                  const want = ["Mes documents", "Photos"][path.length - 1];
                  if (k.name !== want) { wrong++; T.note(kindly(`Vous avez ouvert « ${esc(k.name)} ». Ce n'est pas le bon dossier : cliquez sur <b>⬅ Retour</b>, et ouvrez <b>${want}</b>.`)); }
                  else T.note("");
                  path.push(k); draw(); return;
                }
                if (k.goal) {
                  S.innerHTML = `<div class="sc-viewer"><div class="sc-viewer-bar">🖼️ anniversaire.jpg</div><div class="sc-viewer-img">🎂🎈🥳</div></div>`;
                  if (T.done("folders")) (wrong ? G.ko : G.ok)("folders", "Ouvrir des dossiers avec le double-clic", "On lit le nom du dossier avant de l'ouvrir. Erreur ? Le bouton ⬅ Retour.");
                  T.note(good("✅ La photo s'ouvre ! Joyeux anniversaire 🎉")); later(ctx, next, 1400); return;
                }
                wrong++; T.note(kindly(`« ${esc(k.name)} » n'est pas la photo demandée. On cherche <b>anniversaire.jpg</b>.`));
              });
            });
          };
          draw();
        },
        web() {
          S.innerHTML = `<div class="sc-site"><div class="sc-site-bar">🔒 mediatheque-valbourg.fr</div><div class="sc-site-body"><h3>📚 Médiathèque de Valbourg</h3>
            <p>Bienvenue ! Ateliers numériques le jeudi.</p><p class="sc-links"><a href="#" data-l="h">🕑 Horaires</a> <a href="#" data-l="x">📰 Actualités</a> <a href="#" data-l="x">📞 Contact</a></p></div></div>`;
          let t = null, dbl = false;
          S.querySelectorAll("[data-l]").forEach(a => {
            a.addEventListener("click", e => {
              e.preventDefault();
              if (a.dataset.l !== "h") { T.note(kindly("Ce lien-là mène ailleurs. On cherche <b>Horaires</b>.")); return; }
              clearTimeout(t); t = setTimeout(open, 450);
            });
            a.addEventListener("dblclick", e => { e.preventDefault(); if (a.dataset.l === "h") dbl = true; });
          });
          ctx.onCleanup(() => clearTimeout(t));
          function open() {
            if (!alive(ctx) || T.is("web")) return;
            S.querySelector(".sc-site-body").innerHTML = `<h3>🕑 Horaires</h3><p>Mardi, jeudi, vendredi : 10 h – 18 h<br>Mercredi, samedi : 10 h – 17 h</p>${dbl ? `<div class="sc-dup">📄📄 La page s'est ouverte <b>deux fois</b> !</div>` : ""}`;
            T.done("web"); (dbl ? G.ko : G.ok)("web", "Un seul clic sur un lien Internet", "Sur Internet, un seul clic suffit. Un double-clic peut ouvrir deux fois la page, ou valider deux fois un paiement.");
            T.note(dbl ? kindly("Sur Internet, <b>un seul clic</b> suffit ! Le double-clic peut ouvrir deux fois la page… ou payer deux fois.") : good("✅ Un seul clic : parfait. Sur Internet, les liens et les boutons s'ouvrent d'un simple clic."));
            later(ctx, end, 900);
          }
        }
      };
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q3", questions: [
          { q: "Sur le bureau de l'ordinateur, pour <b>ouvrir</b> un dossier :", choices: ["Un double-clic", "Un clic", "Un clic droit"], ok: 0, why: "Un clic sélectionne, un double-clic ouvre." },
          { q: "Sur un site Internet, pour suivre un lien :", choices: ["Un seul clic", "Un double-clic"], ok: 0, why: "Sur Internet, un seul clic suffit. Le double-clic peut valider deux fois !" },
          { q: "Mon double-clic ne marche pas. Pourquoi ?", choices: ["Les deux clics sont trop espacés, ou la souris a bougé", "Je n'ai pas appuyé assez fort"], ok: 0, why: "Ce n'est pas une question de force : c'est le rythme. Toc-toc, sans bouger la souris." }
        ], onDone: () => finish(ctx, G, { key: "sc_double", label: "Je maîtrise le double-clic", intro: "Le rythme du double-clic, l'ouverture des dossiers… et le simple clic sur Internet." }) });
      }
      next();
    }
  });

  /* =========================================================
     NIVEAU 4 — Le grand ménage : glisser-déposer, molette, potion
     ========================================================= */
  R("sc_menage", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 4, title: "Le grand ménage : glisser-déposer", step: 0, noClient: true,
        consigne: "<b>Glisser-déposer</b>, c'est attraper un objet et le poser ailleurs : j'appuie sur le bouton de gauche, je <b>garde le doigt appuyé</b>, je déplace la souris, et je lâche au bon endroit.",
        help: "Gardez le bouton gauche <b>bien enfoncé</b> pendant tout le trajet, et ne relâchez qu'au-dessus de l'arrivée (elle devient bleue). La <b>molette</b>, la petite roue entre les deux boutons, fait défiler un texte." });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div class="sc-stage auto"></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "sort", label: "<b>Le grand ménage</b> : rangez chaque fichier à sa place. Les photos dans <b>Photos</b>, les papiers dans <b>Papiers</b>, ce qui ne sert plus à la <b>Corbeille</b>." },
        { k: "wheel", label: "<b>La molette</b> : faites défiler la recette de la potion magique avec la petite roue, jusqu'en bas." },
        { k: "potion", label: "<b>La potion</b> : glissez les ingrédients dans le chaudron 🫕, <b>dans l'ordre</b> de la recette." }
      ]);
      const S = f.panel.querySelector(".sc-stage");
      const next = () => { const k = T.next?.k; if (!k) return end(); stages[k](); };
      let miss = 0;
      const missed = () => { miss++; T.note(kindly("L'objet est revenu : il faut <b>garder le bouton enfoncé</b> jusqu'à être au-dessus de l'arrivée, puis lâcher.")); };
      const stages = {
        sort() {
          const items = [["vacances.jpg", "🏖️", "photos"], ["facture_edf.pdf", "📄", "papiers"], ["brouillon_vieux.docx", "📝", "trash"], ["mamie_noel.jpg", "🎄", "photos"], ["lettre_caf.pdf", "📕", "papiers"], ["ticket_2019.pdf", "🧾", "trash"]];
          const n = ctx.byLevel({ beginner: 4, intermediate: 6, expert: 6 });
          const list = shuffle(items.slice(0, n));
          const names = { photos: "📁 Photos", papiers: "📁 Papiers", trash: "🗑️ Corbeille" };
          let wrong = 0, left = n;
          S.innerHTML = `<div class="sc-files">${list.map(([nm, ic, z]) => `<div class="sc-file" data-z="${z}"><span>${ic}</span>${esc(nm)}</div>`).join("")}</div>
            <div class="sc-zones">${Object.entries(names).map(([z, l]) => `<div class="sc-zone" data-zone="${z}"><b>${l}</b><div class="sc-zin"></div></div>`).join("")}</div>`;
          const zones = () => [...S.querySelectorAll("[data-zone]")];
          S.querySelectorAll(".sc-file").forEach(el => dragify(el, {
            zones,
            onMiss: missed,
            onDrop(z, el) {
              if (z.dataset.zone !== el.dataset.z) {
                wrong++;
                const why = { photos: "Le dossier Photos, c'est pour les images (.jpg).", papiers: "Papiers, c'est pour les factures et les lettres (.pdf).", trash: "La Corbeille, c'est pour ce qui ne sert plus." }[z.dataset.zone];
                T.note(kindly(`« ${esc(el.textContent.trim().slice(2).trim())} » ne va pas dans ${names[z.dataset.zone]}. ${why}`)); return;
              }
              z.querySelector(".sc-zin").appendChild(el); el.classList.add("placed"); el.replaceWith(el.cloneNode(true));
              T.note(good(`✅ Rangé dans ${names[z.dataset.zone]} !`));
              if (--left === 0 && T.done("sort")) {
                (wrong ? G.ko : G.ok)("sort", "Ranger au bon endroit", "Je lis le nom du fichier, puis je choisis son dossier.");
                (miss > 2 ? G.ko : G.ok)("drag", "Glisser-déposer", "Bouton gauche enfoncé pendant tout le trajet, on lâche au-dessus de l'arrivée.");
                later(ctx, next, 1100);
              }
            }
          }));
        },
        wheel() {
          let wheeled = false;
          const steps = ["Prenez un grand chaudron 🫕.", "Allumez un petit feu, très doux.", "Versez trois verres d'eau de pluie.", "Attendez que ça frémisse.", "1️⃣ D'abord : l'<b>herbe magique</b> 🌿.", "Remuez trois fois dans un sens.", "2️⃣ Ensuite : le <b>cristal bleu</b> 💎.", "Remuez trois fois dans l'autre sens.", "Laissez reposer le temps d'une chanson.", "Le secret des sorcières : la patience.", "Ne mettez surtout pas de champignon 🍄 !", "Ni de sel 🧂 : la potion deviendrait amère.", "Soufflez doucement sur la vapeur.", "3️⃣ Et enfin, l'ingrédient secret : le <b>miel doré</b> 🍯."];
          S.innerHTML = `<div class="sc-recipe-wrap"><div class="sc-recipe" tabindex="0"><h3>📜 La potion magique</h3>${steps.map(s => `<p>${s}</p>`).join("")}<button type="button" class="primary" data-read>✅ J'ai tout lu</button></div><div class="sc-wheel-hint">🛞 Posez la flèche sur la recette, puis tournez la molette vers vous.</div></div>`;
          const rec = S.querySelector(".sc-recipe");
          rec.addEventListener("wheel", () => { wheeled = true; }, { passive: true });
          S.querySelector("[data-read]").addEventListener("click", () => {
            if (T.done("wheel")) (wheeled ? G.ok : G.ko)("wheel", "Faire défiler avec la molette", "La petite roue entre les deux boutons fait défiler la page, sans viser la barre sur le côté.");
            T.note(wheeled ? good("✅ Bien défilé ! Retenez l'ordre : 🌿, 💎, 🍯.") : kindly("Vous êtes arrivé en bas : bravo ! Essayez aussi la <b>molette</b>, la petite roue entre les deux boutons : c'est plus facile que la barre sur le côté."));
            later(ctx, next, 1200);
          });
        },
        potion() {
          const want = ["herbe", "cristal", "miel"];
          const ING = { herbe: "🌿 Herbe magique", cristal: "💎 Cristal bleu", miel: "🍯 Miel doré", champi: "🍄 Champignon", sel: "🧂 Sel" };
          let i = 0, wrong = 0;
          S.innerHTML = `<div class="sc-files">${shuffle(Object.keys(ING)).map(k => `<div class="sc-file" data-ing="${k}">${ING[k]}</div>`).join("")}</div>
            <div class="sc-zones"><div class="sc-zone cauldron" data-zone="pot"><b>🫕 Le chaudron</b><div class="sc-zin"></div></div></div><div class="sc-stage-note">Rappel de la recette : 🌿 puis 💎 puis 🍯</div>`;
          S.querySelectorAll("[data-ing]").forEach(el => dragify(el, {
            zones: () => [...S.querySelectorAll("[data-zone]")], onMiss: missed,
            onDrop(z, el) {
              const k = el.dataset.ing;
              if (k !== want[i]) { wrong++; z.classList.add("puff"); setTimeout(() => z.classList.remove("puff"), 600); T.note(kindly(want.includes(k) ? `💨 Pas encore ! Relisez la recette : maintenant, c'est <b>${ING[want[i]]}</b>.` : `💨 Pouah ! ${ING[k]} n'est pas dans la recette. L'ingrédient est renvoyé.`)); return; }
              i++; z.querySelector(".sc-zin").insertAdjacentHTML("beforeend", `<span>${ING[k].split(" ")[0]}</span>`); el.remove();
              if (i === want.length) {
                z.classList.add("magic"); z.querySelector("b").textContent = "✨ La potion est prête ! ✨";
                if (T.done("potion")) (wrong ? G.ko : G.ok)("potion", "Suivre une consigne dans l'ordre", "On relit la consigne avant d'agir : l'ordre compte.");
                later(ctx, end, 1200);
              } else T.note(good(`✅ ${ING[k]} : c'est dans le chaudron !`));
            }
          }));
        }
      };
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q4", questions: [
          { q: "Pendant un glisser-déposer, le bouton de la souris…", choices: ["Reste enfoncé jusqu'à l'arrivée", "Se lâche tout de suite"], ok: 0, why: "On le garde enfoncé pendant tout le trajet : on lâche seulement au-dessus de l'arrivée." },
          { q: "La molette sert à…", choices: ["Faire défiler une page vers le haut ou le bas", "Allumer l'ordinateur"], ok: 0, why: "La petite roue entre les deux boutons fait défiler un texte, une page Internet, une liste." },
          { q: "J'ai lâché un fichier dans le mauvais dossier. Le réflexe ?", choices: ["Ctrl + Z pour annuler, ou je le reglisse au bon endroit", "Je supprime tout"], ok: 0, why: "Rien n'est perdu : Ctrl + Z annule le déplacement, ou on le déplace à nouveau." }
        ], onDone: () => finish(ctx, G, { key: "sc_menage", label: "Je sais glisser-déposer et utiliser la molette", intro: "Le grand ménage est fait, la recette lue jusqu'en bas, la potion réussie !" }) });
      }
      next();
    }
  });

  /* =========================================================
     L'ATELIER DU CLAVIER : une consigne, une case, le clavier dessiné
     item = { fam, p (consigne), want ("a", "Enter", "ê"…), mode: "char" | "text" | "seq",
              hint (touches à faire clignoter), tip, scene }
     ========================================================= */
  function keyDrill(ctx, f, { items, fams, onEnd, legend = true }) {
    const L = ctx.local, G = grader(L);
    f.panel.innerHTML = `<div class="sc-kd-head"><span class="sc-kd-count"></span><span class="sc-kd-fam"></span></div>
      <div class="sc-kd-card"><div class="sc-kd-p" data-speak></div><div class="sc-kd-scene"></div>
        <div class="sc-kd-row"><input class="sc-kd-in" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Zone de frappe"><button type="button" class="primary sc-kd-ok" hidden>Valider ↵</button></div>
        <div class="sc-kd-fb" aria-live="polite"></div></div>
      <div class="pk-slot"></div>${legend ? `<div class="pk-legend"><span><em>haut</em> = avec ⇧ Maj</span><span><em>bas</em> = touche seule</span><span><em style="color:#1d6fd6">bleu</em> = avec Alt Gr</span><span>🟢 = Verr. Maj allumé</span></div>` : ""}
      <div class="mk-q-slot"></div>`;
    const $ = s => f.panel.querySelector(s);
    const inp = $(".sc-kd-in"), okBtn = $(".sc-kd-ok"), fb = $(".sc-kd-fb");
    const kb = AN.per ? AN.per.keyboard($(".pk-slot"), { target: inp, big: ctx.demo }) : null;
    ctx.onCleanup(() => kb?.destroy());
    const errs = {}; let i = 0, tries = 0, busy = false;
    const show = k => k === "Enter" ? "↵ Entrée" : k === " " ? "␣ Espace" : k;
    function load() {
      const it = items[i];
      if (!it) return wrap();
      tries = 0; busy = false;
      $(".sc-kd-count").textContent = `${i + 1} / ${items.length}`;
      $(".sc-kd-fam").textContent = fams[it.fam].title;
      $(".sc-kd-p").innerHTML = it.p; $(".sc-kd-scene").innerHTML = it.scene || "";
      inp.value = it.start || ""; inp.classList.toggle("wide", it.mode !== "char"); okBtn.hidden = it.mode !== "text";
      inp.disabled = false; inp.focus();
      kb?.hint(ctx.isBeginner() || tries > 0 ? it.hint || [] : []);
      fb.innerHTML = "";
    }
    const right = it => { busy = true; fb.innerHTML = `<span class="ok">✅ ${["Parfait !", "Bravo !", "C'est ça !", "Très bien !"][i % 4]}</span>`; inp.classList.add("good"); setTimeout(() => { inp.classList.remove("good"); if (!alive(ctx)) return; i++; load(); }, 650); };
    const wrongTry = (it, got, extra) => {
      tries++; errs[it.fam] = (errs[it.fam] || 0) + 1;
      kb?.hint(it.hint || []);
      fb.innerHTML = `<div class="alert sc-kind">${got != null ? `Vous avez tapé <b class="mono">${esc(show(got))}</b>. ` : ""}${extra || it.tip || "Regardez bien la consigne, et réessayez."}</div>`;
      inp.classList.add("bad"); setTimeout(() => inp.classList.remove("bad"), 400);
    };
    function judgeChar(v) {
      const it = items[i]; if (!it || busy) return;
      if (v === it.want) return right(it);
      let extra = it.tip;
      if (it.want.length === 1 && v === it.want.toLowerCase() && it.want !== it.want.toLowerCase()) extra = "C'est la bonne lettre, mais en <b>minuscule</b>. Pour une majuscule : on garde <b>⇧ Maj</b> enfoncée, et on appuie sur la lettre.";
      else if (it.want.length === 1 && v === it.want.toUpperCase() && it.want !== it.want.toUpperCase()) extra = "C'est une <b>majuscule</b> ! Le <b>Verr. Maj</b> est peut-être allumé (voyant vert) : appuyez une fois dessus pour l'éteindre.";
      else if (it.trap && v === it.trap) extra = it.trapTip || "Attention au piège : <b>relisez toute la consigne</b> avant d'appuyer.";
      wrongTry(it, v, extra);
      setTimeout(() => { if (alive(ctx) && items[i] === it) inp.value = it.start || ""; }, 500);
    }
    function judgeText() {
      const it = items[i]; if (!it || busy) return;
      const v = inp.value;
      if (it.want instanceof RegExp ? it.want.test(v) : v === it.want) return right(it);
      const cat = AN.live?.engines?.type?.classify?.(it.want, v);
      wrongTry(it, null, `${cat && cat !== "Une lettre différente" && cat !== "Exact" ? `<b>${cat}</b>. ` : ""}${it.tip || "Comparez lettre par lettre avec le modèle."}`);
    }
    listen(ctx, inp, "keydown", e => {
      const it = items[i]; if (!it || busy) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (it.mode === "text") return judgeText();
        if (it.want === "Enter") return right(it);
        if (it.mode === "seq" && inp.value) return judgeChar(inp.value);
        return wrongTry(it, "Enter", "C'est la touche <b>Entrée</b>. " + (it.tip || ""));
      }
      if (e.key === " " && it.mode === "char") { e.preventDefault(); if (it.want === " ") return right(it); return wrongTry(it, " ", "C'est la barre d'<b>Espace</b>. " + (it.tip || "")); }
      if (e.key === "Backspace" && it.mode === "char") { e.preventDefault(); if (it.want === "Backspace") return right(it); }
    });
    const onInput = () => { const it = items[i]; if (!it || busy) return; if (it.mode === "char" && inp.value) judgeChar(inp.value.slice(-1)); else if (it.mode === "seq" && inp.value.length >= it.want.length) judgeChar(inp.value); };
    listen(ctx, inp, "input", e => { if (!e.isComposing) onInput(); });
    listen(ctx, inp, "compositionend", onInput);
    okBtn.addEventListener("click", judgeText);
    f.panel.querySelector(".sc-kd-card").addEventListener("click", () => inp.focus());
    function wrap() {
      if (L.ended) return; L.ended = true; kb?.hint([]);
      Object.entries(fams).forEach(([k, fm]) => { if (items.some(it => it.fam === k)) ((errs[k] || 0) <= (fm.allow ?? 0) ? G.ok : G.ko)(k, fm.label, fm.tip); });
      f.panel.querySelector(".sc-kd-card").innerHTML = `<div class="sc-stage-msg">🎉 Tous les exercices sont faits !</div>`;
      onEnd(G, f.panel.querySelector(".mk-q-slot"));
    }
    load();
  }
  const H = { maj: ["ShiftLeft", "ShiftRight"], altgr: ["AltRight"], circ: ["BracketLeft"] };
  const letterCode = c => ({ a: "KeyQ", z: "KeyW", q: "KeyA", w: "KeyZ", m: "Semicolon" })[c] || "Key" + c.toUpperCase();

  /* =========================================================
     NIVEAU 5 — Les lettres, les majuscules… et lire avant d'agir
     ========================================================= */
  R("sc_lettres", {
    steps: 1,
    render(ctx) {
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 5, title: "Les lettres, les majuscules… et lire avant d'agir", step: 0, noClient: true,
        consigne: "Lisez <b>toute</b> la consigne, puis appuyez sur la touche demandée. Le clavier dessiné s'allume quand vous appuyez : regardez-le !",
        help: "Sur un clavier français (AZERTY), les lettres ne sont pas dans l'ordre de l'alphabet : la première ligne commence par <b>A Z E R T Y</b>. Les touches qui clignotent en bleu vous montrent où chercher." });
      const L1 = ctx.byLevel({ beginner: ["a", "l", "p", "m", "d"], intermediate: ["a", "l", "p", "m", "d", "j", "u"], expert: ["k", "b", "u", "j", "t", "m", "w"] });
      const M = ctx.byLevel({ beginner: ["A", "M", "L"], intermediate: ["A", "M", "L", "R"], expert: ["A", "M", "Q", "R", "Z"] });
      const items = [
        ...L1.map(c => ({ fam: "lettres", mode: "char", want: c, p: `Tapez la lettre <b class="sc-big">${c}</b>`, hint: [letterCode(c)], tip: `Cherchez la touche <b>${c.toUpperCase()}</b> sur le clavier (les lettres y sont écrites en majuscule).` })),
        ...M.map(c => ({ fam: "maj", mode: "char", want: c, p: `Faites une majuscule : <b class="sc-big">${c}</b>`, hint: [...H.maj, letterCode(c.toLowerCase())], tip: "On garde <b>⇧ Maj</b> enfoncée (la flèche vers le haut), et on appuie sur la lettre." })),
        { fam: "lire", mode: "char", want: "e", trap: "a", p: `Tapez la lettre <b>a</b>…<br><span class="sc-warn">⚠️ Attention : ne tapez <b>PAS</b> la lettre a. Tapez la lettre <b>e</b>.</span>`, hint: ["KeyE"], trapTip: "C'était un piège ! La suite de la consigne disait : tapez <b>e</b>. On lit <b>jusqu'au bout</b> avant d'agir." },
        { fam: "lire", mode: "char", want: "a", trap: "e", p: `<b>Si le rond est ROUGE</b>, tapez <b>e</b>.<br><b>Si le rond est BLEU</b>, tapez <b>a</b>.`, scene: `<span class="sc-dot blue" aria-label="Rond bleu"></span>`, hint: ["KeyQ"], trapTip: "Regardez bien la couleur du rond : il est <b>BLEU</b>, donc on tape <b>a</b>." },
        { fam: "lire", mode: "char", want: "p", trap: "o", p: `Tapez la <b>première lettre</b> du mot <b>pomme</b>.`, hint: ["KeyP"] },
        { fam: "lire", mode: "seq", want: "aba", p: `Tapez <b>trois lettres</b> dans cet ordre : <b>a</b>, puis <b>b</b>, puis <b>a</b>.`, hint: ["KeyQ", "KeyB"], tip: "Trois lettres à la suite : a, b, a." },
        { fam: "touches", mode: "char", want: " ", p: `Appuyez sur la grande barre d'<b>Espace</b>, tout en bas du clavier.`, hint: ["Space"], tip: "L'Espace est la très grande touche en bas, sous les lettres." },
        { fam: "touches", mode: "char", want: "Enter", p: `Appuyez sur la touche <b>Entrée</b> ↵ (à droite, en forme de L à l'envers).`, hint: ["Enter"], tip: "Entrée est la grande touche à droite, avec la flèche ↵." }
      ];
      if (!ctx.isBeginner()) items.splice(items.length - 2, 0, { fam: "lire", mode: "char", want: "S", p: `Tapez la <b>dernière lettre</b> du mot <b>BUS</b>, en <b>majuscule</b>.`, hint: [...H.maj, "KeyS"], tip: "La dernière lettre de BUS, c'est S. En majuscule : ⇧ Maj + s." });
      keyDrill(ctx, f, { items,
        fams: {
          lettres: { title: "⌨️ Les lettres", label: "Trouver les lettres sur le clavier", tip: "Le clavier AZERTY : A Z E R T Y sur la première ligne.", allow: 1 },
          maj: { title: "🔠 Les majuscules", label: "Faire une majuscule avec ⇧ Maj", tip: "On garde ⇧ Maj enfoncée, et on appuie sur la lettre.", allow: 0 },
          lire: { title: "👀 Lire avant d'agir", label: "Lire toute la consigne avant d'agir", tip: "On lit jusqu'au bout : il peut y avoir un « attention » ou un « sauf si ».", allow: 0 },
          touches: { title: "␣ Espace et ↵ Entrée", label: "Trouver Espace et Entrée", tip: "Espace : la grande barre en bas. Entrée : la grande touche à droite.", allow: 0 }
        },
        onEnd: (G, slot) => quiz(slot, { G, key: "q5", questions: [
          { q: "Pour faire <b>une</b> majuscule :", choices: ["Je garde ⇧ Maj enfoncée et j'appuie sur la lettre", "J'appuie deux fois sur la lettre"], ok: 0, why: "⇧ Maj + la lettre. Pour TOUT écrire en majuscules, il y a Verr. Maj… qu'on pense à éteindre ensuite !" },
          { q: "Tout ce que je tape s'écrit EN MAJUSCULES. Pourquoi ?", choices: ["Le Verr. Maj est allumé : j'appuie une fois dessus", "Le clavier est cassé"], ok: 0, why: "La touche Verr. Maj bloque les majuscules. Un voyant s'allume souvent sur le clavier." },
          { q: "Avant de taper ou de cliquer, le bon réflexe :", choices: ["Lire toute la consigne, jusqu'au bout", "Aller le plus vite possible"], ok: 0, why: "Une consigne peut finir par « sauf », « attention » ou « ne… pas ». On lit tout, puis on agit." }
        ], onDone: () => finish(ctx, G, { key: "sc_lettres", label: "Je trouve les lettres, les majuscules, Espace et Entrée", intro: "Lettres, majuscules, Espace, Entrée… et le réflexe de lire avant d'agir." }) })
      });
    }
  });

  /* =========================================================
     NIVEAU 6 — Accents, circonflexes, @… et des mots entiers
     ========================================================= */
  R("sc_accents", {
    steps: 1,
    render(ctx) {
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 6, title: "Accents, circonflexes et arobase @", step: 0, noClient: true,
        consigne: "Sur un clavier français, <b>é è à ç ù</b> ont leur propre touche. Le <b>circonflexe</b> se fait en deux temps. Et l'arobase <b>@</b> des adresses e-mail demande la touche <b>Alt Gr</b>.",
        help: "Le chapeau ^ : j'appuie sur la touche <b>^</b> (à droite du P) et je la <b>lâche</b> : rien ne s'affiche, c'est normal ! Puis j'appuie sur la lettre : <b>ê</b>. L'arobase : je garde <b>Alt Gr</b> enfoncée (à droite de l'Espace), et j'appuie sur <b>à 0</b>." });
      const ACC = [["é", "Digit2", "la touche <b>2</b>, sans Maj"], ["è", "Digit7", "la touche <b>7</b>, sans Maj"], ["à", "Digit0", "la touche <b>0</b>, sans Maj"], ["ç", "Digit9", "la touche <b>9</b>, sans Maj"], ["ù", "Quote", "la touche <b>ù</b>, à droite du M"]];
      const CIRC = ctx.byLevel({ beginner: ["ê", "â", "ô"], intermediate: ["ê", "â", "ô", "î"], expert: ["ê", "â", "ô", "î", "û"] });
      const WORDS = ctx.byLevel({
        beginner: ["café", "La clé est à côté du café."],
        intermediate: ["café", "La clé est à côté du café.", "Il a reçu un colis."],
        expert: ["La clé est à côté du café.", "Il a reçu un colis.", "Le gâteau est prêt, à tout à l'heure !"]
      });
      const items = [
        ...ACC.slice(0, ctx.isBeginner() ? 4 : 5).map(([c, code, where]) => ({ fam: "acc", mode: "char", want: c, p: `Tapez la lettre <b class="sc-big">${c}</b>`, hint: [code], tip: `${c} : ${where}.` })),
        ...CIRC.map(c => ({ fam: "circ", mode: "char", want: c, p: `Tapez la lettre <b class="sc-big">${c}</b> <small>(avec le chapeau)</small>`, hint: ["BracketLeft", letterCode(c.normalize("NFD")[0])], tip: `En deux temps : j'appuie sur <b>^</b> et je lâche (rien ne s'affiche, c'est normal), puis j'appuie sur <b>${c.normalize("NFD")[0]}</b>.` })),
        { fam: "at", mode: "char", want: "@", p: `Tapez l'arobase <b class="sc-big">@</b>`, hint: ["AltRight", "Digit0"], tip: "On garde <b>Alt Gr</b> enfoncée (à droite de l'Espace), et on appuie sur la touche <b>à 0</b>." },
        { fam: "at", mode: "text", want: "marie.dupont@exemple.fr", p: `Recopiez l'adresse e-mail, puis appuyez sur Entrée :<div class="sc-model">marie.dupont@exemple.fr</div>`, hint: ["AltRight", "Digit0", ...H.maj, "Comma"], tip: "Tout en minuscules, sans espace. Le point : ⇧ Maj + la touche <b>; .</b> — l'arobase : Alt Gr + à." },
        ...WORDS.map(w => ({ fam: "mots", mode: "text", want: w, p: `Recopiez, puis appuyez sur Entrée :<div class="sc-model">${esc(w)}</div>`, hint: [], tip: "Comparez lettre par lettre : majuscule au début, accents, espaces, point final." }))
      ];
      keyDrill(ctx, f, { items,
        fams: {
          acc: { title: "é è à ç : les accents", label: "Taper é, è, à, ç, ù", tip: "é = 2, è = 7, ç = 9, à = 0 (sans Maj) ; ù a sa touche à droite du M.", allow: 1 },
          circ: { title: "^ Le circonflexe", label: "Taper un circonflexe (â, ê, ô…)", tip: "^ puis la lettre : en deux temps.", allow: 1 },
          at: { title: "@ L'arobase", label: "Taper l'arobase @ (Alt Gr + à)", tip: "Alt Gr enfoncée + la touche à 0.", allow: 0 },
          mots: { title: "✍️ Des mots entiers", label: "Recopier une phrase avec accents", tip: "On relit avant de valider : majuscule, accents, point.", allow: 1 }
        },
        onEnd: (G, slot) => quiz(slot, { G, key: "q6", questions: [
          { q: "Pour écrire <b>ê</b> :", choices: ["^ puis e", "e puis ^", "Alt Gr + e"], ok: 0, why: "D'abord le chapeau ^ (rien ne s'affiche), puis la lettre." },
          { q: "L'arobase @ :", choices: ["Alt Gr + à", "Maj + a", "Ctrl + @"], ok: 0, why: "Alt Gr (à droite de l'Espace) enfoncée, puis la touche « à 0 »." },
          { q: "J'ai fini d'écrire une phrase. Avant de valider :", choices: ["Je relis : majuscule, accents, ponctuation", "Je valide vite"], ok: 0, why: "Relire avant de valider : c'est le bon réflexe, surtout dans un formulaire." }
        ], onDone: () => finish(ctx, G, { key: "sc_accents", label: "Je tape les accents, les circonflexes et l'arobase", intro: "é, è, à, ç, le chapeau ^ en deux temps, l'arobase avec Alt Gr… et des phrases entières." }) })
      });
    }
  });

  /* =========================================================
     NIVEAU 7 — Le curseur, Effacer, Espace, Entrée et Ctrl + Z
     ========================================================= */
  R("sc_curseur", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 7, title: "Le curseur et les corrections", step: 0, noClient: true,
        consigne: "Le <b>curseur</b>, c'est le petit trait qui clignote <b>|</b> : il montre où le texte va s'écrire. On le place d'un <b>clic</b> dans le texte. Ensuite, <b>⌫ Effacer</b> efface la lettre à sa gauche.",
        help: "Les flèches <b>←</b> et <b>→</b> du clavier déplacent le curseur d'une lettre. <b>⌫ Effacer</b> est en haut à droite du clavier (la grande flèche vers la gauche). Et en cas de bêtise : <b>Ctrl + Z</b> annule !" });
      const SENT = "Je vous dis bonjour et merci, à demain et au revoir.";
      const marks = ctx.byLevel({ beginner: ["bonjour", "merci"], intermediate: ["bonjour", "merci", "demain"], expert: ["bonjour", "merci", "demain", "revoir"] });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div class="sc-stage auto sc-ed"><div class="sc-ed-p"></div><textarea class="sc-ed-in" rows="2" spellcheck="false" autocapitalize="off" aria-label="Zone de texte"></textarea><div class="sc-ed-help"></div></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "cur", label: `<b>Placer le curseur</b> : cliquez juste après le mot demandé (${marks.length} mots).` },
        { k: "bs", label: "<b>Effacer</b> : corrigez « Bonjoru » en « Bonjour » avec la touche <b>⌫ Effacer</b>." },
        { k: "space", label: "<b>L'espace oublié</b> : ajoutez l'espace qui manque entre « suis » et « à »." },
        { k: "enter", label: "<b>Aller à la ligne</b> : à la fin du texte, appuyez sur <b>Entrée</b>, puis tapez : <code>Je vous remercie.</code>" },
        { k: "undo", label: "<b>Le bouton magique</b> : sélectionnez tout (<b>Ctrl + A</b>), effacez (<b>⌫</b>)… puis faites revenir le texte avec <b>Ctrl + Z</b>." }
      ]);
      const $ = s => f.panel.querySelector(s);
      const ta = $(".sc-ed-in"), P = $(".sc-ed-p"), HL = $(".sc-ed-help");
      const errs = {}; const err = k => { errs[k] = (errs[k] || 0) + 1; };
      const done = (k, label, tip) => { if (T.done(k)) (errs[k] > (k === "cur" ? 2 : 0) ? G.ko : G.ok)(k, label, tip); ta.blur(); later(ctx, next, 900); };
      let stage = null, mi = 0, bsUsed = 0, erased = false;
      const set = (v, caret) => { ta.value = v; ta.focus(); const c = caret ?? v.length; ta.setSelectionRange(c, c); };
      const next = () => { stage = T.next?.k; if (!stage) return end(); S[stage](); };
      const S = {
        cur() { ta.rows = 2; ta.readOnly = false; ta.value = SENT; P.innerHTML = `Cliquez juste <b>après</b> le mot <b class="sc-mark">« ${marks[mi]} »</b> : le trait | doit clignoter entre le dernier « ${marks[mi].slice(-1)} » et ce qui suit.`; HL.textContent = "💡 Astuce : les flèches ← → déplacent le trait d'une lettre."; },
        bs() { P.innerHTML = `Placez le curseur juste après <b>« Bonjoru »</b>, effacez <b>2 lettres</b> avec <b>⌫ Effacer</b>, puis tapez <b>ur</b>.`; HL.textContent = "⌫ Effacer efface la lettre à GAUCHE du trait qui clignote."; bsUsed = 0; set("Bonjoru Madame,", 7); },
        space() { P.innerHTML = `Il manque un espace : <b>« Je suisà la médiathèque. »</b> Cliquez entre « suis » et « à », puis appuyez sur la barre d'<b>Espace</b>.`; HL.textContent = "La barre d'Espace : la très grande touche en bas du clavier."; set("Je suisà la médiathèque.", 0); },
        enter() { ta.rows = 3; P.innerHTML = `Le curseur est à la fin. Appuyez sur <b>Entrée</b> pour aller à la ligne, puis tapez : <b>Je vous remercie.</b>`; HL.textContent = "Dans un texte, Entrée passe à la ligne. Dans un formulaire, elle valide."; set("Bonjour Madame,"); },
        undo() { P.innerHTML = `1) <b>Ctrl + A</b> : tout se surligne en bleu. 2) <b>⌫ Effacer</b> : tout disparaît 😱. 3) <b>Ctrl + Z</b> : tout revient ! 🪄`; HL.textContent = "Ctrl + Z marche presque partout : dans un texte, dans l'Explorateur, dans un mail…"; erased = false; set("Bonjour Madame,\nJe vous remercie.\nMarie Dupont"); }
      };
      const checkCaret = () => {
        if (stage !== "cur" || mi >= marks.length) return;
        const want = SENT.indexOf(marks[mi]) + marks[mi].length, at = ta.selectionStart;
        if (ta.selectionStart !== ta.selectionEnd) return;
        if (at === want) {
          mi++; HL.innerHTML = `<span class="ok">✅ Juste après « ${marks[mi - 1]} » !</span>`;
          if (mi >= marks.length) { T.note(good("✅ Le curseur est bien placé à chaque fois.")); return done("cur", "Placer le curseur dans un texte", "Un clic dans le texte place le curseur ; les flèches ← → l'ajustent."); }
          later(ctx, () => { if (stage === "cur") S.cur(); }, 700);
        } else {
          err("cur");
          const before = SENT.slice(Math.max(0, at - 8), at), after = SENT.slice(at, at + 8);
          HL.innerHTML = `Le trait est ici : « …${esc(before)}<b class="sc-caret">|</b>${esc(after)}… ». ${at < want ? "Un peu plus à droite ➡️" : "Un peu plus à gauche ⬅️"} (les flèches ← → aident !)`;
        }
      };
      listen(ctx, ta, "click", () => setTimeout(checkCaret, 0));
      listen(ctx, ta, "keyup", e => { if (/^Arrow/.test(e.key)) checkCaret(); });
      listen(ctx, ta, "keydown", e => {
        if (stage === "cur" && !/^Arrow|^Home|^End|^Tab/.test(e.key)) { e.preventDefault(); if (e.key.length === 1 || e.key === "Backspace") HL.innerHTML = "Pour cet exercice, on ne tape rien : on <b>clique</b> seulement pour placer le trait."; }
        if (e.key === "Backspace") bsUsed++;
        if (stage === "enter" && e.key === "Enter" && ta.selectionStart !== ta.value.length) { e.preventDefault(); err("enter"); HL.innerHTML = "Le curseur n'est pas à la fin : cliquez tout au bout du texte (ou appuyez sur la touche <b>Fin</b>), puis Entrée."; }
      });
      listen(ctx, ta, "input", e => {
        const v = ta.value;
        if (stage === "bs") {
          if (v === "Bonjour Madame,") { if (!bsUsed) { err("bs"); HL.innerHTML = "C'est juste… mais essayez avec <b>⌫ Effacer</b> : c'est la touche qu'on utilise pour corriger."; set("Bonjoru Madame,", 7); return; } T.note(good("✅ Corrigé !")); return done("bs", "Corriger avec ⌫ Effacer", "⌫ Effacer efface à gauche du curseur."); }
          if (!/^Bonjo/.test(v) || v.length < 10) { err("bs"); HL.innerHTML = "Oups, trop effacé ? Pas de panique : <b>Ctrl + Z</b> annule. Ou recommencez : le texte est remis."; later(ctx, () => { if (stage === "bs") set("Bonjoru Madame,", 7); }, 1500); }
        }
        if (stage === "space") {
          if (v === "Je suis à la médiathèque.") { T.note(good("✅ L'espace est revenu !")); return done("space", "Ajouter un espace au bon endroit", "On place le curseur, puis la barre d'Espace."); }
          if (v.length > 26 || v.length < 24) { err("space"); HL.innerHTML = "Le texte a changé ailleurs. Il est remis : cliquez <b>entre « suis » et « à »</b>, puis Espace."; later(ctx, () => { if (stage === "space") set("Je suisà la médiathèque.", 0); }, 1200); }
          else if (v !== "Je suisà la médiathèque.") { err("space"); HL.innerHTML = "L'espace n'est pas au bon endroit. Le texte est remis : on clique juste <b>avant le « à »</b>."; later(ctx, () => { if (stage === "space") set("Je suisà la médiathèque.", 0); }, 1200); }
        }
        if (stage === "enter") {
          if (/^Bonjour Madame,\nJe vous remercie\.\s*$/.test(v)) { T.note(good("✅ Deux lignes : comme dans une vraie lettre.")); done("enter", "Aller à la ligne avec Entrée", "Dans un texte, Entrée passe à la ligne suivante."); }
          else if (/^Bonjour Madame,\nJe vous remercie\s*$/.test(v)) HL.innerHTML = "Presque ! N'oubliez pas le <b>point final</b> : ⇧ Maj + la touche <b>; .</b>";
          else if (/^Bonjour Madame,Je/.test(v)) { err("enter"); HL.innerHTML = "Le texte est resté sur la même ligne : effacez « Je… » avec ⌫, puis appuyez d'abord sur <b>Entrée</b>."; }
        }
        if (stage === "undo") {
          if (!v.trim()) { erased = true; T.note(`<div class="alert">😱 Tout est effacé ! Vite : <b>Ctrl + Z</b>.</div>`); }
          else if (erased && v.includes("Je vous remercie")) { T.note(good("🪄 Le texte est revenu ! Ctrl + Z annule la dernière action, presque partout.")); done("undo", "Annuler une erreur avec Ctrl + Z", "Ctrl + Z annule la dernière action."); }
        }
      });
      function end() {
        if (L.ended) return; L.ended = true; ta.readOnly = true; P.innerHTML = "🎉 Toutes les corrections sont faites !"; HL.textContent = "";
        quiz(T.slot(), { G, key: "q7", questions: [
          { q: "La touche <b>⌫ Effacer</b> efface…", choices: ["La lettre à gauche du curseur", "Tout le texte", "La lettre à droite"], ok: 0, why: "⌫ Effacer efface à gauche. (La touche Suppr, elle, efface à droite.)" },
          { q: "Je veux corriger une faute au milieu d'une phrase. D'abord :", choices: ["Je clique juste après la faute pour y placer le curseur", "J'efface toute la phrase"], ok: 0, why: "On place le curseur au bon endroit d'un clic, puis on corrige seulement ce qu'il faut." },
          { q: "Dans un formulaire en ligne, la touche Entrée…", choices: ["Valide souvent le formulaire : je relis avant !", "Ne fait jamais rien"], ok: 0, why: "Dans un texte, Entrée va à la ligne ; dans un formulaire, elle peut valider. On relit avant." }
        ], onDone: () => finish(ctx, G, { key: "sc_curseur", label: "Je place le curseur et je corrige un texte", intro: "Le curseur, Effacer, l'Espace, Entrée… et Ctrl + Z, le bouton magique." }) });
      }
      next();
    }
  });

  /* =========================================================
     NIVEAU 8 — Mission réelle sur le vrai ordinateur + la dictée finale
     ========================================================= */
  const DICTEE = "Le père Noël est passé à côté de la gare.";
  R("sc_real", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 8, title: "Mission réelle : souris et clavier en vrai", step: 0, noClient: true,
          consigne: "Sur le <b>vrai</b> ordinateur, on essaie les gestes appris. Rien ne peut se casser : on <b>n'enregistre rien</b> et on <b>ne supprime rien</b>." });
        f.panel.innerHTML = `<ol class="nv-steps">
            <li>🖱️ <b>Le clic droit</b> : sur le bureau, dans un espace vide, faites un clic droit. Un menu apparaît. Refermez-le avec <b>Échap</b>.</li>
            <li>✌️ <b>Le double-clic</b> : double-cliquez sur la <b>Corbeille</b> pour l'ouvrir. Regardez… puis fermez la fenêtre avec la croix <b>✕</b> en haut à droite. (On ne vide rien !)</li>
            <li>⌨️ <b>Le Bloc-notes</b> : appuyez sur la touche <b>⊞ Windows</b>, tapez <b>bloc</b>, puis <b>Entrée</b>. Écrivez 3 lignes :<br>
              — votre prénom, avec une majuscule ;<br>— la phrase <b>« La clé est à côté du café. »</b> ;<br>— une adresse inventée : <b>prenom.nom@exemple.fr</b></li>
            <li>🪄 Effacez un mot avec <b>⌫</b>, puis faites-le revenir avec <b>Ctrl + Z</b>. Fermez le Bloc-notes : à la question « Enregistrer ? », cliquez sur <b>Ne pas enregistrer</b>.</li></ol>
          <div class="alert">✋ Une question ? On lève la main. Ensuite, revenez ici pour la <b>dictée finale</b>.</div>
          <div class="final-actions"><button type="button" class="primary" data-go>J'ai fait la mission : la dictée finale →</button></div>`;
        f.panel.querySelector("[data-go]").addEventListener("click", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 8, title: "La dictée finale et mes observations", step: 1, noClient: true, consigne: "Une dernière phrase à recopier, puis vos observations pour le formateur." });
        f.panel.innerHTML = `<div class="nv-real">
          <div class="sc-dictee"><b>✍️ La dictée finale</b> : recopiez la phrase <b>en entier</b>.<div class="sc-model">${DICTEE}</div>
            <small>💡 Le <b>ë</b> de Noël : <b>⇧ Maj + ^</b> (on lâche), puis <b>e</b>.</small>
            <input type="text" data-f="dictee" autocomplete="off" spellcheck="false" autocapitalize="off" maxlength="120" aria-label="Votre phrase"></div>
          <fieldset class="nv-check"><legend><b>✅ Sur le vrai ordinateur, j'ai réussi à…</b> (cochez seulement ce qui est vrai)</legend>
            <label><input type="checkbox" data-c="right"> ouvrir le menu du clic droit… et le refermer avec Échap</label>
            <label><input type="checkbox" data-c="dbl"> ouvrir la Corbeille avec un double-clic, puis la fermer avec ✕</label>
            <label><input type="checkbox" data-c="notes"> ouvrir le Bloc-notes et écrire mes 3 lignes</label>
            <label><input type="checkbox" data-c="at"> taper l'arobase @ (Alt Gr + à)</label>
            <label><input type="checkbox" data-c="undo"> faire revenir un mot avec Ctrl + Z</label></fieldset>
          <fieldset class="nv-check"><legend><b>😊 Avec la souris et le clavier, je me sens…</b></legend>
            ${["🌱 encore hésitant(e)", "🙂 de plus en plus à l'aise", "💪 à l'aise"].map(v => `<label><input type="radio" name="feel" value="${v}"> ${v}</label>`).join("")}</fieldset>
          <label>💬 Ce qui est encore difficile pour moi (facultatif)<input type="text" data-f="note" maxlength="300" autocomplete="off"></label>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(0));
        $f("[data-send]").addEventListener("click", async () => {
          const dic = $f('[data-f="dictee"]').value.trim(), note = $f('[data-f="note"]').value.trim(), feel = f.panel.querySelector('[name="feel"]:checked')?.value || "";
          if (!dic) { $f(".mk-fb").innerHTML = `<div class="alert bad">Recopiez d'abord la phrase de la dictée 🙂</div>`; return; }
          if (!feel) { $f(".mk-fb").innerHTML = `<div class="alert bad">Dites comment vous vous sentez avec la souris et le clavier 🙂</div>`; return; }
          const c = k => $f(`[data-c="${k}"]`).checked;
          $f("[data-send]").disabled = true;
          const cat = dic === DICTEE ? "Exact" : AN.live?.engines?.type?.classify?.(DICTEE, dic) || "Une lettre différente";
          (dic === DICTEE ? G.ok : G.ko)("dictee", "La dictée finale", `Le modèle : « ${DICTEE} » (${cat}).`);
          (c("right") ? G.ok : G.ko)("right", "Le clic droit sur le vrai bureau", "Clic droit dans un espace vide du bureau, puis Échap.");
          (c("dbl") ? G.ok : G.ko)("dbl", "Le double-clic sur la Corbeille", "Double-clic pour ouvrir, ✕ pour fermer.");
          (c("notes") ? G.ok : G.ko)("notes", "Écrire dans le Bloc-notes", "⊞ Windows, « bloc », Entrée : le Bloc-notes s'ouvre.");
          (c("at") ? G.ok : G.ko)("at", "Taper l'arobase @", "Alt Gr + à.");
          (c("undo") ? G.ok : G.ko)("undo", "Annuler avec Ctrl + Z", "Ctrl + Z fait revenir ce qu'on vient d'effacer.");
          const text = `🖱️ Mission réelle Souris et clavier\n✍️ Dictée : « ${dic} » → ${cat}\n${["right:clic droit", "dbl:double-clic", "notes:Bloc-notes", "at:@", "undo:Ctrl + Z"].map(x => { const [k, l] = x.split(":"); return `${c(k) ? "✅" : "⬜"} ${l}`; }).join(" · ")}\n😊 ${feel}${note ? `\n💬 ${note}` : ""}`;
          try { await ctx.api.sendToTeacher?.("🖱️ Mission réelle : souris et clavier", text.slice(0, 1900)); }
          catch (e) { $f(".mk-fb").innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "sc_real", label: "J'utilise la souris et le clavier sur le vrai ordinateur", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Vos observations sont parties chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Dictée : <b>${esc(cat === "Exact" ? "parfaite ✨" : cat)}</b>` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });
})(window.AN);
