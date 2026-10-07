/* =========================================================
   Chapitre « Périphériques » : 3 séances de 30 minutes.
   Cours court projeté, jeux en direct, puis les exercices
   (8 niveaux, le dernier sur le vrai ordinateur).
   ========================================================= */
(function (AN) {
  "use strict";
  const kbd = k => `<kbd>${k}</kbd>`;
  const flip = (front, back, ok) => `<button type="button" class="l-flip ${ok === true ? "is-ok" : ok === false ? "is-ko" : ""}" data-flip><span class="l-front">${front}</span><span class="l-back">${back}</span></button>`;

  /* ---------- diapositives « en direct » ---------- */
  const mountKb = el => { const h = el.querySelector(".pk-live"); if (!h || !AN.per) return null; const k = AN.per.keyboard(h, { big: true, hint: ["ShiftLeft", "AltRight", "Digit0", "CapsLock", "Backspace", "Enter"] }); return () => k.destroy(); };
  const mountPrint = el => {
    const h = el.querySelector(".pp-live"); if (!h || !AN.per) return null;
    const d = AN.per.printDialog(h, { doc: { title: "Attestation", pages: 3, pageHTML: n => `<div class="logo"></div><b>Attestation</b><span>page ${n}</span><div class="bar"></div><div class="bar" style="width:70%"></div>` } });
    return () => d.destroy();
  };

  /* =================== SÉANCE 1 =================== */
  const s1 = () => [
    { title: "Les périphériques, c'est quoi ? 🔌", html: `
      <p class="l-lead">Tout ce qu'on <b>branche</b> autour de l'ordinateur pour lui parler… ou pour qu'il nous réponde.</p>
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>➡️ J'envoie des infos à l'ordinateur</h3><p>🖱️ la souris · ⌨️ le clavier · 🎤 le micro · 📷 la webcam · 📠 le scanner</p></div>
        <div class="l-card big" data-reveal="2"><h3>⬅️ L'ordinateur me répond</h3><p>🖥️ l'écran · 🖨️ l'imprimante · 🎧 le casque, les haut-parleurs</p></div>
      </div>
      <div class="l-callout" data-reveal="3">💾 Et la <b>clé USB</b> ? Les deux : on y range des fichiers, et on les reprend. Les prises <b>USB</b> sont souvent devant l'ordinateur.</div>` },

    { title: "La souris : 5 gestes 🖱️", theme: "dense", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>👆</span><div><b>Le clic (bouton gauche)</b><small>Sélectionner, appuyer sur un bouton, suivre un lien.</small></div></li>
        <li data-reveal="2"><span>✌️</span><div><b>Le double-clic</b><small>Ouvrir un dossier ou un fichier sur l'ordinateur. Deux clics rapprochés, sans bouger.</small></div></li>
        <li data-reveal="3"><span>👉</span><div><b>Le clic droit</b><small>Un menu de choix : copier, renommer, imprimer…</small></div></li>
        <li data-reveal="4"><span>✊</span><div><b>Glisser-déposer</b><small>Garder le bouton enfoncé, bouger, lâcher au bon endroit.</small></div></li>
        <li data-reveal="5"><span>🛞</span><div><b>La molette</b><small>Faire défiler la page, vers le haut ou vers le bas.</small></div></li>
      </ol>
      <p class="l-note" data-reveal="6">💻 Sur un portable, le <b>pavé tactile</b> fait tout ça : en bas à gauche = clic, en bas à droite = clic droit, deux doigts = défiler.</p>` },

    { title: "Les touches à connaître ⌨️", theme: "dense", mount: mountKb, html: `
      <div class="pk-live"></div>
      <div class="l-grid3" style="margin-top:12px">
        <div class="l-card" data-reveal="1"><h3>${kbd("⇧ Maj")} + lettre</h3><small>une majuscule ; et les chiffres du haut !</small></div>
        <div class="l-card" data-reveal="2"><h3>${kbd("Alt Gr")} + ${kbd("à 0")} = @</h3><small>l'arobase des adresses e-mail</small></div>
        <div class="l-card" data-reveal="3"><h3>${kbd("⇩ Verr. Maj")}</h3><small>TOUT EN MAJUSCULES : une fois pour allumer, une fois pour éteindre</small></div>
      </div>
      <p class="l-note" data-reveal="4">👉 Tapez sur le clavier de l'ordinateur : les touches s'allument à l'écran !</p>` },

    { title: "Copier, coller… et annuler 📋", html: `
      <div class="l-grid3">
        <div class="l-card big" data-reveal="1"><h3>${kbd("Ctrl")} + ${kbd("C")}</h3><p><b>Copier</b> ce qui est sélectionné.</p></div>
        <div class="l-card big" data-reveal="2"><h3>${kbd("Ctrl")} + ${kbd("V")}</h3><p><b>Coller</b> là où clignote le curseur.</p></div>
        <div class="l-safe" data-reveal="3"><h3>${kbd("Ctrl")} + ${kbd("Z")}</h3><p><b>Annuler</b> la dernière action. Le bouton magique !</p></div>
      </div>
      <div class="l-callout" data-reveal="4">🎯 Un numéro de dossier, une adresse e-mail, un IBAN : on le <b>copie-colle</b> au lieu de le recopier. Zéro faute ! (Le clic droit propose aussi Copier et Coller.)</div>` }
  ];

  /* =================== SÉANCE 2 =================== */
  const s2 = () => [
    { title: "La fenêtre d'impression 🖨️", theme: "dense", mount: mountPrint, html: `
      <div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:16px;align-items:start">
        <div class="pp-live"></div>
        <ol class="mm-notes">
          <li><i class="pin">1</i><div><b>${kbd("Ctrl")} + ${kbd("P")}</b><small>ouvre cette fenêtre, presque partout.</small></div></li>
          <li><i class="pin">2</i><div><b>Destination</b><small>quelle imprimante ? (ou « Enregistrer au format PDF »)</small></div></li>
          <li><i class="pin">3</i><div><b>Pages</b><small>Toutes, ou Personnalisées : « 1 », « 1-2 »…</small></div></li>
          <li class="ok"><i class="pin ok">4</i><div><b>Couleur, copies</b><small>Noir et blanc pour un document : moins cher.</small></div></li>
        </ol></div>` },

    { title: "« Imprimer » sans papier : le PDF 💾", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🧾 Garder une confirmation</h3><p>Rendez-vous, billet de train, reçu de paiement… On n'a pas toujours besoin de papier.</p></div>
        <div class="l-safe" data-reveal="2"><h3>💾 Enregistrer au format PDF</h3><p>${kbd("Ctrl")} + ${kbd("P")} › Destination : <b>Enregistrer au format PDF</b> › <b>Enregistrer</b>.</p><p>Le fichier arrive dans <b>Téléchargements</b>.</p></div>
      </div>
      <div class="l-callout" data-reveal="3">📧 Ce PDF peut ensuite être envoyé par e-mail, ou imprimé plus tard, à la médiathèque par exemple.</div>` },

    { title: "L'imprimante n'imprime pas 🛠️", theme: "dense", html: `
      <div class="l-grid2">
        <div class="l-card" data-reveal="1"><h3>📟 Je lis l'écran de l'imprimante</h3><p>« Bac vide », « Bourrage papier »… Elle dit ce qui ne va pas.</p></div>
        <div class="l-card" data-reveal="2"><h3>🖥️ Je regarde la file d'attente</h3><p>« Hors connexion » = éteinte ou débranchée. « Erreur » = document bloqué : je l'<b>annule</b>, puis je relance.</p></div>
      </div>
      <div class="l-flips" data-reveal="3">
        ${flip("Plus de papier", "▤ J'en remets dans le bac", true)}${flip("Hors connexion", "⏻ Je l'allume, je vérifie le câble", true)}${flip("Bourrage", "🔧 J'ouvre le capot, je retire la feuille doucement", true)}
      </div>
      <div class="l-never" data-reveal="4"><h3>🙅 Le piège</h3><p>Recliquer 10 fois sur « Imprimer » : une fois réparée, l'imprimante sortira… 10 exemplaires !</p></div>` }
  ];

  /* =================== SÉANCE 3 =================== */
  const s3 = () => [
    { title: "La clé USB 💾", html: `
      <ol class="l-gestures">
        <li data-reveal="1"><span>🔌</span><div><b>Je la branche</b><small>Elle apparaît dans l'Explorateur, sous « Ce PC » (Clé USB E:).</small></div></li>
        <li data-reveal="2"><span>📄</span><div><b>Je COPIE mes fichiers dessus</b><small>Copier, puis Coller dans la clé : le fichier reste aussi sur l'ordinateur.</small></div></li>
        <li data-reveal="3"><span>⏏️</span><div><b>J'éjecte, puis je la retire</b><small>Clic droit sur la clé › Éjecter. Sinon, le fichier peut être abîmé.</small></div></li>
      </ol>
      <div class="l-never" data-reveal="4"><h3>🚫 Une clé trouvée par terre ?</h3><p>Je ne la branche <b>jamais</b> : elle peut contenir un virus. Je la rapporte à l'accueil.</p></div>` },

    { title: "Mieux voir l'écran 🔍", html: `
      <div class="l-grid2">
        <div class="l-card big" data-reveal="1"><h3>🌐 Sur une page Internet</h3><p>${kbd("Ctrl")} + ${kbd("+")} : agrandir</p><p>${kbd("Ctrl")} + ${kbd("-")} : réduire</p><p>${kbd("Ctrl")} + ${kbd("0")} : revenir à 100 %</p><small>Ou : Ctrl + la molette de la souris.</small></div>
        <div class="l-card big" data-reveal="2"><h3>⚙️ Pour tout l'ordinateur</h3><p>Paramètres › Système › <b>Affichage</b> : taille du texte, luminosité, éclairage nocturne.</p><p>La <b>Loupe</b> : ${kbd("⊞")} + ${kbd("+")} (et ${kbd("⊞")} + ${kbd("Échap")} pour la fermer).</p></div>
      </div>` },

    { title: "Mon aide-mémoire des raccourcis ✨", html: `
      <div class="l-grid3">
        ${[[`${kbd("Ctrl")} + ${kbd("C")} / ${kbd("V")}`, "copier / coller"], [`${kbd("Ctrl")} + ${kbd("Z")}`, "annuler"], [`${kbd("Ctrl")} + ${kbd("A")}`, "tout sélectionner"], [`${kbd("Ctrl")} + ${kbd("P")}`, "imprimer"], [`${kbd("Ctrl")} + ${kbd("+")} / ${kbd("0")}`, "zoom / 100 %"], [`${kbd("Alt Gr")} + ${kbd("à 0")}`, "l'arobase @"]].map(([k, t], i) => `<div class="l-card" data-reveal="${i < 3 ? 1 : 2}" style="text-align:center"><h3>${k}</h3><small>${t}</small></div>`).join("")}
      </div>
      <div class="l-callout" data-reveal="3">🖨️ Ces raccourcis sont aussi dans vos <b>fiches-mémo</b>, à imprimer à la fin de chaque niveau.</div>` }
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
      { id: "s1", title: "Séance 1 : souris et clavier", icon: "⌨️", badge: "Séance 1 · Souris et clavier", slides: () => [
        cover(1, "Souris et clavier", ["🔌 Les périphériques", "🖱️ Les 5 gestes de la souris", "⌨️ Les touches à connaître", "📋 Copier, coller, annuler"]),
        pick(A, "Les périphériques"), game("per_quel", "Quel périphérique ?"),
        pick(A, "La souris"), game("per_geste", "Quel geste de la souris ?"),
        pick(A, "Les touches"), game("per_arobase", "Tape l'adresse e-mail"),
        pick(A, "Copier"),
        end("les <b>niveaux 1, 2 et 3</b> : la souris, le clavier, le copier-coller", "per_souris")] },
      { id: "s2", title: "Séance 2 : imprimer", icon: "🖨️", badge: "Séance 2 · Imprimer", slides: () => [
        cover(2, "Imprimer", ["🖨️ La fenêtre d'impression", "💾 Le PDF sans papier", "🛠️ Quand ça n'imprime pas"]),
        pick(B, "La fenêtre"), game("per_reglage", "Quel réglage ?"), game("per_ordre_impr", "Imprimer, dans l'ordre"),
        pick(B, "« Imprimer »"), pick(B, "L'imprimante"), game("per_diag", "Que dit l'imprimante ?"),
        end("les <b>niveaux 4 et 5</b> : imprimer juste ce qu'il faut, et dépanner l'imprimante", "per_imprimer")] },
      { id: "s3", title: "Séance 3 : clé USB et écran", icon: "💾", badge: "Séance 3 · Clé USB et écran", slides: () => [
        cover(3, "Clé USB, écran et raccourcis", ["💾 La clé USB", "🔍 Mieux voir l'écran", "✨ Les raccourcis à retenir"]),
        pick(C, "La clé USB"), game("per_usb_vf", "Clé USB : vrai ou faux ?"),
        pick(C, "Mieux voir"), pick(C, "Mon aide-mémoire"), game("per_raccourci", "Quel raccourci ?"), game("per_que_faire", "Que faites-vous ?"),
        end("les <b>niveaux 6, 7 et 8</b> : la clé USB, le zoom et le confort… puis la <b>mission réelle</b> sur l'ordinateur de la médiathèque", "per_usb",
          `<div class="l-callout">🖥️ Le niveau 8 se fait sur le <b>vrai ordinateur</b> : on cherche les prises USB, on ouvre Ctrl + P… et on clique sur <b>Annuler</b>.</div>`)] }
    ];
  };

  AN.chapters.register({
    id: "peripheriques", title: "Périphériques", icon: "🖨️", color: "#8a4fbf",
    summary: "3 séances de 30 minutes : la souris, le clavier et le copier-coller, l'impression et ses pannes, la clé USB et le confort de l'écran… jusqu'à une mission sur le vrai ordinateur.",
    duration: "3 séances", parcours: "p_peripheriques", demo: "per_souris",
    demos: [{ type: "per_clavier", label: "Le clavier ensemble (niveau 2)" }, { type: "per_imprimer", label: "Imprimer ensemble (niveau 4)" }, { type: "per_usb", label: "La clé USB (niveau 6)" }],
    get lessons() { return lessons(); }
  });
})(window.AN);
