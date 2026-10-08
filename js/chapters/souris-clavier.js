/* =========================================================
   Chapitre « Souris et clavier » (Clic Master · Clavinator)
   3 séances de 30 minutes : cours court projeté, jeux en direct,
   puis les exercices (8 niveaux, le dernier sur le vrai ordinateur).
   Le premier chapitre : tout le reste en dépend.
   ========================================================= */
(function (AN) {
  "use strict";
  const kbd = k => `<kbd>${k}</kbd>`;
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;

  /* ---------- la grande souris (dessin de la présentation Clic Master) ---------- */
  let nMouse = 0;
  const BODY = "M130 15 C 195 15, 245 70, 245 165 C 245 260, 210 345, 130 345 C 50 345, 15 260, 15 165 C 15 70, 65 15, 130 15 Z";
  const mouseSVG = (cls = "") => { const id = `scClip${++nMouse}`; return `<svg class="sc-mouse ${cls}" viewBox="0 0 260 360" aria-hidden="true">
    <defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs>
    <path d="${BODY}" fill="#ffffff"/>
    <g clip-path="url(#${id})"><rect class="part part-left" x="0" y="0" width="130" height="140"/><rect class="part part-right" x="130" y="0" width="130" height="140"/></g>
    <rect class="part part-wheel" x="118" y="42" width="24" height="58" rx="12"/>
    <path d="${BODY}" fill="none" stroke="#1a1730" stroke-opacity=".15" stroke-width="3"/></svg>`; };

  /* ---------- diapositives « en direct » ---------- */
  const mountMouse = el => {
    const zone = el.querySelector(".sc-live"); if (!zone) return null;
    const svg = el.querySelector(".sc-mouse"), out = el.querySelector(".sc-live-out"), leg = k => el.querySelector(`[data-leg="${k}"]`);
    let tm = null;
    const light = (part, msg) => {
      svg?.classList.remove("blink-left", "blink-right", "blink-wheel");
      el.querySelectorAll(".sc-mouse .part, .sc-mouse-legend div").forEach(p => p.classList.remove("on"));
      svg?.querySelector(`.part-${part}`)?.classList.add("on"); leg(part)?.classList.add("on");
      if (out) out.innerHTML = msg;
      clearTimeout(tm); tm = setTimeout(() => { el.querySelectorAll(".sc-mouse .part, .sc-mouse-legend div").forEach(p => p.classList.remove("on")); }, 700);
    };
    const down = e => { e.stopPropagation(); if (e.button === 0) light("left", "👆 Clic <b>gauche</b> : j'agis !"); else if (e.button === 2) light("right", "👉 Clic <b>droit</b> : j'explore les options !"); };
    const ctx = e => e.preventDefault();
    const dbl = () => light("left", "✌️ Un <b>double-clic</b> : toc-toc !");
    const wh = e => { e.preventDefault(); light("wheel", `🛞 La <b>molette</b> ${e.deltaY > 0 ? "descend ⬇️" : "monte ⬆️"}`); };
    zone.addEventListener("mousedown", down); zone.addEventListener("contextmenu", ctx); zone.addEventListener("dblclick", dbl); zone.addEventListener("wheel", wh, { passive: false });
    return () => { clearTimeout(tm); zone.removeEventListener("mousedown", down); zone.removeEventListener("contextmenu", ctx); zone.removeEventListener("dblclick", dbl); zone.removeEventListener("wheel", wh); };
  };
  const mountDbl = el => {
    const f = el.querySelector(".sc-demo-folder"), out = el.querySelector(".sc-live-out"); if (!f) return null;
    let last = 0;
    const click = () => { const now = Date.now(), gap = now - last; last = now; f.classList.add("sel"); if (gap < 1600 && gap > 500) out.innerHTML = `⏱️ ${gap} ms entre les deux clics : <b>trop lent</b>, ça fait deux clics simples.`; else if (gap >= 1600) out.innerHTML = "👆 Un clic : le dossier est <b>sélectionné</b> (bleu)."; };
    const dbl = () => { out.innerHTML = `📂 <b>Double-clic réussi</b> (toc-toc) : le dossier s'ouvre !`; f.querySelector("span").textContent = "📂"; const r = document.createElement("span"); r.className = "sc-ring"; f.appendChild(r); setTimeout(() => { r.remove(); f.querySelector("span").textContent = "📁"; }, 900); };
    f.addEventListener("click", click); f.addEventListener("dblclick", dbl);
    return () => { f.removeEventListener("click", click); f.removeEventListener("dblclick", dbl); };
  };
  const mountDrag = el => {
    const d = el.querySelector("[data-drag]"), z = el.querySelector("[data-drop]"), out = el.querySelector(".sc-live-out"); if (!d || !z) return null;
    let s = null;
    const over = e => { const b = z.getBoundingClientRect(); return e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom; };
    const pd = e => { if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); s = { x: e.clientX, y: e.clientY }; d.setPointerCapture?.(e.pointerId); d.classList.add("dragging"); out.innerHTML = "✊ Je garde le bouton <b>enfoncé</b>…"; };
    const pm = e => { if (!s) return; d.style.transform = `translate(${e.clientX - s.x}px,${e.clientY - s.y}px)`; z.classList.toggle("over", over(e)); if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 20) out.innerHTML = "➡️ …je déplace la souris…"; };
    const pu = e => { if (!s) return; s = null; d.classList.remove("dragging"); d.style.transform = ""; z.classList.remove("over"); if (over(e)) { out.innerHTML = "✅ …et je lâche sur le dossier : rangé !"; z.querySelector(".sc-zin").textContent = "✉️"; d.style.visibility = "hidden"; setTimeout(() => { d.style.visibility = ""; z.querySelector(".sc-zin").textContent = ""; }, 1800); } else out.innerHTML = "↩️ Lâché trop tôt : la lettre revient. On garde le bouton enfoncé jusqu'au dossier !"; };
    d.addEventListener("pointerdown", pd); d.addEventListener("pointermove", pm); d.addEventListener("pointerup", pu);
    return () => { d.removeEventListener("pointerdown", pd); d.removeEventListener("pointermove", pm); d.removeEventListener("pointerup", pu); };
  };
  const mountKb = el => { const h = el.querySelector(".pk-live"); if (!h || !AN.per) return null; const k = AN.per.keyboard(h, { hint: ["ShiftLeft", "CapsLock", "AltRight", "Digit0", "Backspace", "Enter", "Space", "BracketLeft"] }); return () => k.destroy(); };

  /* =================== SÉANCE 1 : la souris =================== */
  const s1 = () => [
    { title: "Avant de commencer 🌱", html: `
      <p class="l-lead">Personne n'est né en sachant utiliser une souris. Ici, <b>on a le droit de se tromper</b>.</p>
      <div class="l-grid3">
        <div class="l-card big" data-reveal="1"><h3>🛟 Rien ne peut se casser</h3><p>Les exercices sont des <b>simulations</b> : on essaie, on recommence.</p></div>
        <div class="l-card big" data-reveal="2"><h3>🐢 Chacun son rythme</h3><p>La vitesse viendra toute seule. D'abord, <b>bien viser</b>.</p></div>
        <div class="l-card big" data-reveal="3"><h3>✋ On lève la main</h3><p>Une question ? Il n'y a pas de question bête : je passe vous voir.</p></div>
      </div>` },

    { title: "Votre souris 🖱️", theme: "dense", mount: mountMouse, html: `
      <div class="sc-mouse-wrap">
        <div class="sc-live fx" title="Cliquez, faites un clic droit, tournez la molette ici">${mouseSVG("blink-left")}<div class="sc-live-out">👉 Cliquez ici, faites un clic droit, tournez la molette…</div></div>
        <div class="sc-mouse-legend">
          <div data-leg="left" data-reveal="1"><i>👆</i><span><b>Le bouton de gauche</b> (sous l'index)<br><small>Le clic gauche <b>agit</b> : ouvrir, valider, choisir.</small></span></div>
          <div data-leg="right" data-reveal="2"><i>👉</i><span><b>Le bouton de droite</b> (sous le majeur)<br><small>Le clic droit <b>explore</b> : un menu avec les options.</small></span></div>
          <div data-leg="wheel" data-reveal="3"><i>🛞</i><span><b>La molette</b>, la petite roue<br><small>Elle fait <b>défiler</b> la page, vers le haut ou le bas.</small></span></div>
        </div></div>` },

    { title: "Bien tenir la souris ✋", html: `
      <div class="sc-hold">
        <div data-reveal="1"><span>🖐️</span><b>La main posée</b><small>sur la souris, sans serrer</small></div>
        <div data-reveal="2"><span>1️⃣</span><b>L'index</b><small>sur le bouton de gauche</small></div>
        <div data-reveal="3"><span>2️⃣</span><b>Le majeur</b><small>sur le bouton de droite</small></div>
        <div data-reveal="4"><span>💪</span><b>Le poignet</b><small>posé sur la table, détendu</small></div>
      </div>
      <div class="l-callout" data-reveal="5">🧭 Au bord du tapis ? Je <b>soulève</b> la souris et je la repose plus loin : en l'air, la flèche ne bouge pas.</div>
      <p class="l-note" data-reveal="6">🎯 Pour cliquer : je <b>vise</b> d'abord, je clique ensuite… et la souris ne bouge pas pendant le clic.</p>` },

    { title: "Agir ou explorer ? 🤔", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>👆 Clic gauche : j'agis</h3><p>J'ouvre, je valide, je coche, je suis un lien.</p></div>
        <div class="l-safe" data-reveal="2"><h3>👉 Clic droit : j'explore</h3><p>Un <b>menu secret</b> s'ouvre : toutes les actions possibles (renommer, imprimer, faire pivoter…).</p></div>
      </div>
      <div class="l-callout" data-reveal="3">⏸️ Avant chaque clic, une seconde : <b>est-ce que je veux agir, ou voir les options ?</b></div>
      <p class="l-note" data-reveal="4">😌 Le clic droit ne casse rien : il ouvre seulement un menu. Pour le refermer sans rien faire : ${kbd("Échap")} ou un clic à côté.</p>` }
  ];

  /* =================== SÉANCE 2 : double-clic, glisser, molette =================== */
  const s2 = () => [
    { title: "Le double-clic : toc-toc ! ✌️", theme: "dense", mount: mountDbl, html: `
      <div class="l-grid2">
        <div>
          <p class="l-lead" data-reveal="1">Deux clics <b>très rapprochés</b>, <b>sans bouger</b> la souris. Ce n'est pas une question de force : c'est le <b>rythme</b>.</p>
          <div class="l-card" data-reveal="2"><h3>🖥️ Sur l'ordinateur</h3><p>Double-clic pour <b>ouvrir</b> un dossier, un fichier, un logiciel. (Un clic seul <b>sélectionne</b> : l'objet devient bleu.)</p></div>
          <div class="l-never" data-reveal="3"><h3>🌐 Sur Internet : un seul clic !</h3><p>Un double-clic peut ouvrir deux fois la page… ou valider deux fois un paiement.</p></div>
        </div>
        <div class="sc-live fx"><div class="sc-demo-folder" tabindex="0"><span>📁</span>Photos</div><div class="sc-live-out">👉 Essayez ici : un clic, puis un double-clic.</div></div>
      </div>` },

    { title: "Glisser-déposer ✊", theme: "dense", mount: mountDrag, html: `
      <div class="sc-steps3">
        <div data-reveal="1"><i>👇</i>J'appuie sur le bouton gauche…</div>
        <div data-reveal="2"><i>✊➡️</i>…je le <b>garde enfoncé</b> et je déplace…</div>
        <div data-reveal="3"><i>🫳</i>…je lâche au-dessus de l'arrivée.</div>
      </div>
      <div class="sc-live fx" style="margin-top:14px"><div class="sc-dragdemo"><div class="sc-file" data-drag><span>✉️</span>lettre.pdf</div><span style="font-size:2em">➡️</span><div class="sc-zone" data-drop style="min-height:90px;max-width:200px"><b>📁 Courrier</b><div class="sc-zin"></div></div></div><div class="sc-live-out">👉 Essayez : rangez la lettre dans le dossier.</div></div>
      <p class="l-note" data-reveal="4">↩️ Lâché au mauvais endroit ? ${kbd("Ctrl")} + ${kbd("Z")} annule, ou on recommence.</p>` },

    { title: "La molette 🛞", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>⬇️ Je la tourne vers moi</h3><p>La page <b>descend</b> : je lis la suite.</p></div>
        <div class="l-card big" data-reveal="2"><h3>⬆️ Je la tourne vers l'écran</h3><p>La page <b>remonte</b>.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">🎯 La flèche doit être <b>sur</b> ce qu'on veut faire défiler (la page, la liste, le menu).</div>
      <p class="l-note" data-reveal="4">💻 Sur un portable, sans souris : <b>deux doigts</b> glissés sur le pavé tactile. Et le clic droit : en bas à droite du pavé.</p>` }
  ];

  /* =================== SÉANCE 3 : le clavier =================== */
  const s3 = () => [
    { title: "Les touches magiques ⌨️", theme: "dense", mount: mountKb, html: `
      <div class="pk-live"></div>
      <div class="sc-keys6">
        <div class="l-card" data-reveal="1"><h3>${kbd("⇧ Maj")} + lettre</h3><small>UNE majuscule (et les chiffres du haut)</small></div>
        <div class="l-card" data-reveal="2"><h3>${kbd("⇩ Verr. Maj")}</h3><small>TOUT en majuscules : une fois pour allumer, une fois pour éteindre</small></div>
        <div class="l-card" data-reveal="3"><h3>${kbd("Alt Gr")} + ${kbd("à 0")} = @</h3><small>l'arobase des adresses e-mail</small></div>
        <div class="l-card" data-reveal="4"><h3>${kbd("⌫ Effacer")}</h3><small>efface la lettre à gauche du curseur</small></div>
        <div class="l-card" data-reveal="5"><h3>${kbd("↵ Entrée")}</h3><small>valider, ou aller à la ligne</small></div>
        <div class="l-card" data-reveal="6"><h3>${kbd("Espace")}</h3><small>entre deux mots</small></div>
      </div>
      <p class="l-note">👉 Tapez sur le clavier de l'ordinateur : les touches s'allument à l'écran !</p>` },

    { title: "Lire avant d'agir 👀", html: `
      <p class="l-lead">Avant de taper ou de cliquer, je lis <b>toute</b> la consigne, jusqu'au bout.</p>
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🧩 « Tapez la lettre a… »</h3><p>« …<b>Attention</b> : ne tapez <b>pas</b> la lettre a. Tapez la lettre e. »</p></div>
        <div class="l-card big" data-reveal="2"><h3>🔵 « Si le rond est rouge… »</h3><p>« …tapez e. <b>S'il est bleu</b>, tapez a. »</p></div>
      </div>
      <div class="l-callout" data-reveal="3">📋 Dans un vrai formulaire, c'est pareil : « <b>sauf</b> », « <b>ne… pas</b> », « <b>en majuscules</b> », « <b>sans espace</b> »… Ces petits mots changent tout !</div>` },

    { title: "Les accents et l'arobase ✍️", theme: "dense", html: `
      <div class="sc-acc">
        ${[["é", "touche 2"], ["è", "touche 7"], ["à", "touche 0"], ["ç", "touche 9"], ["ù", "à droite du M"]].map(([c, t], i) => `<div data-reveal="1"><b>${c}</b><small>${t}<br>sans Maj</small></div>`).join("")}
      </div>
      <div class="l-grid2" style="margin-top:14px">
        <div class="l-card big" data-reveal="2"><h3>^ Le chapeau, en deux temps</h3><p>J'appuie sur ${kbd("^")} (à droite du P) et je <b>lâche</b> : rien ne s'affiche, c'est normal ! Puis ${kbd("e")} : <b>ê</b>.</p><small>Et le tréma ë : ${kbd("⇧ Maj")} + ${kbd("^")}, puis ${kbd("e")}.</small></div>
        <div class="l-safe" data-reveal="3"><h3>@ L'arobase</h3><p>Je garde ${kbd("Alt Gr")} enfoncée (à droite de l'Espace) et j'appuie sur ${kbd("à 0")}.</p><p class="mono">marie.dupont@exemple.fr</p></div>
      </div>` },

    { title: "Le curseur et les corrections ✏️", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>| Le curseur</h3><p>Le petit trait qui clignote : c'est <b>là</b> que le texte s'écrit. Je le place d'un <b>clic</b>. Les flèches ${kbd("←")} ${kbd("→")} l'ajustent.</p></div>
        <div class="l-card big" data-reveal="2"><h3>${kbd("⌫ Effacer")}</h3><p>Efface la lettre <b>à gauche</b> du curseur. (${kbd("Suppr")}, elle, efface à droite.)</p></div>
      </div>
      <div class="l-flips" data-reveal="3">
        ${flip("Bonjoru", "Je clique après « Bonjoru », ⌫ ⌫, puis « ur »", true)}${flip("Je suisà la gare", "Je clique avant « à », puis Espace", true)}${flip("J'ai tout effacé !", "🪄 Ctrl + Z : tout revient", true)}
      </div>
      <div class="l-callout" data-reveal="4">📝 Avant de valider, je <b>relis</b> : majuscule, accents, espaces, ponctuation.</div>` }
  ];

  /* =================== ASSEMBLAGE =================== */
  const cover = (n, title, goals) => ({ theme: "cover", title: `<small class="l-seance">Séance ${n} / 3</small>${title}`, html: `<div class="l-goals">${goals.map(g => `<div data-reveal>${g}</div>`).join("")}</div>` });
  const game = (id, title) => ({ title: `🎮 ${title}`, game: id });
  const end = (levels, demoType, extra = "") => ({ theme: "cover", title: "À vous ! 💻", html: `
      <p class="l-lead">Dans <b>« Mes missions »</b>, faites ${levels}. Chacun à son rythme : je passe vous voir.</p>${extra}
      <div class="l-actions">
        ${demoType ? `<button type="button" class="l-btn" data-lesson-act="demo" data-type="${demoType}">👥 Faire le premier ensemble</button>` : ""}
        <button type="button" class="l-btn alt" data-lesson-act="assign">🚀 Donner le chapitre au groupe</button>
      </div>` });
  const pick = (arr, start) => { const s = arr.find(x => x.title && x.title.startsWith(start)); if (!s) console.warn("Diapositive introuvable :", start); return s; };

  const lessons = () => {
    const A = s1(), B = s2(), C = s3();
    return [
      { id: "s1", title: "Séance 1 : la souris", icon: "🖱️", badge: "Séance 1 · La souris", slides: () => [
        cover(1, "La souris", ["🌱 On a le droit de se tromper", "🖱️ Les boutons et la molette", "✋ Bien tenir la souris", "🤔 Agir ou explorer ?"]),
        pick(A, "Avant de commencer"), pick(A, "Votre souris"), pick(A, "Bien tenir"),
        game("sc_g_bulles", "Le réveil des bulles"),
        pick(A, "Agir ou explorer"), game("sc_g_agir", "Agir ou explorer ?"),
        end("les <b>niveaux 1 et 2</b> : le réveil des bulles, et le menu secret du clic droit", "sc_bulles")] },
      { id: "s2", title: "Séance 2 : double-clic et glisser", icon: "✌️", badge: "Séance 2 · Double-clic, glisser, molette", slides: () => [
        cover(2, "Double-clic, glisser-déposer et molette", ["✌️ Le double-clic : toc-toc !", "✊ Glisser-déposer", "🛞 La molette"]),
        pick(B, "Le double-clic"), game("sc_g_geste", "Faites le bon geste !"),
        pick(B, "Glisser-déposer"), game("sc_g_glisser", "Glisser-déposer, dans l'ordre"),
        pick(B, "La molette"), game("sc_g_vf", "La souris : vrai ou faux ?"),
        end("les <b>niveaux 3 et 4</b> : le double-clic, et le grand ménage (glisser-déposer, molette, potion magique)", "sc_double")] },
      { id: "s3", title: "Séance 3 : le clavier", icon: "⌨️", badge: "Séance 3 · Le clavier", slides: () => [
        cover(3, "Le clavier", ["⌨️ Les touches magiques", "👀 Lire avant d'agir", "✍️ Accents et arobase", "✏️ Le curseur et les corrections"]),
        pick(C, "Les touches magiques"), game("sc_g_touches", "Les touches magiques"),
        pick(C, "Lire avant d'agir"), game("sc_g_lire", "Lire avant d'agir"),
        pick(C, "Les accents"), pick(C, "Le curseur"), game("sc_g_accents", "La dictée des accents"),
        end("les <b>niveaux 5, 6 et 7</b> : les lettres, les accents, le curseur… puis la <b>mission réelle</b> et la dictée finale", "sc_lettres",
          `<div class="l-callout">🖥️ Le niveau 8 se fait sur le <b>vrai ordinateur</b> : clic droit sur le bureau, double-clic sur la Corbeille, quelques lignes dans le Bloc-notes… et la dictée finale.</div>`)] }
    ];
  };

  AN.chapters.register({
    id: "souris_clavier", title: "Souris et clavier", icon: "🖱️", color: "#6a56e6",
    summary: "Le tout premier chapitre, en 3 séances de 30 minutes : viser et cliquer, le clic droit, le double-clic, le glisser-déposer, puis le clavier (majuscules, accents, @, corrections)… jusqu'à une mission sur le vrai ordinateur.",
    duration: "3 séances", parcours: "p_souris_clavier", demo: "sc_bulles",
    demos: [{ type: "sc_menu", label: "Le menu secret (niveau 2)" }, { type: "sc_menage", label: "Le grand ménage (niveau 4)" }, { type: "sc_lettres", label: "Lire avant d'agir (niveau 5)" }, { type: "sc_curseur", label: "Le curseur (niveau 7)" }],
    get lessons() { return lessons(); }
  });
})(window.AN);
