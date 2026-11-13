/* =========================================================
   Exercices « Clic Master » (séances 3 à 6), en missions.
   Six missions, chacune notée sur /20 comme les autres niveaux :
   cm_trois_clics (séance 4) · cm_pieges (séance 6, lire avant d'agir)
   cm_extensions (séance 6) · cm_arbre (séance 6, arborescence)
   cm_corbeille (séances 5 et 6, menu contextuel et corbeille)
   cm_dictees (séances 3 et 6, recopier des phrases)
   Principe : on ne s'arrête jamais après une erreur, et chaque erreur
   reçoit un petit rappel bienveillant. Rien n'est envoyé ni supprimé
   pour de vrai.
   ========================================================= */
(function (AN) {
  "use strict";
  const { esc } = AN.util;
  const R = AN.missions.register;
  const { tasker, ctxMenu, kindly, good, shuffle } = AN.scKit;
  const grader = L => AN.mail.grader(L.grade ||= {});
  const frame = (ctx, o) => AN.missionKit.frame(ctx, o);
  const quiz = (el, o) => AN.missionKit.inlineQuiz(el, o);
  const alive = ctx => ctx.box.isConnected && ctx.box.__an?.ctx === ctx;
  const finish = (ctx, G, o) => { if (alive(ctx)) return AN.missionKit.finish(ctx, G, o); };
  const later = (ctx, fn, ms) => { const t = setTimeout(() => { if (alive(ctx)) fn(); }, ms); ctx.onCleanup(() => clearTimeout(t)); };
  const listen = (ctx, target, type, fn) => { target.addEventListener(type, fn); ctx.onCleanup(() => target.removeEventListener(type, fn)); };
  const plain = h => h.replace(/<[^>]+>/g, "");
  const kids = n => n.k || [];

  /* =========================================================
     SÉANCE 4 — « Trois clics, trois rôles » : le bon bouton sur le bon objet
     ========================================================= */
  const TROIS = [
    { p: "clic gauche sur le <b>cercle bleu</b>", t: "left", s: "circle", c: "#3b82f6" },
    { p: "clic droit sur le <b>carré orange</b>", t: "right", s: "square", c: "#ea580c" },
    { p: "clic gauche sur l'<b>étoile jaune</b>", t: "left", s: "star", c: "#eab308" },
    { p: "clic droit sur le <b>cercle vert</b>", t: "right", s: "circle", c: "#10b981" },
    { p: "clic gauche sur le <b>triangle violet</b>", t: "left", s: "triangle", c: "#8b5cf6" },
    { p: "clic droit sur le <b>coffre</b>", t: "right", s: "chest" },
    { p: "clic gauche sur le <b>dossier</b>", t: "left", s: "folder" },
    { p: "clic droit sur le <b>fichier</b>", t: "right", s: "file" }
  ];
  const SHAPE = {
    circle: c => `<i class="cm-sh" style="background:${c};border-radius:50%"></i>`,
    square: c => `<i class="cm-sh" style="background:${c};border-radius:12px"></i>`,
    triangle: c => `<i class="cm-tri" style="border-bottom-color:${c}"></i>`,
    star: () => `<i class="cm-emo">⭐</i>`,
    chest: () => `<i class="cm-emo">🧰</i>`,
    folder: () => `<i class="cm-emo">📁</i>`,
    file: () => `<i class="cm-emo">📄</i>`
  };

  R("cm_trois_clics", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { chapter: "Clic Master · séance 4", level: 1, title: "Trois clics, trois rôles", step: 0, noClient: true,
        consigne: "Lisez la consigne, puis faites le <b>bon geste</b> sur le <b>bon objet</b>. Clic gauche pour choisir ou agir, clic droit pour demander un menu.",
        help: "Clic gauche : un seul appui avec l'index. Clic droit : un appui avec le majeur, sur le bouton de droite. Lisez d'abord, puis agissez." });
      f.panel.innerHTML = `<div class="cm-prompt-box"></div><div class="cm-objs" role="group"></div><div class="mk-fb"></div>`;
      const box = f.panel.querySelector(".cm-prompt-box"), objs = f.panel.querySelector(".cm-objs"), fb = f.panel.querySelector(".mk-fb");
      let i = 0, tries = 0, lock = false;

      const show = () => {
        const r = TROIS[i];
        const pool = [...new Map(TROIS.filter(x => x.s !== r.s).map(x => [x.s, x])).values()];
        const set = shuffle([{ ...r, target: true }, ...shuffle(pool).slice(0, 3)]);
        tries = 0; lock = false; fb.innerHTML = "";
        box.innerHTML = `<div class="cm-num">Consigne ${i + 1} / ${TROIS.length}</div><div class="cm-prompt">👉 Faites le ${r.p}</div>`;
        objs.innerHTML = set.map((o, k) => `<button type="button" class="cm-obj" data-k="${k}" aria-label="${o.s}">${SHAPE[o.s](o.c)}</button>`).join("");
        objs.querySelectorAll(".cm-obj").forEach(b => {
          b.addEventListener("contextmenu", e => e.preventDefault());
          b.addEventListener("pointerdown", e => {
            if (lock || (e.button !== 0 && e.button !== 2)) return;
            const o = set[+b.dataset.k], want = r.t === "left" ? 0 : 2;
            if (!o.target) { tries++; fb.innerHTML = kindly(`Ce n'est pas le bon objet. Relisez : « ${plain(r.p)} ».`); return; }
            if (e.button !== want) {
              tries++;
              fb.innerHTML = kindly(r.t === "left" ? "Il fallait le bouton de <b>gauche</b> : un seul appui." : "Il fallait le bouton de <b>droite</b> : c'est lui qui ouvre le menu.");
              return;
            }
            lock = true;
            b.classList.add("ok");
            (tries ? G.ko : G.ok)(`cm4_${i}`, `Consigne ${i + 1} : ${plain(r.p)}`, tries ? "Le bon bouton, mais il a fallu revenir : relisez la consigne avant d'agir." : "");
            fb.innerHTML = good("✅ Bravo ! Consigne suivante…");
            later(ctx, () => { i++; if (i < TROIS.length) show(); else end(); }, 900);
          });
        });
      };
      function end() {
        finish(ctx, G, { key: "cm_trois_clics", label: "Je fais le bon geste sur le bon objet", intro: "Clic gauche pour agir, clic droit pour demander un menu : vous savez choisir le bon bouton." });
      }
      show();
    }
  });

  /* =========================================================
     SÉANCE 6 — Pièges de lecture : « Lire avant d'agir »
     ========================================================= */
  const fileCard = n => ({ name: n, html: `<span class="cm-ico">${n.endsWith(".jpg") ? "🖼️" : n.endsWith(".mp3") ? "🎵" : "📄"}</span><span class="cm-cap">${n}</span>` });
  const folderCard = n => ({ name: n, html: `<span class="cm-ico">📁</span><span class="cm-cap">${n}</span>` });

  R("cm_pieges", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { chapter: "Clic Master · séance 6", level: 1, title: "Lire avant d'agir : les pièges", step: 0, noClient: true,
        consigne: "Chaque consigne peut cacher un piège : un nom presque pareil, une extension, un bouton à côté. <b>Lisez en entier</b>, puis agissez.",
        help: "Avant chaque clic, trois questions : quel objet ? quelle extension ? quel geste ? Si on se trompe, rien n'est grave : on recommence." });
      f.panel.innerHTML = `<div class="cm-prompt-box"></div><div class="cm-stage"></div><div class="mk-fb"></div>`;
      const box = f.panel.querySelector(".cm-prompt-box"), stage = f.panel.querySelector(".cm-stage"), fb = f.panel.querySelector(".mk-fb");
      let s = 0, errs = 0, locked = false;

      // Affiche des cartes ; une seule est la bonne.
      const pickCards = (items, isOk, onWrong, onRight) => {
        stage.innerHTML = `<div class="cm-cards">${items.map((x, k) => `<button type="button" class="cm-card" data-k="${k}">${x.html}</button>`).join("")}</div>`;
        stage.querySelectorAll(".cm-card").forEach(b => b.addEventListener("click", () => {
          const x = items[+b.dataset.k];
          if (isOk(x)) { b.classList.add("ok"); stage.querySelectorAll(".cm-card").forEach(c => { c.disabled = true; }); onRight(); }
          else { b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 700); onWrong(x); }
        }));
      };
      const bad = msg => { if (locked) return; errs++; fb.innerHTML = kindly(msg); };
      const ok = () => {
        if (locked) return; locked = true;
        const st = STEPS[s];
        (errs ? G.ko : G.ok)(st.k, plain(st.label), errs ? "Un piège de lecture : relisez la consigne avant de cliquer." : "");
        fb.innerHTML = good("✅ Bien lu !");
        later(ctx, () => { s++; errs = 0; fb.innerHTML = ""; if (s < STEPS.length) run(); else end(); }, 900);
      };
      const run = () => {
        locked = false;
        box.innerHTML = `<div class="cm-num">Piège ${s + 1} / ${STEPS.length}</div><div class="cm-prompt">👉 ${STEPS[s].label}</div>`;
        STEPS[s].run(ok, bad);
      };

      const STEPS = [
        { k: "cm6_p0", label: "Ouvrir le dossier <b>Images</b> (et pas Documents)",
          run: (ok, bad) => pickCards(["Documents", "Images", "Téléchargements", "Bureau"].map(folderCard), x => x.name === "Images",
            x => bad(`La consigne disait « Images ». Vous avez cliqué sur « ${x.name} ».`), ok) },
        { k: "cm6_p1", label: "Le fichier dont l'extension est <b>.pdf</b>",
          run: (ok, bad) => pickCards(["Lettre.docx", "Notes.txt", "Vacances.jpg", "Musique.mp3", "Rapport.pdf", "Budget.xlsx"].map(fileCard),
            x => x.name.endsWith(".pdf"), () => bad("Lisez bien l'extension : c'est <b>.pdf</b>."), ok) },
        { k: "cm6_p2", label: "Le fichier dont l'extension est <b>.jpg</b>",
          run: (ok, bad) => pickCards(["Lettre.docx", "Notes.txt", "Rapport.pdf", "Musique.mp3", "Photo.jpg", "Budget.xlsx"].map(fileCard),
            x => x.name.endsWith(".jpg"), () => bad("Lisez bien l'extension : c'est <b>.jpg</b>."), ok) },
        { k: "cm6_p3", label: "Faire un <b>clic droit</b> sur <b>Vacances_2024.jpg</b>, puis choisir <b>Ouvrir</b>",
          run: (ok, bad) => {
            const photos = ["Vacances_2020.jpg", "Vacances_2021.jpg", "Vacances_2022.jpg", "Vacances_2023.jpg", "Vacances_2024.jpg"].map(fileCard);
            stage.innerHTML = `<div class="cm-cards">${photos.map((x, k) => `<button type="button" class="cm-card cm-ctx" data-k="${k}">${x.html}</button>`).join("")}</div>`;
            stage.querySelectorAll(".cm-card").forEach(b => {
              b.addEventListener("click", () => { b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 700); bad("Ici, il faut un <b>clic droit</b> pour ouvrir le menu."); });
              b.addEventListener("contextmenu", e => {
                e.preventDefault();
                const x = photos[+b.dataset.k];
                ctxMenu(ctx, stage, e, ["📂 Ouvrir", "✏️ Renommer"], idx => {
                  if (idx == null) return;
                  if (x.name !== "Vacances_2024.jpg") return bad(`La consigne disait <b>Vacances_2024.jpg</b>. Vous avez cliqué sur « ${x.name} ».`);
                  if (idx !== 0) return bad("La consigne disait : choisir <b>Ouvrir</b>, pas « Renommer ».");
                  b.classList.add("ok"); stage.querySelectorAll(".cm-card").forEach(c => { c.disabled = true; }); ok();
                });
              });
            });
          } },
        { k: "cm6_p4", label: "Cliquer sur <b>Valider</b>, pas sur Annuler",
          run: (ok, bad) => pickCards([{ name: "Annuler", html: `<span class="cm-btn">Annuler</span>` }, { name: "Valider", html: `<span class="cm-btn primary">Valider</span>` }],
            x => x.name === "Valider", x => bad(`La consigne dit « Valider », pas « ${x.name} ».`), ok) }
      ];

      function end() {
        stage.innerHTML = `<div class="cm-msg">🎉 Vous avez évité tous les pièges.</div>`;
        finish(ctx, G, { key: "cm_pieges", label: "Je lis la consigne avant d'agir", intro: "Le bon dossier, la bonne extension, le clic droit puis Ouvrir, et Valider plutôt qu'Annuler : vous savez lire avant d'agir." });
      }
      run();
    }
  });

  /* =========================================================
     SÉANCE 6 — Les extensions : fiches, associations, questions
     ========================================================= */
  const EXT = [
    { ext: ".txt", nom: "Fichier texte brut", logiciel: "Bloc-notes", conseil: "Pas de gras ni de couleurs : juste du texte." },
    { ext: ".docx", nom: "Document Word", logiciel: "Word ou LibreOffice Writer", conseil: "Titres, gras, tableaux : c'est un document mis en forme." },
    { ext: ".pdf", nom: "Document figé", logiciel: "Adobe Reader ou le navigateur", conseil: "La mise en page reste la même partout : idéal pour envoyer." },
    { ext: ".jpg", nom: "Image photo", logiciel: "Visionneuse de photos", conseil: "Ne renommez jamais un .jpg en .txt : la photo ne s'ouvrirait plus." },
    { ext: ".mp3", nom: "Fichier audio", logiciel: "Lecteur multimédia", conseil: "C'est du son, pas du texte : il ne s'ouvre pas avec un traitement de texte." }
  ];
  const PAIRS = [
    { f: "Lettre.docx", label: ".docx (Word)" },
    { f: "Rapport.pdf", label: ".pdf (figé)" },
    { f: "Vacances.jpg", label: ".jpg (photo)" },
    { f: "Notes.txt", label: ".txt (texte brut)" }
  ];
  const fileIcon = n => n.endsWith(".jpg") ? "🖼️" : n.endsWith(".mp3") ? "🎵" : "📄";

  R("cm_extensions", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { chapter: "Clic Master · séance 6", level: 1, title: "Les extensions : à quoi ça sert ?", step: 0, noClient: true,
        consigne: "Une extension, c'est le petit mot après le point, à la fin du nom. Elle indique le <b>logiciel</b> qui ouvre le fichier.",
        help: "Repérez l'extension avant d'ouvrir un fichier. Si vous hésitez, lisez les fiches : chaque extension a son logiciel." });
      f.panel.innerHTML = `<div class="cm-stage"></div><div class="mk-fb"></div>`;
      const stage = f.panel.querySelector(".cm-stage"), fb = f.panel.querySelector(".mk-fb");

      const intro = () => {
        stage.innerHTML = `<div class="cm-fiche">
            <h3>🧩 L'étiquette d'un fichier</h3>
            <p>Imaginez un fichier comme une boîte. L'extension est <b>l'étiquette</b> collée dessus :</p>
            <div class="cm-nomfich">Recette_gateau<b class="cm-dot">.</b><span class="cm-extx">pdf</span></div>
            <p>Elle dit à l'ordinateur <b>quel logiciel</b> utiliser. Avec une étiquette <b>.mp3</b>, il sait que c'est du son et ouvre un lecteur de musique.</p>
            <button type="button" class="primary" data-go>J'ai compris →</button></div>`;
        stage.querySelector("[data-go]").addEventListener("click", fiches);
      };

      const fiches = () => {
        stage.innerHTML = `<div class="cm-fiches">${EXT.map(e => `<article class="cm-ext-card"><span class="cm-badge">${e.ext}</span><h4>${e.nom}</h4><p><b>Logiciel :</b> ${e.logiciel}</p><p class="cm-tip">💡 ${e.conseil}</p></article>`).join("")}</div>
          <button type="button" class="primary" data-go>J'ai compris, on passe aux fichiers →</button>`;
        stage.querySelector("[data-go]").addEventListener("click", matching);
      };

      const matching = () => {
        let sel = null, errs = 0, matched = 0;
        const files = shuffle(PAIRS), labels = shuffle(PAIRS);
        stage.innerHTML = `<p class="cm-hint">Cliquez d'abord sur un fichier, puis sur son étiquette.</p>
          <div class="cm-row">${files.map(p => `<button type="button" class="cm-card" data-f="${p.f}">${fileIcon(p.f)}<span class="cm-cap">${p.f}</span></button>`).join("")}</div>
          <div class="cm-row">${labels.map(p => `<button type="button" class="cm-label" data-l="${p.label}">${p.label}</button>`).join("")}</div>`;
        stage.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => {
          if (b.disabled) return;
          stage.querySelectorAll("[data-f]").forEach(x => x.classList.remove("sel"));
          b.classList.add("sel"); sel = b.dataset.f;
        }));
        stage.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => {
          if (b.disabled) return;
          if (!sel) { fb.innerHTML = `<div class="alert">Cliquez d'abord sur un fichier, puis sur son étiquette.</div>`; return; }
          if (b.dataset.l === PAIRS.find(p => p.f === sel).label) {
            matched++;
            const fileBtn = stage.querySelector(`[data-f="${sel}"]`);
            fileBtn.classList.remove("sel"); fileBtn.classList.add("ok"); fileBtn.disabled = true;
            b.classList.add("ok"); b.disabled = true; sel = null;
            if (matched === PAIRS.length) {
              (errs ? G.ko : G.ok)("cm6_match", "Associer chaque fichier à son extension", errs ? "Relisez l'extension : elle indique le type de fichier." : "");
              fb.innerHTML = good("✅ Toutes les étiquettes sont bien placées !");
              later(ctx, questions, 1000);
            }
          } else {
            errs++;
            b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 700);
            fb.innerHTML = kindly(`Relisez l'extension : « ${sel} » se termine par <b>${sel.split(".").pop()}</b>.`);
          }
        }));
      };

      const questions = () => {
        fb.innerHTML = "";
        stage.innerHTML = `<div class="cm-quiz"></div>`;
        quiz(stage.querySelector(".cm-quiz"), { G, key: "cm6_ext", questions: [
          { q: "Un fichier se termine par <b>.pdf</b>. Avec quoi s'ouvre-t-il le plus souvent ?", choices: ["Un lecteur de musique", "Adobe Reader ou le navigateur", "La visionneuse de photos"], ok: 1, why: "Le .pdf est un document figé : on l'ouvre avec Adobe Reader ou un navigateur." },
          { q: "Je veux écrire une lettre avec des titres en gras. Quelle extension choisir ?", choices: [".txt", ".docx", ".mp3"], ok: 1, why: "Le .docx garde la mise en forme. Le .txt ne garde que le texte, sans gras." },
          { q: "Je renomme « Vacances.jpg » en « Vacances.txt ». Que se passe-t-il ?", choices: ["Rien : c'est seulement un nom", "La photo ne s'ouvre plus comme une image : l'extension indique le logiciel"], ok: 1, why: "L'extension dit à l'ordinateur quel logiciel utiliser. On ne la change jamais." }
        ], onDone: () => finish(ctx, G, { key: "cm_extensions", label: "Je reconnais les extensions et leur logiciel", intro: "Une extension dit quel logiciel ouvre le fichier : vous savez les reconnaître, et ne jamais les changer." }) });
      };

      intro();
    }
  });

  /* =========================================================
     SÉANCE 6 — L'arborescence : déplier, ouvrir, Précédent, Parent
     ========================================================= */
  const TREE = { n: "Ce PC", k: [
    { n: "Disque local (C:)", k: [
      { n: "Utilisateurs", k: [
        { n: "Camille", k: [
          { n: "Documents", k: [
            { n: "Maison", k: [
              { n: "Factures", k: [{ n: "Facture_EDF.pdf", f: 1 }, { n: "Facture_eau.pdf", f: 1 }] },
              { n: "Courriers", k: [] },
              { n: "Photos", k: [] }
            ] },
            { n: "Travail", k: [] },
            { n: "Administratif", k: [] }
          ] },
          { n: "Images", k: [{ n: "Vacances", k: [] }, { n: "Famille", k: [] }] }
        ] }
      ] }
    ] }
  ] };
  const findNode = (node, name) => node.n === name ? node : kids(node).map(c => findNode(c, name)).find(Boolean) || null;
  const parentOf = (node, target) => kids(node).some(c => c === target) ? node : kids(node).map(c => parentOf(c, target)).find(Boolean) || null;
  const pathTo = (node, target, acc = []) => { const here = [...acc, node]; if (node === target) return here; for (const c of kids(node)) { const r = pathTo(c, target, here); if (r) return r; } return null; };

  R("cm_arbre", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { chapter: "Clic Master · séance 6", level: 1, title: "L'arborescence : circuler dans les dossiers", step: 0, noClient: true,
        consigne: "Vos dossiers forment un <b>arbre</b> : la racine en haut, les dossiers dedans, les fichiers au bout. Suivez les consignes pour vous déplacer.",
        help: "Le + déplie un dossier. Un double-clic l'ouvre dans la fenêtre de droite. ← Précédent revient à l'endroit d'avant, ↑ Parent remonte d'un niveau." });
      const LABEL = {
        plus: "Déplier l'arbre : cliquez sur le <b>+</b> à côté de <b>Documents</b>",
        open: "Ouvrir <b>Documents</b> : <b>double-clic</b> dessus dans la fenêtre de droite",
        deep: "Descendre encore : ouvrez <b>Maison</b>, puis <b>Factures</b>",
        back: "Revenir en arrière avec <b>←</b> (Précédent) : vous êtes de nouveau dans <b>Maison</b>",
        up: "Remonter d'un niveau avec <b>↑</b> (Parent) : vous revenez dans <b>Documents</b>"
      };
      f.panel.innerHTML = `<div class="cm-tasks"></div><div class="cm-stage"></div>`;
      const T = tasker(f.panel.querySelector(".cm-tasks"), Object.keys(LABEL).map(k => ({ k, label: LABEL[k] })));
      const stage = f.panel.querySelector(".cm-stage");
      const tErr = {};
      const expanded = new Set([TREE, findNode(TREE, "Disque local (C:)"), findNode(TREE, "Utilisateurs"), findNode(TREE, "Camille")]);
      let cur = findNode(TREE, "Camille"), hist = [], sel = null;

      const miss = (k, msg) => { tErr[k] = (tErr[k] || 0) + 1; T.note(kindly(msg)); };
      const complete = k => {
        if (T.next?.k !== k || !T.done(k)) return;
        (tErr[k] ? G.ko : G.ok)(`cm6_arb_${k}`, plain(LABEL[k]), tErr[k] ? "Un détour avant de réussir : pas grave, on s'y habitue." : "");
        T.note(good("✅ Très bien !"));
        if (T.all) later(ctx, end, 900);
      };
      const go = (node) => {
        if (node.f || node === cur) return;
        hist.push(cur); cur = node;
        if (node.n === "Documents") complete("open");
        if (node.n === "Factures") complete("deep");
        draw();
      };
      const treeHTML = () => {
        let out = "";
        const walk = (node, d) => {
          const has = kids(node).length > 0 && !node.f, open = expanded.has(node);
          out += `<div class="cm-trow" style="padding-left:${d * 18}px">${has
            ? `<button type="button" class="cm-tog" data-tog="${esc(node.n)}" aria-label="${open ? "Replier" : "Déplier"} ${esc(node.n)}">${open ? "−" : "+"}</button>`
            : `<span class="cm-tog-x"></span>`}<button type="button" class="cm-tn ${node === cur ? "on" : ""}" data-nav="${esc(node.n)}">${node.f ? "📄" : "📁"} ${esc(node.n)}</button></div>`;
          if (open) kids(node).forEach(c => walk(c, d + 1));
        };
        walk(TREE, 0);
        return out;
      };
      const contentHTML = () => kids(cur).length
        ? kids(cur).map(c => `<button type="button" class="cm-item ${sel === c ? "sel" : ""}" data-item="${esc(c.n)}">${c.f ? "📄" : "📁"}<span>${esc(c.n)}</span></button>`).join("")
        : `<p class="cm-empty">Ce dossier est vide.</p>`;
      const draw = () => {
        const crumb = pathTo(TREE, cur).map(n => esc(n.n)).join(" › ");
        stage.innerHTML = `<div class="cm-bar">
            <button type="button" class="cm-nav" data-back ${hist.length ? "" : "disabled"}>← Précédent</button>
            <button type="button" class="cm-nav" data-up ${parentOf(TREE, cur) ? "" : "disabled"}>↑ Parent</button>
            <span class="cm-crumb">${crumb}</span></div>
          <div class="cm-explorer"><div class="cm-tree" role="tree">${treeHTML()}</div><div class="cm-content">${contentHTML()}</div></div>`;
      };

      listen(ctx, stage, "click", e => {
        const tog = e.target.closest("[data-tog]"), nav = e.target.closest("[data-nav]"), item = e.target.closest("[data-item]");
        const back = e.target.closest("[data-back]"), up = e.target.closest("[data-up]");
        if (tog) {
          const node = findNode(TREE, tog.dataset.tog), was = expanded.has(node);
          if (was) expanded.delete(node); else expanded.add(node);
          if (!was && node.n === "Documents") complete("plus");
          else if (!was && T.next?.k === "plus") miss("plus", "Cherchez le <b>+</b> à côté de <b>Documents</b>.");
          return draw();
        }
        if (nav) return go(findNode(TREE, nav.dataset.nav));
        if (item) { sel = findNode(TREE, item.dataset.item); stage.querySelectorAll("[data-item]").forEach(x => x.classList.toggle("sel", x === item)); return; }
        if (back) {
          if (!hist.length) return;
          cur = hist.pop();
          if (cur.n === "Maison") complete("back");
          else if (T.next?.k === "back") miss("back", "Pas encore : c'est le bouton <b>←</b> qui revient à l'endroit d'avant.");
          return draw();
        }
        if (up) {
          const p = parentOf(TREE, cur);
          if (!p) return;
          cur = p;
          if (cur.n === "Documents") complete("up");
          else if (T.next?.k === "up") miss("up", "Le bouton <b>↑</b> remonte d'un niveau.");
          return draw();
        }
      });
      listen(ctx, stage, "dblclick", e => {
        const item = e.target.closest("[data-item]");
        if (!item) return;
        const node = findNode(TREE, item.dataset.item);
        if (node.f) return;
        if (T.next?.k === "open" && node.n !== "Documents") return miss("open", "Documents d'abord : c'est le dossier qui contient le reste.");
        if (T.next?.k === "deep" && node.n !== "Maison" && node.n !== "Factures") return miss("deep", "Cherchez <b>Maison</b>, puis <b>Factures</b>.");
        go(node);
      });

      function end() {
        stage.insertAdjacentHTML("beforeend", `<div class="cm-msg">🎉 Vous savez circuler dans l'arbre des dossiers.</div>`);
        finish(ctx, G, { key: "cm_arbre", label: "Je navigue dans l'arborescence des dossiers", intro: "Le + déplie, un double-clic ouvre, ← revient, ↑ remonte : vous savez circuler dans l'arbre des dossiers." });
      }
      draw();
    }
  });

  /* =========================================================
     SÉANCES 5 et 6 — Supprimer, corbeille, restaurer, vider
     ========================================================= */
  const COPIE = "Rapport (copie).docx";

  R("cm_corbeille", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { chapter: "Clic Master · séances 5 et 6", level: 1, title: "Supprimer, corbeille et restaurer", step: 0, noClient: true,
        consigne: "Dans le dossier <b>Documents</b>, il y a un <b>doublon</b> : « (copie) ». Supprimez seulement le doublon, puis apprenez à le récupérer.",
        help: "Supprimer n'efface pas tout de suite : le fichier part dans la <b>Corbeille</b>. Il y reste jusqu'à ce qu'on la vide. Clic droit = menu ; double-clic = ouvrir." });
      f.panel.innerHTML = `<div class="cm-tasks"></div><div class="cm-stage"></div>`;
      const stage = f.panel.querySelector(".cm-stage");
      const LABEL = {
        del: `Clic droit sur « <b>${COPIE}</b> », puis <b>Supprimer</b> : le doublon part à la corbeille`,
        open: "<b>Double-clic</b> sur l'icône <b>Corbeille</b> du bureau : sa fenêtre s'ouvre",
        restore: `Cliquez sur « <b>${COPIE}</b> » dans la corbeille, puis sur <b>Restaurer</b>`,
        empty: "Clic droit sur la <b>Corbeille</b>, « Vider la corbeille ». Lisez le message, puis cliquez sur <b>Annuler</b>"
      };
      const T = tasker(f.panel.querySelector(".cm-tasks"), Object.keys(LABEL).map(k => ({ k, label: LABEL[k] })));
      const tErr = {};
      let docs = ["Rapport.docx", COPIE, "Lettre.txt"], trash = ["Vieux_brouillon.txt"];
      let trashOpen = false, sel = null, dialog = false;

      const miss = (k, msg) => { tErr[k] = (tErr[k] || 0) + 1; T.note(kindly(msg)); };
      const complete = k => {
        if (T.next?.k !== k || !T.done(k)) return;
        (tErr[k] ? G.ko : G.ok)(`cm6_cor_${k}`, plain(LABEL[k]), tErr[k] ? "Un détour avant de réussir : on relit le menu et les icônes." : "");
        T.note(good("✅ Très bien !"));
        if (T.all) later(ctx, end, 900);
        else draw();
      };
      const deleteFile = name => {
        if (T.is("del")) return;
        if (name === COPIE) { docs = docs.filter(x => x !== name); trash.push(name); complete("del"); return; }
        miss("del", `Ce n'est pas le doublon. On ne supprime que « ${COPIE} », celui qui a « (copie) » dans son nom.`);
      };
      const restore = () => {
        if (!sel) return miss("restore", "Cliquez d'abord sur le fichier de la corbeille, puis sur <b>Restaurer</b>.");
        if (sel !== COPIE) return miss("restore", `Ce fichier n'est pas celui du doublon. Restaurez « ${COPIE} ».`);
        trash = trash.filter(x => x !== sel); docs.push(sel); sel = null;
        complete("restore");
      };

      const draw = () => {
        const docWin = `<div class="cm-win"><div class="cm-win-h">📁 Documents</div><div class="cm-win-b">${docs.map(n => `<button type="button" class="cm-file" data-file="${esc(n)}">📄 ${esc(n)}</button>`).join("")}</div></div>`;
        const trashWin = trashOpen ? `<div class="cm-win cm-win-trash"><div class="cm-win-h">🗑️ Corbeille</div><div class="cm-win-b">${trash.length
          ? trash.map(n => `<button type="button" class="cm-file ${sel === n ? "sel" : ""}" data-tfile="${esc(n)}">🗑️ ${esc(n)}</button>`).join("")
          : `<p class="cm-empty">La corbeille est vide.</p>`}</div>
          <div class="cm-win-f"><button type="button" class="primary" data-restore ${sel ? "" : "disabled"}>Restaurer</button></div></div>` : "";
        const dlg = dialog ? `<div class="cm-dialog" role="dialog" aria-label="Vider la corbeille"><p><b>Vider la corbeille ?</b><br>Les fichiers seront effacés <b>définitivement</b>. On ne pourra plus les restaurer.</p>
          <div class="cm-win-f"><button type="button" class="primary" data-dlg="cancel">Annuler</button><button type="button" data-dlg="ok">Vider</button></div></div>` : "";
        stage.innerHTML = `<div class="cm-desk">
            <div class="cm-desk-icons"><button type="button" class="cm-tr-icon" data-trash aria-label="Corbeille"><span>🗑️</span><span>Corbeille</span></button></div>
            ${docWin}${trashWin}${dlg}</div>`;
      };

      listen(ctx, stage, "contextmenu", e => {
        const file = e.target.closest("[data-file]"), tr = e.target.closest("[data-trash]");
        if (file && !dialog) {
          e.preventDefault();
          const name = file.dataset.file;
          ctxMenu(ctx, stage, e, ["📂 Ouvrir", "✏️ Renommer", "🗑️ Supprimer"], idx => {
            if (idx == null) return;
            if (idx === 2) return deleteFile(name);
            if (!T.is("del")) miss("del", "Pour supprimer, l'icône corbeille est en haut du menu, la <b>troisième</b> action.");
          });
        } else if (tr && !dialog) {
          e.preventDefault();
          ctxMenu(ctx, stage, e, ["📂 Ouvrir la corbeille", "🧹 Vider la corbeille"], idx => {
            if (idx == null) return;
            if (idx === 0) return openTrash();
            dialog = true; draw();
          });
        }
      });
      listen(ctx, stage, "dblclick", e => { if (e.target.closest("[data-trash]")) openTrash(); });
      listen(ctx, stage, "click", e => {
        const tf = e.target.closest("[data-tfile]");
        if (tf) { sel = tf.dataset.tfile; return draw(); }
        if (e.target.closest("[data-restore]")) return restore();
        const dlg = e.target.closest("[data-dlg]");
        if (dlg) {
          dialog = false;
          if (dlg.dataset.dlg === "cancel") { complete("empty"); return draw(); }
          if (!T.is("empty")) return draw();
          miss("empty", "Vider, c'est définitif : ici, on annule. Cliquez sur <b>Annuler</b>.");
          return draw();
        }
      });

      function openTrash() {
        trashOpen = true;
        if (T.next?.k === "open") complete("open"); else draw();
      }
      function end() {
        stage.insertAdjacentHTML("beforeend", `<div class="cm-msg">🎉 Le doublon est restauré et rien n'a été vidé.</div>`);
        finish(ctx, G, { key: "cm_corbeille", label: "Je supprime, j'ouvre la corbeille et je restaure", intro: "Supprimer met dans la corbeille, restaurer ramène le fichier. Vider est définitif : on lit toujours le message avant." });
      }
      draw();
    }
  });

  /* =========================================================
     SÉANCES 3 et 6 — Recopier des phrases avec accents et ponctuation
     ========================================================= */
  const PHRASES = ["Le café est chaud.", "L'été est arrivé.", "Où est la clé ?", "Elle a reçu une lettre.", "Le café de Camille est trop fort."];
  const clean = s => s.replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
  const noAcc = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const diag = (exp, typed) => {
    const t = clean(typed);
    if (t === exp) return null;
    if (noAcc(t) === noAcc(exp)) return "Il manque un ou plusieurs accents (é, è, ç…).";
    if (t.toLowerCase() === exp.toLowerCase()) return "Presque ! Il y a une majuscule à revoir.";
    if (t.replace(/ /g, "") === exp.replace(/ /g, "")) return "Les blancs ne sont pas au bon endroit : un blanc avant le « ? », un après chaque mot.";
    return "Une lettre est différente : relisez lettre à lettre et comparez avec le modèle.";
  };

  R("cm_dictees", {
    steps: 1,
    render(ctx) {
      const L = ctx.local, G = grader(L);
      if ((ctx.m.step || 0) > 0) return ctx.finalScreen({ theme: null });
      const f = frame(ctx, { chapter: "Clic Master · séances 3 et 6", level: 1, title: "Recopier des phrases sans faute", step: 0, noClient: true,
        consigne: "Lisez la phrase en entier, puis recopiez-la <b>lettre à lettre</b>, avec les accents et la ponctuation.",
        help: "é = touche 2 · è = 7 · à = 0 · ç = 9 · ù à droite du m. Le « ? » : Maj + la touche , avec un blanc avant. L'apostrophe : touche 4. Un blanc après chaque mot." });
      f.panel.innerHTML = `<div class="cm-prompt-box"></div><div class="cm-dic"></div><div class="mk-fb"></div>`;
      const box = f.panel.querySelector(".cm-prompt-box"), dic = f.panel.querySelector(".cm-dic"), fb = f.panel.querySelector(".mk-fb");
      let i = 0, tries = 0, first = null, active = false;

      const show = () => {
        const exp = PHRASES[i];
        tries = 0; first = null; active = true; fb.innerHTML = "";
        box.innerHTML = `<div class="cm-num">Phrase ${i + 1} / ${PHRASES.length}</div><div class="cm-model">${esc(exp)}</div>`;
        dic.innerHTML = `<label class="cm-lab">Votre recopie<input type="text" class="cm-in" autocomplete="off" spellcheck="false" autocapitalize="off" maxlength="120"></label>
          <div class="cm-acts"><button type="button" class="primary" data-check>Vérifier</button></div>`;
        const input = dic.querySelector("input");
        input.focus();
        const finishOne = msg => {
          active = false; input.disabled = true;
          dic.querySelector(".cm-acts").innerHTML = `<button type="button" class="primary" data-next>${i + 1 < PHRASES.length ? "Phrase suivante →" : "Terminer →"}</button>`;
          dic.querySelector("[data-next]").addEventListener("click", () => { i++; if (i < PHRASES.length) show(); else end(); });
          fb.innerHTML = msg;
        };
        const check = () => {
          if (!active || !clean(input.value)) return;
          tries++;
          const d = diag(exp, input.value);
          if (first === null) {
            first = d === null;
            (first ? G.ok : G.ko)(`cm_dic_${i}`, `Phrase « ${exp} »`, d || "");
          }
          if (d === null) return finishOne(good("✅ Parfait, c'est exactement le modèle !"));
          if (tries >= 3) return finishOne(kindly(`${d} On passe à la suivante : on y reviendra.`));
          fb.innerHTML = kindly(`${d} Essayez encore (${3 - tries} essai${3 - tries > 1 ? "s" : ""}).`);
        };
        dic.querySelector("[data-check]").addEventListener("click", check);
        input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); check(); } });
      };
      function end() {
        dic.innerHTML = `<div class="cm-msg">🎉 Toutes les phrases sont recopiées.</div>`;
        finish(ctx, G, { key: "cm_dictees", label: "Je recopie des phrases avec les accents et la ponctuation", intro: "Lire en entier, taper lettre à lettre, relire : vous savez recopier une phrase avec ses accents et sa ponctuation." });
      }
      show();
    }
  });
})(window.AN);
