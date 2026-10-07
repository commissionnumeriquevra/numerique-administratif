/* =========================================================
   Chapitre « Périphériques » : 8 niveaux progressifs.
   Souris, clavier, copier-coller, impression, pannes d'imprimante,
   clé USB, écran et confort, mission réelle. Note /20 à la fin.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const KIT = () => AN.missionKit;
  const P = () => AN.per;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => KIT().frame(ctx, { chapter: "Périphériques", ...o });
  const tasksHTML = t => KIT().tasksHTML(t);
  const quiz = (el, o) => KIT().inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return KIT().finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };

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
  /** Garde un simulateur et le détruit proprement à la sortie. */
  const keep = (ctx, s) => { (ctx.local.sims ||= []).push(s); if (!ctx.local.simHook) { ctx.local.simHook = true; ctx.onCleanup(() => ctx.local.sims?.forEach(x => x.destroy?.())); } return s; };
  const listen = (ctx, target, type, fn, opt) => { target.addEventListener(type, fn, opt); ctx.onCleanup(() => target.removeEventListener(type, fn, opt)); };

  /* =========================================================
     NIVEAU 1 — La souris
     ========================================================= */
  R("per_souris", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 1, title: "La souris : les 5 gestes", step: 0, noClient: true,
        consigne: "Cinq gestes suffisent pour presque tout faire. Entraînez-vous ici, sans risque : rien ne peut se casser.",
        help: "Tenez la souris sans serrer, le poignet posé. L'index sur le bouton de <b>gauche</b>, le majeur sur celui de <b>droite</b>." });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div class="pm" style="position:relative;margin-top:10px"><div class="pm-zone"></div></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "click", label: "<b>Le clic</b> : cliquez une fois sur chacune des 3 cibles 🎯 (bouton de gauche)." },
        { k: "dbl", label: "<b>Le double-clic</b> : ouvrez le dossier <b>Photos</b> en cliquant deux fois, <b>vite</b>." },
        { k: "right", label: "<b>Le clic droit</b> : sur la photo, cliquez avec le bouton de <b>droite</b>, puis choisissez <b>« Imprimer »</b>." },
        { k: "drag", label: "<b>Glisser-déposer</b> : attrapez la <b>lettre</b> (bouton gauche enfoncé), amenez-la dans le dossier <b>Courrier</b>, puis lâchez." },
        { k: "wheel", label: "<b>La molette</b> : faites défiler le texte avec la petite roue, jusqu'au mot <b>« trésor »</b>, et cliquez dessus." }
      ]);
      const Z = f.panel.querySelector(".pm-zone"), box = f.panel.querySelector(".pm");
      const say = h => T.note(`<div class="alert">${h}</div>`);
      const next = () => { const k = T.next?.k; if (!k) return end(); stages[k](); };
      const stages = {
        click() {
          let n = 0;
          Z.innerHTML = [0, 1, 2].map(i => `<button type="button" class="pm-target ${i === 2 ? "small" : ""}" data-t="${i}" aria-label="Cible ${i + 1}">🎯</button>`).join("");
          Z.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { if (b.classList.contains("ok")) return; b.classList.add("ok"); if (++n === 3) { T.done("click"); G.ok("click", "Le clic"); next(); } }));
        },
        dbl() {
          Z.innerHTML = `<div class="pm-folder" tabindex="0" data-f><span>📁</span>Photos</div><div class="pm-out"></div>`;
          const fo = Z.querySelector("[data-f]"); let singles = 0;
          fo.addEventListener("click", () => { fo.classList.add("sel"); singles++; if (singles === 3 && !T.is("dbl")) say("Un seul clic <b>sélectionne</b> (le dossier devient bleu). Pour <b>ouvrir</b>, deux clics très rapprochés, sans bouger la souris."); });
          fo.addEventListener("dblclick", () => { Z.querySelector(".pm-out").innerHTML = `<div class="alert good">📂 Le dossier s'ouvre ! 🖼️ 🖼️ 🖼️</div>`; if (T.done("dbl")) G.ok("dbl", "Le double-clic"); later(ctx, next, 1200); });
        },
        right() {
          Z.innerHTML = `<div class="pm-folder" data-p><span>🖼️</span>photo_lucas.jpg</div>`;
          const ph = Z.querySelector("[data-p]"); let leftTried = false;
          ph.addEventListener("click", () => { ph.classList.add("sel"); if (!leftTried) { leftTried = true; say("Ça, c'est le clic <b>gauche</b> : il sélectionne. Essayez le bouton de <b>droite</b> 🖱️➡️"); } });
          ph.addEventListener("contextmenu", e => {
            e.preventDefault(); box.querySelector(".pm-ctx")?.remove();
            const r = box.getBoundingClientRect();
            const m = document.createElement("div"); m.className = "pm-ctx"; m.style.left = (e.clientX - r.left) + "px"; m.style.top = (e.clientY - r.top) + "px";
            m.innerHTML = ["📂 Ouvrir", "🖨️ Imprimer", "✏️ Renommer", "🗑️ Supprimer"].map(x => `<button type="button">${x}</button>`).join("");
            box.appendChild(m);
            m.addEventListener("click", ev => {
              const t = ev.target.closest("button")?.textContent || ""; m.remove();
              if (t.includes("Imprimer")) { if (T.done("right")) { (leftTried ? G.ko : G.ok)("right", "Le clic droit", "Le clic droit, c'est le bouton de droite : il ouvre un menu avec des choix."); say("✅ Le clic droit ouvre un <b>menu</b> : il propose ce qu'on peut faire avec l'objet."); later(ctx, next, 1400); } }
              else say(`Vous avez choisi « ${esc(t.slice(3))} ». Refaites un clic droit et choisissez <b>Imprimer</b>.`);
            });
          });
        },
        drag() {
          Z.innerHTML = `<div class="pm-drag" data-d>✉️ lettre_mairie.pdf</div><span style="font-size:2em">➡️</span><div class="pm-drop" data-z>📁 Courrier</div>`;
          const d = Z.querySelector("[data-d]"), z = Z.querySelector("[data-z]");
          let drag = null, fails = 0;
          d.addEventListener("pointerdown", e => { e.preventDefault(); d.setPointerCapture(e.pointerId); const r = d.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, ph: document.createElement("div") }; drag.ph.style.cssText = `width:${r.width}px;height:${r.height}px`; d.after(drag.ph); d.style.width = r.width + "px"; d.style.position = "fixed"; d.style.zIndex = 50; d.style.left = r.left + "px"; d.style.top = r.top + "px"; d.style.cursor = "grabbing"; });
          d.addEventListener("pointermove", e => { if (!drag) return; d.style.left = (e.clientX - drag.dx) + "px"; d.style.top = (e.clientY - drag.dy) + "px"; const zr = z.getBoundingClientRect(); z.classList.toggle("over", e.clientX > zr.left && e.clientX < zr.right && e.clientY > zr.top && e.clientY < zr.bottom); });
          d.addEventListener("pointerup", e => {
            if (!drag) return; drag.ph.remove(); drag = null; const over = z.classList.contains("over"); z.classList.remove("over");
            d.style.position = ""; d.style.left = d.style.top = ""; d.style.zIndex = ""; d.style.cursor = ""; d.style.width = "";
            if (over) { z.classList.add("ok"); z.innerHTML = "📁 Courrier ✉️"; d.remove(); if (T.done("drag")) (fails ? G.ko : G.ok)("drag", "Glisser-déposer", "On garde le bouton enfoncé pendant tout le trajet, et on ne lâche qu'au-dessus du dossier."); later(ctx, next, 1000); }
            else { fails++; say("La lettre est revenue : il faut <b>garder le bouton enfoncé</b> jusqu'à être au-dessus du dossier Courrier, puis lâcher."); }
          });
        },
        wheel() {
          const lines = Array.from({ length: 22 }, (_, i) => i === 19 ? `Bravo, vous avez trouvé le <span class="pm-word" data-w>trésor</span> !` : ["Il était une fois une médiathèque.", "Ses étagères étaient pleines de livres.", "Les lecteurs venaient de toute la ville.", "Un jour, un atelier numérique ouvrit ses portes.", "On y apprenait la souris et le clavier."][i % 5]);
          Z.innerHTML = `<div class="pm-scroll" tabindex="0">${lines.map(l => `<p style="margin:.2em 0">${l}</p>`).join("")}</div>`;
          const sc = Z.querySelector(".pm-scroll"); let wheeled = false;
          sc.addEventListener("wheel", () => { wheeled = true; }, { passive: true });
          Z.querySelector("[data-w]").addEventListener("click", e => { e.target.classList.add("ok"); if (T.done("wheel")) (wheeled ? G.ok : G.ko)("wheel", "La molette", "La petite roue entre les deux boutons fait défiler la page, sans viser la barre de défilement."); next(); });
        }
      };
      function end() {
        if (L.ended) return; L.ended = true; Z.innerHTML = `<div class="alert good">🎉 Les 5 gestes de la souris sont acquis !</div>`;
        quiz(T.slot(), { G, key: "q1", questions: [
          { q: "Pour <b>ouvrir</b> un dossier sur le bureau, je fais…", choices: ["Un clic", "Un double-clic", "Un clic droit"], ok: 1, why: "Un clic sélectionne, un double-clic ouvre. (Sur un site Internet, un seul clic suffit sur un lien !)" },
          { q: "Sur un ordinateur portable, sans souris, le clic droit se fait…", choices: ["En bas à droite du pavé tactile (ou en touchant avec deux doigts)", "C'est impossible"], ok: 0, why: "Le pavé tactile remplace la souris : en bas à gauche = clic gauche, en bas à droite = clic droit." },
          { q: "La souris arrive au bord du tapis. Que faire ?", choices: ["Je la soulève et je la repose plus loin", "Je tire très fort"], ok: 0, why: "On soulève la souris : le pointeur ne bouge pas pendant qu'elle est en l'air." }
        ], onDone: () => finish(ctx, G, { key: "per_souris", label: "Je maîtrise les 5 gestes de la souris", intro: "Clic, double-clic, clic droit, glisser-déposer et molette : vous avez tout essayé." }) });
      }
      next();
    }
  });

  /* =========================================================
     NIVEAU 2 — Le clavier : majuscules, chiffres, @, accents
     ========================================================= */
  const SYM = { "&": "1", "é": "2", "\"": "3", "'": "4", "(": "5", "-": "6", "è": "7", "_": "8", "ç": "9", "à": "0" };
  const asDigits = v => v.replace(/[&é"'(\-è_çà]/g, c => SYM[c]);
  R("per_clavier", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 2, title: "Le clavier : majuscules, chiffres, @, accents", step: 0, noClient: true,
        consigne: "Tapez chaque texte demandé dans la case, puis appuyez sur <b>Entrée</b>. Le clavier dessiné s'allume quand vous appuyez sur les touches : regardez-le !",
        help: "Les touches clignotantes en bleu vous montrent par où commencer." });
      const euro = ctx.isBeginner() ? "Café à 3 euros" : "Café à 3 €";
      const ex = [
        { k: "maj", t: "Marie Dupont", lab: "Votre nom, avec les majuscules : <code>Marie Dupont</code>", hint: ["ShiftLeft", "ShiftRight"], tip: "Pour UNE majuscule : on garde <b>⇧ Maj</b> enfoncée, et on appuie sur la lettre." },
        { k: "num", t: "26000", lab: "Le code postal : <code>26000</code>", hint: ["ShiftLeft", "CapsLock"], tip: "Sur un clavier français, les chiffres du haut demandent <b>⇧ Maj</b> (ou <b>Verr. Maj</b> allumé). Sans, on obtient « é(ààà » ! Le pavé numérique, à droite, marche aussi." },
        { k: "at", t: "marie.dupont@exemple.fr", lab: "L'adresse e-mail : <code>marie.dupont@exemple.fr</code>", hint: ["AltRight", "Digit0", "ShiftLeft", "Comma"], tip: "L'arobase <b>@</b> : on garde <b>Alt Gr</b> enfoncée, et on appuie sur la touche <b>à 0</b>. Le point : <b>⇧ Maj</b> + la touche <b>; .</b>" },
        { k: "bs", t: "Bonjour", start: "Bonjoru", lab: "Corrigez la faute : la case contient <code>Bonjoru</code>. Effacez les 2 dernières lettres avec <b>⌫ Effacer</b>, puis tapez <b>ur</b>.", hint: ["Backspace"], tip: "La touche <b>⌫ Effacer</b> (en haut à droite, la grande flèche) efface la lettre à gauche du trait qui clignote." },
        { k: "acc", t: euro, lab: `Avec les accents : <code>${euro}</code>`, hint: ["Digit2", "Digit0", ...(ctx.isBeginner() ? [] : ["AltRight", "KeyE"])], tip: `<b>é</b> et <b>à</b> ont leur propre touche (2 et 0, sans Maj).${ctx.isBeginner() ? "" : " Le <b>€</b> : Alt Gr + E."}` }
      ];
      f.panel.innerHTML = `<div class="wk-tasks"></div>
        <div style="display:flex;gap:8px;align-items:center;margin:12px 0"><input class="pk-input" style="flex:1;font-size:1.3em;padding:10px 12px;border-radius:10px;border:2px solid #c6cfdc" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Zone de saisie"><button type="button" class="primary" data-ok>Valider ↵</button></div>
        <div class="pk-slot"></div><div class="pk-legend"><span><em>haut</em> = avec ⇧ Maj</span><span><em>bas</em> = touche seule</span><span><em style="color:#1d6fd6">bleu</em> = avec Alt Gr</span><span>🟢 = Verr. Maj allumé</span></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), ex.map(e => ({ k: e.k, label: e.lab })));
      const inp = f.panel.querySelector(".pk-input");
      const kb = keep(ctx, P().keyboard(f.panel.querySelector(".pk-slot"), { target: inp, big: ctx.demo }));
      let tries = {}, bsCount = 0;
      const load = () => { const e = ex.find(x => x.k === T.next?.k); if (!e) return; inp.value = e.start || ""; inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); if (ctx.isBeginner()) kb.hint(e.hint); else kb.hint([]); bsCount = 0; };
      listen(ctx, inp, "keydown", e => { if (e.key === "Backspace") bsCount++; if (e.key === "Enter") { e.preventDefault(); check(); } });
      f.panel.querySelector("[data-ok]").addEventListener("click", check);
      function check() {
        const e = ex.find(x => x.k === T.next?.k); if (!e) return;
        const v = inp.value;
        if (v === e.t) {
          if (e.k === "bs" && bsCount === 0) { T.note(`<div class="alert">Le texte est juste… mais essayez avec la touche <b>⌫ Effacer</b> : c'est elle qu'on utilise pour corriger.</div>`); inp.value = e.start; return; }
          T.done(e.k); (tries[e.k] ? G.ko : G.ok)(e.k, plainLab(e), e.tip.replace(/<[^>]+>/g, ""));
          T.note(`<div class="alert good">✅ Parfait !</div>`); load(); if (T.all) end(); return;
        }
        tries[e.k] = (tries[e.k] || 0) + 1;
        let why = e.tip;
        if (v.toLowerCase() === e.t.toLowerCase() && v !== e.t) why = v === e.t.toUpperCase() || /[A-Z]{3}/.test(v) ? "Tout est en MAJUSCULES : le <b>Verr. Maj</b> est sans doute allumé (voyant vert). Appuyez une fois dessus pour l'éteindre." : "Attention aux majuscules. " + e.tip;
        else if (asDigits(v) === e.t || /[&é"'(\-è_çà]{2,}/.test(v) && e.k === "num") why = "Vous avez obtenu les symboles au lieu des chiffres (« " + esc(v) + " »). " + e.tip;
        else if (e.k === "at" && !v.includes("@")) why = "Il manque l'arobase @. " + e.tip;
        else if (/\s$|^\s/.test(v)) why = "Il y a un espace en trop au début ou à la fin.";
        T.note(`<div class="alert">✏️ Pas tout à fait. ${why}</div>`);
      }
      const plainLab = e => ({ maj: "Faire une majuscule", num: "Taper des chiffres (avec Maj)", at: "Taper l'arobase @ (Alt Gr + à)", bs: "Corriger avec la touche Effacer", acc: "Taper les accents" })[e.k];
      function end() {
        if (L.ended) return; L.ended = true; kb.hint([]);
        quiz(T.slot(), { G, key: "q2", questions: [
          { q: "Tout ce que je tape s'écrit EN MAJUSCULES. Pourquoi ?", choices: ["Le clavier est cassé", "Le Verr. Maj est activé : j'appuie une fois dessus", "L'écran est trop grand"], ok: 1, why: "La touche Verr. Maj bloque les majuscules. Un voyant s'allume souvent sur le clavier." },
          { q: "Pour taper l'arobase @ sur un clavier français :", choices: ["Alt Gr + à", "Maj + a", "Ctrl + @"], ok: 0, why: "On garde Alt Gr enfoncée (à droite de la barre d'espace) et on appuie sur la touche « à 0 »." },
          { q: "La touche Entrée sert à…", choices: ["Valider (ou aller à la ligne dans un texte)", "Effacer"], ok: 0, why: "Entrée valide une recherche, un formulaire, ou passe à la ligne dans un texte." }
        ], onDone: () => finish(ctx, G, { key: "per_clavier", label: "Je sais taper majuscules, chiffres, @ et accents", intro: "Majuscules, chiffres, arobase, correction et accents : les touches les plus utiles n'ont plus de secret." }) });
      }
      load();
    }
  });

  /* =========================================================
     NIVEAU 3 — Copier, coller, annuler
     ========================================================= */
  R("per_copier", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const NUM = "CAF-2026-048731", MAIL = "etat-civil@mairie-valbourg.fr";
      const f = frame(ctx, { level: 3, title: "Copier, coller… et annuler", step: 0, noClient: true,
        consigne: "Recopier un long numéro à la main, c'est le risque d'une erreur. Le <b>copier-coller</b> le fait sans faute !",
        help: "<b>Ctrl + C</b> = copier · <b>Ctrl + V</b> = coller · <b>Ctrl + Z</b> = annuler. On garde Ctrl enfoncée, et on appuie sur la lettre. (Le clic droit propose aussi Copier et Coller.)" });
      f.panel.innerHTML = `<div class="wk-tasks"></div>
        <div class="fk-split" style="margin-top:10px;display:grid;gap:12px">
          <div class="wk-sms" style="max-width:none"><b>📧 Caisse des aides</b><p>Bonjour Madame Dupont, votre demande est enregistrée. Votre numéro de dossier : <span class="pc-sel" style="user-select:all;background:#fff3c4;padding:2px 6px;border-radius:5px;font-weight:800;font-family:ui-monospace,Consolas,monospace">${NUM}</span>.</p><p>Pour un acte de naissance, écrivez à <span class="pc-sel" style="user-select:all;background:#fff3c4;padding:2px 6px;border-radius:5px;font-weight:800">${MAIL}</span></p></div>
          <div class="fk-site"><div class="fk-site-head" style="background:#0b5d8a">👪 Suivre mon dossier (simulation)</div><div class="fk-site-body">
            <label>Numéro de dossier<input data-in="num" autocomplete="off" spellcheck="false" style="font:inherit;padding:8px;border:1px solid #bbb;border-radius:8px;width:100%;box-sizing:border-box"></label>
            <label>Destinataire du message<input data-in="mail" autocomplete="off" spellcheck="false" style="font:inherit;padding:8px;border:1px solid #bbb;border-radius:8px;width:100%;box-sizing:border-box"></label>
            <label>Votre message<textarea data-in="txt" rows="3" style="font:inherit;padding:8px;border:1px solid #bbb;border-radius:8px;width:100%;box-sizing:border-box">Bonjour, je souhaite recevoir un acte de naissance. Merci.</textarea></label></div></div></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [
        { k: "copy", label: "Cliquez <b>une fois</b> sur le numéro de dossier (il se surligne), puis copiez-le : <b>Ctrl + C</b>." },
        { k: "paste", label: "Cliquez dans la case <b>Numéro de dossier</b>, puis collez : <b>Ctrl + V</b>." },
        { k: "mail", label: "Même chose avec l'adresse e-mail de la mairie, dans la case <b>Destinataire</b>." },
        { k: "undo", label: "Oups ! Dans <b>Votre message</b>, sélectionnez tout (<b>Ctrl + A</b>) et appuyez sur <b>Suppr</b>… puis rattrapez l'erreur avec <b>Ctrl + Z</b>." }
      ]);
      const $ = s => f.panel.querySelector(s);
      let copied = "", pasted = { num: false, mail: false }, typed = { num: false, mail: false }, erased = false;
      listen(ctx, document, "copy", () => { const s = String(window.getSelection() || "").trim(); if (!s) return; copied = s; if (s.includes(NUM) && T.done("copy")) G.ok("copy", "Copier (Ctrl + C)"); if (T.is("paste") && s.includes(MAIL)) T.note(`<div class="alert good">📋 Adresse copiée. Collez-la dans « Destinataire ».</div>`); });
      ["num", "mail"].forEach(k => {
        const i = $(`[data-in="${k}"]`), want = k === "num" ? NUM : MAIL;
        i.addEventListener("paste", () => { pasted[k] = true; });
        i.addEventListener("input", e => {
          if (e.inputType && e.inputType.startsWith("insertText")) typed[k] = true;
          const v = i.value.trim();
          if (v === want) {
            const key = k === "num" ? "paste" : "mail";
            if (!T.is("copy") && k === "num") { T.done("copy"); G.ko("copy", "Copier (Ctrl + C)", "On sélectionne le texte, puis Ctrl + C."); }
            if (T.done(key)) (pasted[k] && !typed[k] ? G.ok : G.ko)(key, k === "num" ? "Coller (Ctrl + V)" : "Copier-coller une adresse e-mail", "Recopier à la main marche, mais le copier-coller évite toute faute de frappe.");
            if (T.all) end();
          } else if (pasted[k] && v && v !== want) T.note(`<div class="alert">Ce qui a été collé n'est pas le bon texte. Effacez la case, et recommencez la copie.</div>`);
        });
      });
      const ta = $('[data-in="txt"]');
      ta.addEventListener("input", e => {
        if (!ta.value.trim() && e.inputType?.startsWith("delete")) { erased = true; T.note(`<div class="alert">😱 Tout est effacé ! Vite : <b>Ctrl + Z</b>.</div>`); }
        if (e.inputType === "historyUndo" && erased && ta.value.trim()) { if (T.done("undo")) G.ok("undo", "Annuler une erreur (Ctrl + Z)"); T.note(`<div class="alert good">↩️ Le texte est revenu ! Ctrl + Z annule la dernière action, presque partout.</div>`); if (T.all) end(); }
      });
      function end() {
        if (L.ended) return; L.ended = true;
        quiz(T.slot(), { G, key: "q3", questions: [
          { q: "Après « Copier », le texte est…", choices: ["Gardé en mémoire, prêt à être collé (il reste aussi à sa place)", "Effacé de là où il était"], ok: 0, why: "Copier ne change rien au texte d'origine : il est simplement gardé dans une mémoire invisible, le « presse-papiers »." },
          { q: "Je n'arrive pas avec Ctrl : quelle autre solution ?", choices: ["Le clic droit › Copier, puis clic droit › Coller", "Il n'y en a pas"], ok: 0, why: "Le clic droit propose les mêmes actions : Copier, Coller." },
          { q: "J'ai supprimé un paragraphe par erreur. Le réflexe ?", choices: ["Ctrl + Z", "Fermer la fenêtre"], ok: 0, why: "Ctrl + Z (annuler) marche dans presque tous les logiciels, et même dans l'Explorateur." }
        ], onDone: () => finish(ctx, G, { key: "per_copier", label: "Je sais copier, coller et annuler", intro: "Vous savez copier un numéro ou une adresse sans faute, et rattraper une erreur avec Ctrl + Z." }) });
      }
    }
  });

  /* =========================================================
     NIVEAU 4 — Imprimer (et enregistrer en PDF)
     ========================================================= */
  const pageHTML = (title, color) => n => `<div class="logo" style="${color ? `background:${color}` : ""}"></div><b>${title}</b><span>page ${n}</span><div class="bar"></div><div class="bar" style="width:80%"></div><div class="bar" style="width:60%"></div>`;
  function overlay(ctx) {
    const m = document.createElement("div"); m.className = "pk-overlay"; m.innerHTML = "<div></div>";
    (ctx.box.closest(".lesson-overlay") || document.body).appendChild(m);
    ctx.onCleanup(() => m.remove());
    return m;
  }
  R("per_imprimer", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      const HP = "HP LaserJet - Accueil médiathèque";
      if (step === 0) {
        const f = frame(ctx, { level: 4, title: "Imprimer seulement ce qu'il faut", step: 0, noClient: true,
          consigne: "Marie doit imprimer son attestation pour un rendez-vous. Le document fait 3 pages, mais seule la <b>page 1</b> est utile. Imprimez-la en <b>noir et blanc</b>, en <b>1 exemplaire</b>, sur l'imprimante de la médiathèque.",
          help: "Ouvrir la fenêtre d'impression : le bouton 🖨️, ou les touches <b>Ctrl + P</b>. Pour une seule page : Pages › <b>Personnalisées</b> › tapez <b>1</b>." });
        f.panel.innerHTML = `<div class="wk-tasks"></div><div class="fk-site" style="margin-top:10px"><div class="fk-site-head" style="background:#3d4451">📕 attestation_caf.pdf <button type="button" data-print style="margin-left:auto;border:0;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer" title="Imprimer (Ctrl + P)">🖨️ Imprimer</button></div>
          <div class="fk-site-body" style="background:#525659;display:flex;gap:14px;justify-content:center;flex-wrap:wrap">${[1, 2, 3].map(n => `<div class="pp-ph" style="width:150px">${pageHTML("Attestation CAF", "")(n)}</div>`).join("")}</div></div>`;
        const T = tasker(f.panel.querySelector(".wk-tasks"), [
          { k: "open", label: "Ouvrez la fenêtre d'impression : 🖨️ ou <b>Ctrl + P</b>." },
          { k: "print", label: "Réglez : imprimante <b>de la médiathèque</b>, <b>page 1</b> seulement, <b>noir et blanc</b>, <b>1</b> copie. Puis <b>Imprimer</b>." }
        ]);
        const open = via => {
          if (T.done("open")) G.ok("open", via === "key" ? "Ouvrir l'impression avec Ctrl + P" : "Ouvrir la fenêtre d'impression");
          const m = overlay(ctx);
          const dlg = P().printDialog(m.firstChild, { big: ctx.demo, doc: { title: "Attestation CAF", pages: 3, pageHTML: pageHTML("Attestation CAF") }, hint: ctx.isBeginner() ? "pages" : null, onEvent: (t, d) => {
            if (t === "cancel") { dlg.destroy(); m.remove(); }
            if (t === "print") {
              const ok = { dest: d.dest === HP, pages: d.pages.length === 1 && d.pages[0] === 1, color: d.color === "bw", copies: d.copies === 1 };
              if (!L.graded) {
                L.graded = true;
                (ok.dest ? G.ok : G.ko)("dest", "Choisir la bonne imprimante", "Destination : l'imprimante de la médiathèque. « Enregistrer au format PDF » crée un fichier, sans rien imprimer.");
                (ok.pages ? G.ok : G.ko)("pages", "Imprimer une seule page", "Pages › Personnalisées › 1 : on économise 2 feuilles.");
                (ok.color ? G.ok : G.ko)("color", "Imprimer en noir et blanc", "Couleur › Noir et blanc : moins cher, et suffisant pour une attestation.");
                (ok.copies ? G.ok : G.ko)("copies", "Une seule copie", "Copies : 1.");
              }
              const bad = Object.entries(ok).filter(([, v]) => !v).map(([k]) => ({ dest: "l'imprimante", pages: "les pages (seulement la 1)", color: "la couleur (noir et blanc)", copies: "le nombre de copies (1)" })[k]);
              dlg.destroy(); m.remove();
              if (bad.length) { T.note(`<div class="alert">🖨️ Imprimé… mais vérifiez : ${bad.join(", ")}. Recommencez avec les bons réglages.</div>`); return; }
              T.done("print"); T.note(`<div class="alert good">✅ 1 feuille, en noir et blanc : bien joué, et 2 feuilles économisées ! 🌳</div>`); later(ctx, () => ctx.go(1), 2200);
            }
          } });
        };
        f.panel.querySelector("[data-print]").addEventListener("click", () => open("btn"));
        listen(ctx, document, "keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p" && alive(ctx) && (ctx.m.step || 0) === 0) { e.preventDefault(); if (!document.querySelector(".pk-overlay")) open("key"); } }, true);
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 4, title: "« Imprimer »… en PDF", step: 1, noClient: true,
          consigne: "Marie vient de prendre rendez-vous en ligne. Elle veut <b>garder la confirmation</b> sur son ordinateur, sans l'imprimer sur papier. Astuce : la fenêtre d'impression sait créer un fichier PDF !",
          help: "Ctrl + P, puis Destination › <b>Enregistrer au format PDF</b>, puis <b>Enregistrer</b>." });
        f.panel.innerHTML = `<div class="wk-tasks"></div><div class="fk-site" style="margin-top:10px"><div class="fk-site-head" style="background:#0b5d8a">🏥 Cabinet du Dr Martin · Rendez-vous confirmé <button type="button" data-print style="margin-left:auto;border:0;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer">🖨️ Imprimer</button></div><div class="fk-site-body"><h3 style="margin:0">✅ Votre rendez-vous est confirmé</h3><p>Mardi 14 octobre, 10 h 30, avec le Dr Martin.</p><p>Référence : RDV-58214</p></div></div>`;
        const T = tasker(f.panel.querySelector(".wk-tasks"), [{ k: "pdf", label: "Enregistrez cette page en <b>PDF</b> (sans papier)." }]);
        const open = () => {
          const m = overlay(ctx);
          const dlg = P().printDialog(m.firstChild, { big: ctx.demo, doc: { title: "RDV Dr Martin", pages: 1, pageHTML: pageHTML("RDV confirmé", "#0b5d8a") }, hint: ctx.isBeginner() ? "dest" : null, onEvent: (t, d) => {
            if (t === "cancel") { dlg.destroy(); m.remove(); }
            if (t === "print") {
              dlg.destroy(); m.remove();
              if (!d.pdf) { if (!G.has("pdf")) G.ko("pdf", "Enregistrer en PDF au lieu d'imprimer", "Destination › « Enregistrer au format PDF » : on obtient un fichier, sans papier."); T.note(`<div class="alert">🖨️ Ça part sur l'imprimante (du papier !). Choisissez plutôt la destination <b>Enregistrer au format PDF</b>.</div>`); return; }
              if (T.done("pdf")) { if (!G.has("pdf")) G.ok("pdf", "Enregistrer en PDF au lieu d'imprimer"); }
              T.note(`<div class="alert good">💾 Fichier <b>rdv_dr_martin.pdf</b> enregistré dans <b>Téléchargements</b>.</div>`);
              quiz(T.slot(), { G, key: "q4", questions: [
                { q: "Le raccourci pour imprimer, presque partout :", choices: ["Ctrl + P", "Ctrl + I", "Alt + F4"], ok: 0, why: "P comme « print » (imprimer en anglais)." },
                { q: "Pour une attestation de 3 pages dont seule la 1re compte :", choices: ["J'imprime tout", "Pages › Personnalisées › 1"], ok: 1, why: "On choisit les pages : moins de papier, moins d'encre." },
                { q: "« Enregistrer au format PDF », ça fait quoi ?", choices: ["Ça imprime sur papier", "Ça crée un fichier PDF, sans papier"], ok: 1, why: "Pratique pour garder une confirmation, un billet, un reçu… et l'envoyer par e-mail." }
              ], onDone: () => finish(ctx, G, { key: "per_imprimer", label: "Je sais imprimer juste ce qu'il faut", intro: "Vous savez choisir l'imprimante, les pages, la couleur, et créer un PDF au lieu d'imprimer." }) });
            }
          } });
        };
        f.panel.querySelector("[data-print]").addEventListener("click", open);
        listen(ctx, document, "keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p" && alive(ctx) && (ctx.m.step || 0) === 1) { e.preventDefault(); if (!document.querySelector(".pk-overlay")) open(); } }, true);
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 5 — « L'imprimante n'imprime pas »
     ========================================================= */
  const PANNES = [
    { id: "paper", title: "L'imprimante affiche un message", state: "nopaper", fix: "paper", cause: "Il n'y avait plus de <b>papier</b> dans le bac." },
    { id: "off", title: "Rien ne se passe", state: "off", fix: "power", cause: "L'imprimante était <b>éteinte</b> : Windows disait « Hors connexion »." },
    { id: "blocked", title: "Le document reste bloqué", state: "ok", blocked: true, fix: "cancel", cause: "Le document était <b>bloqué</b> dans la file d'attente : on l'annule, puis on relance l'impression." },
    { id: "jam", title: "Un bruit, puis plus rien", state: "jam", fix: "jam", cause: "Une feuille était <b>coincée</b> : on ouvre le capot et on la retire doucement." }
  ];
  R("per_panne", {
    steps: 4,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      const list = PANNES;
      const step = ctx.m.step || 0, Pn = list[step];
      if (!Pn) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 5, title: `L'imprimante n'imprime pas : ${Pn.title} (${step + 1} / ${list.length})`, step: Math.min(step, 3), noClient: true,
        consigne: "Marie a cliqué sur « Imprimer »… et rien ne sort. Regardez l'<b>écran de l'imprimante</b> et la <b>file d'attente</b> de Windows, puis réparez.",
        help: "Ne cliquez pas dix fois sur « Imprimer » ! Chaque clic ajoute un document dans la file d'attente." });
      f.panel.innerHTML = `<div class="wk-tasks"></div><div style="display:flex;gap:10px;align-items:center;margin:10px 0"><span>📕 attestation.pdf</span><button type="button" class="secondary" data-again>🖨️ Imprimer à nouveau</button></div><div class="pq-slot"></div>`;
      const T = tasker(f.panel.querySelector(".wk-tasks"), [{ k: "fix", label: "Trouvez la panne et réparez." }, { k: "out", label: "Vérifiez que la feuille sort (une seule !)." }]);
      let extra = 0, printedN = 0;
      const pr = keep(ctx, P().printer(f.panel.querySelector(".pq-slot"), { state: Pn.state, big: ctx.demo, hint: ctx.isBeginner() ? null : null, onEvent: (t, d, x) => {
        if (t === "hint") T.note(`<div class="alert">${d.msg}</div>`);
        const fixed = (t === "paper" && d.fixed && Pn.fix === "paper") || (t === "power" && d.on && Pn.fix === "power") || (t === "cancelJob" && Pn.fix === "cancel") || (t === "jam" && d.fixed && Pn.fix === "jam");
        if (fixed && T.done("fix")) { G.ok("fix_" + Pn.id, `Panne ${step + 1} : trouver la cause`); if (Pn.fix === "cancel") T.note(`<div class="alert">👍 Document annulé. Maintenant, relancez l'impression : <b>🖨️ Imprimer à nouveau</b>.</div>`); }
        if (t === "restartBlocked") T.note(`<div class="alert">Le document reste bloqué. Le plus sûr : l'<b>annuler</b>, puis relancer l'impression.</div>`);
        if (t === "power" && !d.on && Pn.fix !== "power") T.note(`<div class="alert">Vous avez éteint l'imprimante. Rallumez-la avec ⏻.</div>`);
        if (t === "printed") {
          printedN++;
          if (T.is("fix") && !T.is("out")) {
            T.done("out");
            (extra > 0 ? G.ko : G.ok)("once_" + Pn.id, `Panne ${step + 1} : une seule feuille imprimée`, "Chaque clic sur « Imprimer » ajoute un document : réparé, l'imprimante sort tout… en plusieurs exemplaires !");
            T.note(`<div class="alert good">✅ ${Pn.cause}${extra > 0 ? ` <br>⚠️ Mais vous aviez relancé ${extra} fois : ${extra + 1} feuilles sortent !` : ""}</div>`);
            if (step < list.length - 1) { T.slot().innerHTML = `<button type="button" class="primary" data-n>Panne suivante →</button>`; T.slot().querySelector("[data-n]").addEventListener("click", () => ctx.go(step + 1)); }
            else quiz(T.slot(), { G, key: "q5", questions: [
              { q: "Rien ne sort de l'imprimante. Le premier réflexe ?", choices: ["Recliquer sur Imprimer plusieurs fois", "Regarder l'écran de l'imprimante et la file d'attente"], ok: 1, why: "Les messages disent presque toujours la panne : papier, éteinte, bourrage, document bloqué." },
              { q: "Windows indique « Hors connexion ». Je vérifie…", choices: ["Que l'imprimante est allumée et branchée (ou sur le même Wi-Fi)", "La Corbeille"], ok: 0, why: "« Hors connexion » : l'ordinateur ne voit plus l'imprimante." },
              { q: "Une feuille est coincée :", choices: ["Je tire très fort", "J'ouvre le capot et je la retire doucement, imprimante éteinte si possible"], ok: 1, why: "Doucement, dans le sens de la sortie du papier, pour ne pas laisser de morceaux." }
            ], onDone: () => finish(ctx, G, { key: "per_panne", label: "Je sais dépanner une imprimante", intro: "Papier, imprimante éteinte, document bloqué : vous savez lire les messages et réparer, sans imprimer dix fois." }) });
          }
        }
      } }));
      pr.add({ name: "attestation.pdf", pages: 1, status: Pn.blocked ? "blocked" : "waiting" });
      f.panel.querySelector("[data-again]").addEventListener("click", () => {
        if (!T.is("fix")) { extra++; if (extra === 1) T.note(`<div class="alert">📄 Un document de plus dans la file d'attente… Il vaut mieux <b>réparer d'abord</b>.</div>`); }
        pr.add({ name: "attestation.pdf", pages: 1 });
      });
    }
  });

  /* =========================================================
     NIVEAU 6 — La clé USB
     ========================================================= */
  R("per_usb", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { level: 6, title: "La clé USB : brancher, copier, éjecter", step: 0,
        consigne: "Marie veut emporter son CV à la médiathèque pour l'imprimer. Elle le <b>copie</b> sur une clé USB… sans oublier de l'<b>éjecter</b> avant de la retirer.",
        help: "Pour copier : clic sur le fichier, <b>📄 Copier</b>, ouvrez la clé USB, <b>📋 Coller</b>. (Ou glissez le fichier sur la clé, dans la colonne de gauche.)" });
      const { pc, file, folder } = AN.files;
      const fs = pc({ documents: [file("CV_Marie_Dupont.pdf", { tag: "cv", ago: 4, content: "<h3>Marie Dupont</h3><p>Curriculum vitae (fictif)</p>" }), file("lettre_motivation.docx", { ago: 4 }), folder("Santé", [])] });
      f.host.insertAdjacentHTML("beforebegin", `<div class="wk-usb" style="display:flex;gap:10px;flex-wrap:wrap;margin:10px 0"><button type="button" class="secondary" data-plug>🔌 Brancher la clé USB</button><button type="button" class="secondary" data-unplug disabled>✋ Retirer la clé USB</button></div>`);
      const btnPlug = ctx.box.querySelector("[data-plug]"), btnUn = ctx.box.querySelector("[data-unplug]");
      const T = tasker(f.panel, [
        { k: "plug", label: "Branchez la clé USB (bouton 🔌 ci-dessus)." },
        { k: "copy", label: "Copiez <b>CV_Marie_Dupont</b> (dans Documents) sur la <b>clé USB</b>." },
        { k: "check", label: "Ouvrez la clé USB pour vérifier que le CV y est." },
        { k: "eject", label: "<b>Éjectez</b> la clé : clic droit sur la clé › <b>Éjecter</b> (ou le bouton ⏏️)." },
        { k: "unplug", label: "Maintenant, retirez la clé (bouton ✋ ci-dessus)." }
      ]);
      let drive = null, ejected = false;
      const x = keep(ctx, AN.files.explorer(f.host, { fs, start: "documents", big: ctx.demo, features: { copy: true, newFolder: false, rename: false, trash: false }, onEvent: (t, d) => {
        if (t === "move" && drive && x.driveOf(d.to) === drive) T.note(`<div class="alert">Vous avez <b>déplacé</b> le fichier : il n'est plus dans Documents ! Pour la clé, on <b>copie</b> (le fichier reste aussi sur l'ordinateur).</div>`);
        if (t === "copy" && d.toDrive === drive && d.src.tag === "cv") { if (T.done("copy")) G.ok("copy", "Copier un fichier sur la clé USB"); }
        if (t === "navigate" && d.folder === drive && T.is("copy") && T.done("check")) G.ok("check", "Vérifier le contenu de la clé");
        if (t === "eject") {
          if (!T.is("copy")) { x.flash("Copiez d'abord le CV sur la clé 🙂", "info"); return; }
          ejected = true; x.removeNode(drive); drive = null;
          if (!T.is("check")) T.done("check");
          if (T.done("eject")) G.ok("eject", "Éjecter la clé avant de la retirer");
          x.flash("✅ « Le matériel peut être retiré en toute sécurité. »", "good", 5000);
        }
      } }));
      btnPlug.addEventListener("click", () => {
        if (drive) return;
        drive = folder("Clé USB (E:)", [file("photos_vacances_2024.zip", { ago: 300, size: 48000 })], { icon: "💾", special: true }); drive.drive = true;
        x.addNode(null, drive); btnPlug.disabled = true; btnUn.disabled = false;
        x.flash("💾 <b>Clé USB (E:)</b> détectée : elle apparaît dans la colonne de gauche, sous « Ce PC ».", "info", 5000);
        if (T.done("plug")) G.ok("plug", "Brancher une clé USB");
        if (ctx.isBeginner()) x.hint(x.find(n => n.tag === "cv").id, "copy");
      });
      btnUn.addEventListener("click", () => {
        if (!T.is("copy")) { T.note(`<div class="alert">Copiez d'abord le CV sur la clé !</div>`); return; }
        if (!ejected) {
          G.ko("eject", "Éjecter la clé avant de la retirer", "Retirer sans éjecter peut abîmer le fichier, surtout si la copie n'est pas finie.");
          if (drive) x.removeNode(drive); drive = null; ejected = true; T.done("check"); T.done("eject");
          T.note(`<div class="alert bad">😬 Retirée sans éjecter : le fichier aurait pu être abîmé. La prochaine fois : clic droit › <b>Éjecter</b>, puis on retire.</div>`);
        }
        btnUn.disabled = true; T.done("unplug");
        if (!G.has("unplug")) G.ok("unplug", "Retirer la clé");
        end();
      });
      function end() {
        if (L.ended) return; L.ended = true; x.hint(null);
        quiz(T.slot(), { G, key: "q6", questions: [
          { q: "Je trouve une clé USB par terre, sur le parking. Je…", choices: ["La branche pour voir à qui elle est", "Ne la branche pas : je la rapporte à l'accueil"], ok: 1, why: "Une clé inconnue peut contenir un virus qui s'installe tout seul. On ne la branche jamais." },
          { q: "« Copier » vers la clé, ou « couper » ?", choices: ["Copier : le fichier reste aussi sur l'ordinateur", "Couper : c'est pareil"], ok: 0, why: "Couper déplace : le fichier quitte l'ordinateur. Pour emporter une copie, on copie." },
          { q: "Je supprime un fichier sur la clé USB. Il va dans la Corbeille ?", choices: ["Oui", "Non : souvent, il est supprimé pour de bon"], ok: 1, why: "Sur une clé, la suppression est souvent définitive. Windows demande « Voulez-vous vraiment… ? »." }
        ], onDone: () => finish(ctx, G, { key: "per_usb", label: "Je sais utiliser une clé USB", intro: "Vous savez brancher une clé, y copier un fichier, l'éjecter… et vous méfier des clés inconnues." }) });
      }
    }
  });

  /* =========================================================
     NIVEAU 7 — L'écran : zoom et confort
     ========================================================= */
  R("per_ecran", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 7, title: "Le zoom : agrandir une page", step: 0, noClient: true,
          consigne: "Le texte d'un site est trop petit ? Pas besoin de lunettes : on <b>zoome</b> ! Cliquez d'abord dans la page, puis utilisez le clavier.",
          help: "<b>Ctrl</b> + <b>+</b> agrandit · <b>Ctrl</b> + <b>-</b> réduit · <b>Ctrl</b> + <b>0</b> (zéro) remet à 100 %. On peut aussi garder Ctrl et tourner la molette." });
        f.panel.innerHTML = `<div class="wk-tasks"></div><div class="pz" style="margin-top:10px"><div class="pz-bar">🌐 <span class="pz-url">www.service-public.fr</span><button type="button" data-z="-1" title="Réduire">－</button><span class="pz-z">100 %</span><button type="button" data-z="1" title="Agrandir">＋</button></div>
          <div class="pz-page" tabindex="0"><div class="pz-in"><h3 style="margin:.2em 0">Carte d'identité : les démarches</h3><p>Vous pouvez faire une pré-demande en ligne, puis prendre rendez-vous en mairie. Pensez à préparer une photo d'identité récente et un justificatif de domicile.</p><p style="font-size:.75em;color:#555">Les petits caractères : le délai moyen est de 3 à 6 semaines selon les communes.</p></div></div></div>`;
        const T = tasker(f.panel.querySelector(".wk-tasks"), [
          { k: "in", label: "Agrandissez la page jusqu'à <b>150 %</b> (ou plus) : <b>Ctrl + +</b>." },
          { k: "out", label: "Réduisez un peu : <b>Ctrl + -</b>." },
          { k: "reset", label: "Remettez la taille normale, <b>100 %</b> : <b>Ctrl + 0</b>." }
        ]);
        const pg = f.panel.querySelector(".pz-page"), inner = f.panel.querySelector(".pz-in"), lab = f.panel.querySelector(".pz-z");
        const Z = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300];
        let z = 100, usedKeys = false;
        const set = (nz, how) => {
          z = nz; inner.style.transform = `scale(${z / 100})`; inner.style.width = `${10000 / z}%`; lab.textContent = z + " %";
          if (how === "key") usedKeys = true;
          if (z >= 150 && T.done("in")) (usedKeys ? G.ok : G.ko)("in", "Zoomer avec Ctrl + +", "Le raccourci Ctrl + + marche sur tous les sites. Le bouton, lui, n'existe pas partout.");
          else if (T.is("in") && !T.is("out") && z < 150 && how !== "reset") { if (T.done("out")) G.ok("out", "Réduire avec Ctrl + -"); }
          else if (T.is("out") && z === 100 && how === "reset") { if (T.done("reset")) G.ok("reset", "Revenir à 100 % avec Ctrl + 0"); end(); }
          else if (T.is("out") && z === 100) T.note(`<div class="alert">Ça marche aussi… mais essayez <b>Ctrl + 0</b> : c'est le raccourci le plus rapide pour revenir à 100 %.</div>`);
        };
        const step1 = d => { const i = Z.indexOf(z); set(Z[Math.max(0, Math.min(Z.length - 1, i + d))], "key"); };
        listen(ctx, pg, "keydown", e => {
          if (!(e.ctrlKey || e.metaKey)) return;
          if (["+", "=", "Add"].includes(e.key) || e.code === "NumpadAdd" || e.code === "Equal") { e.preventDefault(); step1(1); }
          else if (["-", "Subtract", "6"].includes(e.key) || e.code === "NumpadSubtract" || e.code === "Digit6" || e.code === "Minus") { e.preventDefault(); step1(-1); }
          else if (e.key === "0" || e.key === "à" || e.code === "Digit0" || e.code === "Numpad0") { e.preventDefault(); set(100, "reset"); }
        });
        listen(ctx, pg, "wheel", e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); step1(e.deltaY < 0 ? 1 : -1); }, { passive: false });
        f.panel.querySelectorAll("[data-z]").forEach(b => b.addEventListener("click", () => { const i = Z.indexOf(z); set(Z[Math.max(0, Math.min(Z.length - 1, i + Number(b.dataset.z)))], "btn"); }));
        pg.addEventListener("click", () => pg.focus());
        T.note(`<div class="alert">👆 Cliquez d'abord <b>dans la page</b> (elle s'entoure de bleu), puis Ctrl + +.</div>`);
        function end() { T.note(`<div class="alert good">✅ Vous savez zoomer ! Ça marche sur tous les sites, et même dans l'Explorateur.</div>`); later(ctx, () => ctx.go(1), 2000); }
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 7, title: "Le confort de l'écran", step: 1, noClient: true,
          consigne: "Dans les <b>Paramètres de Windows</b>, on peut tout agrandir pour de bon, et régler la luminosité. Réglez l'écran de Marie, qui a du mal à lire.",
          help: "Sur le vrai ordinateur : ⊞ Démarrer › ⚙️ Paramètres › Système › Affichage." });
        f.panel.innerHTML = `<div class="wk-tasks"></div><div class="pd-slot" style="margin-top:10px"></div>`;
        const T = tasker(f.panel.querySelector(".wk-tasks"), [
          { k: "text", label: "Agrandissez la <b>taille du texte</b> à <b>150 %</b> ou plus." },
          { k: "bright", label: "L'écran éblouit Marie le soir : baissez la <b>luminosité</b> à <b>60 %</b> ou moins." },
          { k: "night", label: "Activez l'<b>éclairage nocturne</b>." }
        ]);
        keep(ctx, P().display(f.panel.querySelector(".pd-slot"), { big: ctx.demo, onEvent: (t, d) => {
          if (d.text >= 150 && T.done("text")) G.ok("text", "Agrandir la taille du texte");
          if (d.bright <= 60 && T.done("bright")) G.ok("bright", "Régler la luminosité");
          if (d.night && T.done("night")) G.ok("night", "Activer l'éclairage nocturne");
          if (T.all && !L.ended) {
            L.ended = true;
            quiz(T.slot(), { G, key: "q7", questions: [
              { q: "Le texte d'UN site est trop petit. Le plus simple :", choices: ["Ctrl + + dans le navigateur", "Acheter un plus grand écran"], ok: 0, why: "Le zoom du navigateur agrandit la page, sans rien changer au reste." },
              { q: "Tout est trop petit sur l'ordinateur, partout :", choices: ["Paramètres › Affichage › Taille du texte (ou Mise à l'échelle)", "Ctrl + 0"], ok: 0, why: "Les Paramètres agrandissent tout, pour de bon." },
              { q: "Il existe aussi une loupe, pour agrandir une partie de l'écran :", choices: ["⊞ Windows + « + »", "Ctrl + Z"], ok: 0, why: "La Loupe de Windows suit la souris. Pour la fermer : ⊞ Windows + Échap." }
            ], onDone: () => finish(ctx, G, { key: "per_ecran", label: "Je sais régler l'écran pour mon confort", intro: "Zoom, taille du texte, luminosité, éclairage nocturne : l'ordinateur s'adapte à vos yeux." }) });
          }
        } }));
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });

  /* =========================================================
     NIVEAU 8 — Mission réelle
     ========================================================= */
  R("per_real", {
    steps: 2,
    render(ctx) {
      const step = ctx.m.step || 0, L = ctx.local, G = grader(L);
      if (step === 0) {
        const f = frame(ctx, { level: 8, title: "Mission réelle : l'ordinateur de la médiathèque", step: 0, noClient: true,
          consigne: "Sur le <b>vrai</b> ordinateur, en vrai : on observe et on essaie… <b>sans rien imprimer</b> et sans rien supprimer." });
        f.panel.innerHTML = `<ol class="nv-steps">
            <li>Regardez l'ordinateur : combien de <b>prises USB</b> voyez-vous (devant, sur le côté, derrière l'écran) ?</li>
            <li>Sur une page Internet (cet onglet, par exemple), appuyez sur <b>Ctrl + P</b>. Regardez la liste <b>Destination</b> : quel est le nom de l'imprimante ? Puis cliquez sur <b>Annuler</b>.</li>
            <li>Sur une page Internet, essayez <b>Ctrl + +</b>, puis <b>Ctrl + 0</b>.</li>
            <li>Dans un champ de texte (la barre de recherche, par exemple), tapez <b>@</b> avec <b>Alt Gr + à</b>.</li></ol>
          <div class="alert">🖨️ On clique sur <b>Annuler</b> dans la fenêtre d'impression : on n'imprime rien. Une question ? On lève la main ✋.</div>
          <div class="final-actions"><button type="button" class="primary" data-go>J'ai fait la mission : je réponds →</button></div>`;
        f.panel.querySelector("[data-go]").addEventListener("click", () => ctx.go(1));
        return;
      }
      if (step === 1) {
        const f = frame(ctx, { level: 8, title: "Mes observations", step: 1, noClient: true, consigne: "Répondez à partir de ce que vous avez vu sur le vrai ordinateur." });
        const chk = (name, vals) => vals.map(v => `<label><input type="radio" name="${name}" value="${v}"> ${v}</label>`).join("");
        f.panel.innerHTML = `<div class="nv-real">
          <fieldset class="nv-check"><legend><b>🔌 Prises USB trouvées</b></legend>${chk("usb", ["Aucune", "1 ou 2", "3 ou 4", "5 ou plus"])}</fieldset>
          <label>🖨️ Le nom de l'imprimante (dans « Destination »)<input type="text" data-f="printer" autocomplete="off" maxlength="80"></label>
          <fieldset class="nv-check"><legend><b>✅ J'ai réussi à…</b> (cochez seulement ce qui est vrai)</legend>
            <label><input type="checkbox" data-c="ctrlp"> ouvrir la fenêtre d'impression avec Ctrl + P… et cliquer sur Annuler</label>
            <label><input type="checkbox" data-c="zoom"> zoomer avec Ctrl + +, puis revenir avec Ctrl + 0</label>
            <label><input type="checkbox" data-c="at"> taper @ avec Alt Gr + à</label>
            <label><input type="checkbox" data-c="noprint"> ne rien imprimer</label></fieldset>
          <label>💬 Une question, une difficulté ? (facultatif)<input type="text" data-f="note" maxlength="300" autocomplete="off"></label>
          <div class="mk-fb"></div>
          <div class="final-actions"><button type="button" class="secondary" data-back>← Revoir la mission</button><button type="button" class="primary" data-send>📤 Envoyer au formateur</button></div></div>`;
        const $f = s => f.panel.querySelector(s);
        $f("[data-back]").addEventListener("click", () => ctx.go(0));
        $f("[data-send]").addEventListener("click", async () => {
          const usb = f.panel.querySelector('[name="usb"]:checked')?.value || "", printer = $f('[data-f="printer"]').value.trim(), note = $f('[data-f="note"]').value.trim();
          if (!usb) { $f(".mk-fb").innerHTML = `<div class="alert bad">Dites combien de prises USB vous avez trouvées 🙂</div>`; return; }
          const c = k => $f(`[data-c="${k}"]`).checked;
          $f("[data-send]").disabled = true;
          (usb !== "Aucune" ? G.ok : G.ko)("usb", "Repérer les prises USB", "Elles sont souvent sur le devant de l'unité centrale, ou sur le côté de l'écran ou du portable.");
          (printer ? G.ok : G.ko)("printer", "Trouver le nom de l'imprimante", "Ctrl + P, puis la liste « Destination » (ou « Imprimante »).");
          (c("ctrlp") ? G.ok : G.ko)("ctrlp", "Ouvrir l'impression avec Ctrl + P", "Ctrl + P marche dans le navigateur, dans un PDF, dans Word…");
          (c("zoom") ? G.ok : G.ko)("zoom", "Zoomer et revenir à 100 %", "Ctrl + + pour agrandir, Ctrl + 0 pour revenir.");
          (c("at") ? G.ok : G.ko)("at", "Taper l'arobase @", "Alt Gr (à droite de la barre d'espace) + la touche à 0.");
          (c("noprint") ? G.ok : G.ko)("noprint", "Ne rien imprimer pendant l'observation", "Pour cette mission, on clique sur Annuler.");
          const text = `🖨️ Mission réelle Périphériques\n🔌 Prises USB : ${usb}\n🖨️ Imprimante : ${printer || "(non trouvée)"}\n${c("ctrlp") ? "✅" : "⬜"} Ctrl + P · ${c("zoom") ? "✅" : "⬜"} zoom · ${c("at") ? "✅" : "⬜"} @ · ${c("noprint") ? "✅" : "⬜"} rien imprimé${note ? `\n💬 ${note}` : ""}`;
          try { await ctx.api.sendToTeacher?.("🖨️ Mission réelle : périphériques", text.slice(0, 1900)); }
          catch (e) { $f(".mk-fb").innerHTML = `<div class="alert bad">La réponse n'a pas pu partir : ${esc(e.message)}. Réessayez.</div>`; $f("[data-send]").disabled = false; return; }
          finish(ctx, G, { key: "per_real", label: "J'ai utilisé les périphériques du vrai ordinateur", intro: `${ctx.demo ? "En projection, la réponse n'est pas envoyée." : "📤 Vos observations sont parties chez le formateur : il vous répondra dans votre <b>messagerie</b>."}<br>Prises USB : <b>${esc(usb)}</b> · Imprimante : <b>${esc(printer || "non trouvée")}</b>` });
        });
        return;
      }
      ctx.finalScreen({ theme: null });
    }
  });
})(window.AN);
